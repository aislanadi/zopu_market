/**
 * License expiration notification system
 */

import { getDb } from "../db";
import { buyers, partners, licenseNotifications, users } from "../../drizzle/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { notifyOwner } from "./notification";
import { calculateLicenseStatus, getDaysUntilExpiry } from "./licenseHelper";

type NotificationType = "90_DAYS" | "60_DAYS" | "30_DAYS" | "EXPIRED";

/**
 * Check all buyers for license expirations and send notifications
 * Should be run daily via cron job
 */
export async function checkLicenseExpirations(): Promise<{
  checked: number;
  notified: number;
  details: Array<{ buyerId: number; type: NotificationType; company: string }>;
}> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todos os compradores com licença informada
  const buyersWithLicense = await db
    .select()
    .from(buyers)
    .where(and(
      isNotNull(buyers.bitrixLicenseExpiry),
      eq(buyers.status, "ACTIVE")
    ));

  const notified: Array<{ buyerId: number; type: NotificationType; company: string }> = [];

  for (const buyer of buyersWithLicense) {
    const daysUntil = getDaysUntilExpiry(buyer.bitrixLicenseExpiry);
    
    if (daysUntil === null) continue;

    // Determinar tipo de notificação
    let notificationType: NotificationType | null = null;
    
    if (daysUntil <= 0) {
      notificationType = "EXPIRED";
    } else if (daysUntil <= 30) {
      notificationType = "30_DAYS";
    } else if (daysUntil <= 60) {
      notificationType = "60_DAYS";
    } else if (daysUntil <= 90) {
      notificationType = "90_DAYS";
    }

    if (!notificationType) continue;

    // Verificar se já enviou notificação deste tipo para esta data de vencimento
    const existingNotification = await db
      .select()
      .from(licenseNotifications)
      .where(and(
        eq(licenseNotifications.buyerId, buyer.id),
        eq(licenseNotifications.notificationType, notificationType),
        eq(licenseNotifications.licenseExpiryDate, buyer.bitrixLicenseExpiry!)
      ))
      .limit(1);

    if (existingNotification.length > 0) {
      // Já notificou
      continue;
    }

    // Enviar notificação
    const success = await sendLicenseExpirationNotification(buyer, notificationType, daysUntil);

    if (success) {
      // Registrar notificação enviada
      await db.insert(licenseNotifications).values({
        buyerId: buyer.id,
        notificationType,
        licenseExpiryDate: buyer.bitrixLicenseExpiry!,
      });

      notified.push({
        buyerId: buyer.id,
        type: notificationType,
        company: buyer.nomeFantasia || buyer.razaoSocial || "Empresa",
      });
    }
  }

  return {
    checked: buyersWithLicense.length,
    notified: notified.length,
    details: notified,
  };
}

/**
 * Send license expiration notification to owner
 */
async function sendLicenseExpirationNotification(
  buyer: any,
  type: NotificationType,
  daysUntil: number
): Promise<boolean> {
  const company = buyer.nomeFantasia || buyer.razaoSocial || "Empresa";
  const licenseType = buyer.bitrixLicenseType || "Bitrix24";
  
  let title = "";
  let content = "";

  switch (type) {
    case "90_DAYS":
      title = `🔔 Licença vencendo em 90 dias - ${company}`;
      content = `A licença ${licenseType} da empresa ${company} vence em ${daysUntil} dias. Entre em contato para iniciar o processo de renovação.`;
      break;
    case "60_DAYS":
      title = `⚠️ Licença vencendo em 60 dias - ${company}`;
      content = `A licença ${licenseType} da empresa ${company} vence em ${daysUntil} dias. Urgente: agende reunião de renovação.`;
      break;
    case "30_DAYS":
      title = `🚨 Licença vencendo em 30 dias - ${company}`;
      content = `ATENÇÃO: A licença ${licenseType} da empresa ${company} vence em ${daysUntil} dias! Priorize a renovação.`;
      break;
    case "EXPIRED":
      title = `❌ Licença VENCIDA - ${company}`;
      content = `A licença ${licenseType} da empresa ${company} VENCEU! Contate o cliente imediatamente para renovação.`;
      break;
  }

  // Adicionar informações de contato
  if (buyer.whatsapp || buyer.telefone) {
    content += `\n\nContato: ${buyer.whatsapp || buyer.telefone}`;
  }
  if (buyer.bitrixUrl) {
    content += `\nInstância: ${buyer.bitrixUrl}`;
  }

  return await notifyOwner({ title, content });
}

/**
 * Get buyers with licenses expiring soon (for admin dashboard)
 */
export async function getLicensesExpiring(days: number = 90): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + days);

  // Buscar licenças de compradores
  const buyersResult = await db
    .select()
    .from(buyers)
    .where(and(
      isNotNull(buyers.bitrixLicenseExpiry),
      eq(buyers.status, "ACTIVE"),
      sql`${buyers.bitrixLicenseExpiry} <= ${targetDate}`
    ));

  // Buscar licenças de parceiros
  const partnersResult = await db
    .select()
    .from(partners)
    .where(and(
      isNotNull(partners.bitrix24LicenseExpiry),
      eq(partners.curationStatus, "APPROVED")
    ));

  // Buscar usuários associados para verificar se ainda existem
  const buyerUserIds = buyersResult.map(b => b.userId);
  const partnerUserIds = partnersResult.map(p => p.id); // partners não tem userId direto

  // Verificar quais usuários ainda existem
  const existingUsers = buyerUserIds.length > 0 
    ? await db.select({ id: users.id }).from(users).where(sql`${users.id} IN (${sql.join(buyerUserIds, sql`, `)})`)
    : [];
  const existingUserIds = new Set(existingUsers.map(u => u.id));

  // Unificar resultados
  const allLicenses = [
    ...buyersResult.map(buyer => ({
      id: buyer.id,
      userId: buyer.userId,
      type: "buyer" as const,
      companyName: buyer.nomeFantasia || buyer.razaoSocial || "Empresa",
      cnpj: buyer.cnpj,
      bitrixUrl: buyer.bitrixUrl,
      bitrixWebhook: buyer.bitrix24Webhook,
      licenseExpiry: buyer.bitrixLicenseExpiry,
      licenseType: buyer.bitrixLicenseType || "Bitrix24",
      contactName: null,
      contactEmail: null,
      whatsapp: buyer.whatsapp,
      telefone: buyer.telefone,
      entityExists: existingUserIds.has(buyer.userId),
      profileUrl: `/admin/buyers/${buyer.id}`,
      daysUntilExpiry: getDaysUntilExpiry(buyer.bitrixLicenseExpiry),
      licenseStatus: calculateLicenseStatus(buyer.bitrixLicenseExpiry),
    })),
    ...partnersResult
      .filter(partner => partner.bitrix24LicenseExpiry && partner.bitrix24LicenseExpiry <= targetDate)
      .map(partner => ({
        id: partner.id,
        userId: null,
        type: "partner" as const,
        companyName: partner.companyName,
        cnpj: partner.cnpj,
        bitrixUrl: partner.bitrix24Url,
        bitrixWebhook: partner.bitrix24Webhook,
        licenseExpiry: partner.bitrix24LicenseExpiry,
        licenseType: "Bitrix24",
        contactName: partner.contactName,
        contactEmail: partner.contactEmail,
        whatsapp: null,
        telefone: partner.contactPhone,
        entityExists: true, // Partners sempre existem se estão na query
        profileUrl: `/admin/partners/${partner.id}`,
        daysUntilExpiry: getDaysUntilExpiry(partner.bitrix24LicenseExpiry),
        licenseStatus: calculateLicenseStatus(partner.bitrix24LicenseExpiry),
      }))
  ];

  // Ordenar por data de vencimento
  return allLicenses.sort((a, b) => {
    if (!a.licenseExpiry) return 1;
    if (!b.licenseExpiry) return -1;
    return a.licenseExpiry.getTime() - b.licenseExpiry.getTime();
  });
}
