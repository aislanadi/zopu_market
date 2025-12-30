/**
 * License metrics and analytics
 */

import { getDb } from "../db";
import { buyers, partners } from "../../drizzle/schema";
import { and, eq, isNotNull, sql } from "drizzle-orm";
import { calculateLicenseStatus, getDaysUntilExpiry } from "./licenseHelper";

export interface LicenseMetrics {
  // KPIs gerais
  totalLicenses: number;
  activeLicenses: number;
  expiringLicenses: number; // Vencendo em 30 dias
  expiredLicenses: number;
  
  // Distribuição por status
  statusDistribution: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  
  // Distribuição por tipo (buyer vs partner)
  typeDistribution: Array<{
    type: string;
    count: number;
  }>;
  
  // Vencimentos por mês (próximos 12 meses)
  expirationsByMonth: Array<{
    month: string;
    count: number;
    buyers: number;
    partners: number;
  }>;
  
  // Timeline de vencimentos (próximos 90 dias agrupados por semana)
  expirationTimeline: Array<{
    week: string;
    count: number;
  }>;
  
  // Top 10 licenças vencendo primeiro
  upcomingExpirations: Array<{
    id: number;
    type: "buyer" | "partner";
    companyName: string;
    licenseExpiry: Date;
    daysUntil: number;
  }>;
}

/**
 * Get comprehensive license metrics for dashboard
 */
export async function getLicenseMetrics(): Promise<LicenseMetrics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar todos os buyers com licença
  const buyersWithLicense = await db
    .select()
    .from(buyers)
    .where(and(
      isNotNull(buyers.bitrixLicenseExpiry),
      eq(buyers.status, "ACTIVE")
    ));

  // Buscar todos os partners com licença
  const partnersWithLicense = await db
    .select()
    .from(partners)
    .where(and(
      isNotNull(partners.bitrix24LicenseExpiry),
      eq(partners.curationStatus, "APPROVED")
    ));

  // Unificar dados
  const allLicenses = [
    ...buyersWithLicense.map(b => ({
      id: b.id,
      type: "buyer" as const,
      companyName: b.nomeFantasia || b.razaoSocial || "Empresa",
      licenseExpiry: b.bitrixLicenseExpiry!,
      daysUntil: getDaysUntilExpiry(b.bitrixLicenseExpiry),
      status: calculateLicenseStatus(b.bitrixLicenseExpiry),
    })),
    ...partnersWithLicense.map(p => ({
      id: p.id,
      type: "partner" as const,
      companyName: p.companyName,
      licenseExpiry: p.bitrix24LicenseExpiry!,
      daysUntil: getDaysUntilExpiry(p.bitrix24LicenseExpiry),
      status: calculateLicenseStatus(p.bitrix24LicenseExpiry),
    }))
  ];

  // Calcular KPIs
  const totalLicenses = allLicenses.length;
  const activeLicenses = allLicenses.filter(l => l.status === "ATIVA").length;
  const expiringLicenses = allLicenses.filter(l => l.status === "VENCENDO" && l.daysUntil !== null && l.daysUntil <= 30).length;
  const expiredLicenses = allLicenses.filter(l => l.status === "VENCIDA").length;

  // Distribuição por status
  const statusCounts = {
    ATIVA: allLicenses.filter(l => l.status === "ATIVA").length,
    VENCENDO: allLicenses.filter(l => l.status === "VENCENDO").length,
    VENCIDA: allLicenses.filter(l => l.status === "VENCIDA").length,
    NAO_INFORMADA: allLicenses.filter(l => l.status === "NAO_INFORMADA").length,
  };

  const statusDistribution = Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: totalLicenses > 0 ? Math.round((count / totalLicenses) * 100) : 0,
  }));

  // Distribuição por tipo
  const typeDistribution = [
    { type: "Compradores", count: buyersWithLicense.length },
    { type: "Parceiros", count: partnersWithLicense.length },
  ];

  // Vencimentos por mês (próximos 12 meses)
  const expirationsByMonth = getExpirationsByMonth(allLicenses);

  // Timeline de vencimentos (próximos 90 dias por semana)
  const expirationTimeline = getExpirationTimeline(allLicenses);

  // Top 10 licenças vencendo primeiro
  const upcomingExpirations = allLicenses
    .filter(l => l.daysUntil !== null && l.daysUntil >= 0)
    .sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0))
    .slice(0, 10)
    .map(l => ({
      id: l.id,
      type: l.type,
      companyName: l.companyName,
      licenseExpiry: l.licenseExpiry,
      daysUntil: l.daysUntil!,
    }));

  return {
    totalLicenses,
    activeLicenses,
    expiringLicenses,
    expiredLicenses,
    statusDistribution,
    typeDistribution,
    expirationsByMonth,
    expirationTimeline,
    upcomingExpirations,
  };
}

/**
 * Group licenses by month for next 12 months
 */
function getExpirationsByMonth(licenses: any[]): Array<{
  month: string;
  count: number;
  buyers: number;
  partners: number;
}> {
  const now = new Date();
  const months: Array<{ month: string; count: number; buyers: number; partners: number }> = [];

  for (let i = 0; i < 12; i++) {
    const targetDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
    const monthName = targetDate.toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
    
    const licensesInMonth = licenses.filter(l => {
      if (!l.licenseExpiry) return false;
      const expiry = new Date(l.licenseExpiry);
      return expiry.getMonth() === targetDate.getMonth() && 
             expiry.getFullYear() === targetDate.getFullYear();
    });

    months.push({
      month: monthName,
      count: licensesInMonth.length,
      buyers: licensesInMonth.filter(l => l.type === "buyer").length,
      partners: licensesInMonth.filter(l => l.type === "partner").length,
    });
  }

  return months;
}

/**
 * Group licenses by week for next 90 days
 */
function getExpirationTimeline(licenses: any[]): Array<{
  week: string;
  count: number;
}> {
  const now = new Date();
  const weeks: Array<{ week: string; count: number }> = [];

  for (let i = 0; i < 13; i++) { // 13 semanas = ~90 dias
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() + (i * 7));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const weekLabel = `${weekStart.getDate()}/${weekStart.getMonth() + 1}`;
    
    const licensesInWeek = licenses.filter(l => {
      if (!l.licenseExpiry) return false;
      const expiry = new Date(l.licenseExpiry);
      return expiry >= weekStart && expiry <= weekEnd;
    });

    weeks.push({
      week: weekLabel,
      count: licensesInWeek.length,
    });
  }

  return weeks;
}
