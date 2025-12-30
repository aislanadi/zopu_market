import { eq, and, or, desc, sql, gte, lte, like } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  categories, 
  partners, 
  offers, 
  leadRequests, 
  referrals, 
  orders, 
  auditLogs,
  reviews,
  favorites,
  notifications,
  serviceContracts,
  userInvitations,
  partnerCases,
  analytics,
  buyers,
  coupons,
  couponUsages,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER HELPERS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    // Verificar se o email corresponde a um parceiro aprovado
    // e associar automaticamente (sempre verifica, mesmo se já tiver role/partnerId)
    if (user.email) {
      const approvedPartner = await db
        .select()
        .from(partners)
        .where(and(
          eq(partners.contactEmail, user.email),
          eq(partners.curationStatus, "APPROVED")
        ))
        .limit(1);
      
      if (approvedPartner.length > 0) {
        const partner = approvedPartner[0];
        // Só atualiza se não tiver role definido ou se o partnerId estiver diferente
        if (!user.role || user.partnerId !== partner.id) {
          values.role = "parceiro";
          values.partnerId = partner.id;
          updateSet.role = "parceiro";
          updateSet.partnerId = partner.id;
          console.log(`[Auto-Associate] Usuário ${user.email} associado automaticamente ao parceiro ${partner.id}`);
        }
      }
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.partnerId !== undefined) {
      values.partnerId = user.partnerId;
      updateSet.partnerId = user.partnerId;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(users).orderBy(desc(users.createdAt));
}

export async function updateUserRole(userId: number, role: "admin" | "gerente_contas" | "parceiro" | "cliente", partnerId?: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: any = { role };
  if (partnerId !== undefined) {
    updateData.partnerId = partnerId;
  }
  
  await db.update(users).set(updateData).where(eq(users.id, userId));
}

export async function searchUsers(query: string) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  return db.select().from(users)
    .where(
      sql`LOWER(${users.name}) LIKE LOWER(${searchPattern}) OR LOWER(${users.email}) LIKE LOWER(${searchPattern})`
    )
    .orderBy(desc(users.createdAt));
}

export async function deleteUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(users).where(eq(users.id, userId));
}

// ============ CATEGORY HELPERS ============

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.name);
}

export async function getCategoryById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(categories).where(eq(categories.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: typeof categories.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(categories).values(data);
  return result;
}

export async function updateCategory(id: number, data: Partial<typeof categories.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(categories).set(data).where(eq(categories.id, id));
}

export async function deleteCategory(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(categories).where(eq(categories.id, id));
}

// ============ PARTNER HELPERS ============

export async function getAllPartners() {
  const db = await getDb();
  if (!db) return [];
  // Ordenar por tier (PREMIUM primeiro) e depois por data de criação
  return db.select().from(partners).orderBy(
    desc(sql`CASE WHEN ${partners.tier} = 'PREMIUM' THEN 1 ELSE 0 END`),
    desc(partners.createdAt)
  );
}

export async function getPartnerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(partners).where(eq(partners.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getPartnersByStatus(status: "PENDING" | "APPROVED" | "REJECTED") {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(partners).where(eq(partners.curationStatus, status)).orderBy(desc(partners.createdAt));
}

export async function createPartner(data: typeof partners.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(partners).values(data);
  return result;
}

export async function updatePartner(id: number, data: Partial<typeof partners.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(partners).set(data).where(eq(partners.id, id));
}

export async function deletePartner(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(partners).where(eq(partners.id, id));
}

// ============ OFFER HELPERS ============

export async function getAllOffers(filters?: {
  categoryId?: number;
  offerType?: string;
  partnerId?: number;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(offers);
  
  const conditions = [];
  if (filters?.categoryId) conditions.push(eq(offers.categoryId, filters.categoryId));
  if (filters?.offerType) conditions.push(eq(offers.offerType, filters.offerType as any));
  if (filters?.partnerId) conditions.push(eq(offers.partnerId, filters.partnerId));
  if (filters?.status) conditions.push(eq(offers.status, filters.status as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(offers.createdAt));
}

export async function getOfferById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(offers).where(eq(offers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOffersByPartner(partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(offers)
    .where(and(eq(offers.partnerId, partnerId), eq(offers.status, "PUBLISHED" as any)))
    .orderBy(desc(offers.createdAt));
}

export async function getPendingOffers() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(offers)
    .where(eq(offers.status, "PENDING_INTERVIEW" as any))
    .orderBy(desc(offers.createdAt));
}

export async function createOffer(data: typeof offers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(offers).values(data);
  return result;
}

export async function updateOffer(id: number, data: Partial<typeof offers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(offers).set(data).where(eq(offers.id, id));
}

export async function deleteOffer(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(offers).where(eq(offers.id, id));
}

// ============ LEAD REQUEST HELPERS ============

export async function createLeadRequest(data: typeof leadRequests.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(leadRequests).values(data);
  return result;
}

export async function getLeadRequestById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(leadRequests).where(eq(leadRequests.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============ REFERRAL HELPERS ============

export async function createReferral(data: typeof referrals.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(referrals).values(data);
  return result;
}

export async function getReferralById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(referrals).where(eq(referrals.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getReferralsByPartner(partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(referrals).where(eq(referrals.partnerId, partnerId)).orderBy(desc(referrals.createdAt));
}

export async function getReferralsByGerente(gerenteId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(referrals).where(eq(referrals.gerenteId, gerenteId)).orderBy(desc(referrals.createdAt));
}

export async function updateReferral(id: number, data: Partial<typeof referrals.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(referrals).set(data).where(eq(referrals.id, id));
}

export async function getOverdueReferrals() {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db.select().from(referrals)
    .where(and(
      eq(referrals.status, "SENT"),
      sql`${referrals.ackDeadline} < ${now}`
    ))
    .orderBy(referrals.ackDeadline);
}

// ============ ORDER HELPERS ============

export async function createOrder(data: typeof orders.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(orders).values(data);
  return result;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByBuyer(buyerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(orders).where(eq(orders.buyerId, buyerId)).orderBy(desc(orders.createdAt));
}

export async function updateOrder(id: number, data: Partial<typeof orders.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(orders).set(data).where(eq(orders.id, id));
}

// ============ AUDIT LOG HELPERS ============

export async function createAuditLog(data: typeof auditLogs.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(filters?: {
  userId?: number;
  entityType?: string;
  entityId?: number;
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(auditLogs);
  
  const conditions = [];
  if (filters?.userId) conditions.push(eq(auditLogs.userId, filters.userId));
  if (filters?.entityType) conditions.push(eq(auditLogs.entityType, filters.entityType));
  if (filters?.entityId) conditions.push(eq(auditLogs.entityId, filters.entityId));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  const results = await query.orderBy(desc(auditLogs.createdAt)).limit(filters?.limit || 100);
  return results;
}

// ============ REVIEW HELPERS ============

export async function getReviewsByPartner(partnerId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(reviews).where(eq(reviews.partnerId, partnerId)).orderBy(desc(reviews.createdAt));
}

export async function getAllReviews() {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(reviews).orderBy(desc(reviews.createdAt));
}

export async function createReview(data: typeof reviews.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reviews).values(data);
  return result;
}


// ==================== FAVORITES ====================

export async function addFavorite(userId: string, offerId: number | null, partnerId: number | null, type: "offer" | "partner") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(favorites).values({
    userId,
    offerId,
    partnerId,
    type,
  });
  return result.insertId;
}

export async function removeFavorite(userId: string, offerId: number | null, partnerId: number | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(favorites).where(
    and(
      eq(favorites.userId, userId),
      offerId ? eq(favorites.offerId, offerId) : eq(favorites.partnerId, partnerId!)
    )
  );
}

export async function getFavoritesByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(favorites).where(eq(favorites.userId, userId));
}

export async function isFavorite(userId: string, offerId: number | null, partnerId: number | null): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const result = await db.select().from(favorites).where(
    and(
      eq(favorites.userId, userId),
      offerId ? eq(favorites.offerId, offerId) : eq(favorites.partnerId, partnerId!)
    )
  ).limit(1);
  return result.length > 0;
}

// === Notifications ===

export async function createNotification(data: {
  userId: string;
  type: "lead" | "review" | "message" | "system";
  title: string;
  message: string;
  link?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(notifications).values(data);
  return { id: Number(result.insertId) };
}

export async function getNotificationsByUser(userId: string) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt));
}

export async function getUnreadNotificationsCount(userId: string) {
  const db = await getDb();
  if (!db) return 0;
  const result = await db.select({ count: sql<number>`count(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, 0)));
  return Number(result[0]?.count) || 0;
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(notifications).set({ read: 1 }).where(eq(notifications.id, id));
}

export async function markAllNotificationsAsRead(userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(notifications).set({ read: 1 }).where(eq(notifications.userId, userId));
}


// ============ SERVICE CONTRACTS ============

export async function createServiceContract(data: {
  userId: number;
  offerId: number;
  partnerId: number;
  contractDate: Date;
  value?: string;
  period?: string;
  comments?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  try {
    console.log('[createServiceContract] Input data:', JSON.stringify(data, null, 2));
    
    const result = await db.insert(serviceContracts).values({
      userId: data.userId,
      offerId: data.offerId,
      partnerId: data.partnerId,
      contractDate: data.contractDate,
      value: data.value || null,
      period: data.period || null,
      comments: data.comments || null,
      verified: 0,
    });
    
    console.log('[createServiceContract] Success:', result);
    return { success: true };
  } catch (error: any) {
    console.error('[createServiceContract] Error:', error.message);
    console.error('[createServiceContract] Stack:', error.stack);
    throw new Error(`Failed to create service contract: ${error.message}`);
  }
}

export async function checkContractEligibility(userId: number, offerId: number) {
  const db = await getDb();
  if (!db) return { canReview: false, hasPendingContract: false };
  
  const contracts = await db
    .select()
    .from(serviceContracts)
    .where(and(eq(serviceContracts.userId, userId), eq(serviceContracts.offerId, offerId)))
    .limit(1);
  
  if (contracts.length === 0) {
    return { canReview: false, hasPendingContract: false };
  }
  
  const contract = contracts[0];
  const canReview = contract.verified === 1;
  const hasPendingContract = contract.verified === 0;
  
  return { canReview, hasPendingContract };
}

export async function getUserContracts(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(serviceContracts)
    .where(eq(serviceContracts.userId, userId))
    .orderBy(desc(serviceContracts.createdAt));
}

// ============ USER INVITATIONS ============

export async function createUserInvitation(data: {
  email: string;
  name?: string;
  createdBy: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Gerar token único
  const token = Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('');
  
  // Expira em 7 dias
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  
  await db.insert(userInvitations).values({
    token,
    email: data.email,
    name: data.name || null,
    expiresAt,
    createdBy: data.createdBy,
  });
  
  return { token, expiresAt };
}

export async function getInvitationByToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  
  const invitations = await db
    .select()
    .from(userInvitations)
    .where(eq(userInvitations.token, token))
    .limit(1);
  
  return invitations[0] || null;
}

export async function markInvitationAsUsed(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(userInvitations)
    .set({ usedAt: new Date() })
    .where(eq(userInvitations.token, token));
}

export async function listInvitations() {
  const db = await getDb();
  if (!db) return [];
  
  return await db
    .select()
    .from(userInvitations)
    .orderBy(desc(userInvitations.createdAt));
}


// ============ PARTNER CASES HELPERS ============

export async function getCasesByPartner(partnerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(partnerCases)
    .where(and(
      eq(partnerCases.partnerId, partnerId),
      eq(partnerCases.isPublished, 1)
    ))
    .orderBy(partnerCases.displayOrder, desc(partnerCases.createdAt));
}

export async function getAllCasesByPartner(partnerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.select().from(partnerCases)
    .where(eq(partnerCases.partnerId, partnerId))
    .orderBy(partnerCases.displayOrder, desc(partnerCases.createdAt));
}

export async function getCaseById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.select().from(partnerCases).where(eq(partnerCases.id, id));
  return result[0];
}

export async function createPartnerCase(data: typeof partnerCases.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  const result = await db.insert(partnerCases).values(data);
  return result;
}

export async function updatePartnerCase(id: number, data: Partial<typeof partnerCases.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.update(partnerCases).set(data).where(eq(partnerCases.id, id));
}

export async function deletePartnerCase(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  return await db.delete(partnerCases).where(eq(partnerCases.id, id));
}


export async function getPendingContracts() {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  const contracts = await db
    .select()
    .from(serviceContracts)
    .leftJoin(users, eq(serviceContracts.userId, users.id))
    .leftJoin(offers, eq(serviceContracts.offerId, offers.id))
    .leftJoin(partners, eq(serviceContracts.partnerId, partners.id))
    .where(eq(serviceContracts.verified, 0))
    .orderBy(desc(serviceContracts.createdAt));
  
  // Formatar resultado
  return contracts.map((row: any) => ({
    id: row.serviceContracts.id,
    userId: row.serviceContracts.userId,
    offerId: row.serviceContracts.offerId,
    partnerId: row.serviceContracts.partnerId,
    contractDate: row.serviceContracts.contractDate,
    contractValue: row.serviceContracts.value,
    contractPeriod: row.serviceContracts.period,
    comments: row.serviceContracts.comments,
    verified: row.serviceContracts.verified,
    createdAt: row.serviceContracts.createdAt,
    user: row.users ? {
      id: row.users.id,
      name: row.users.name,
      email: row.users.email,
    } : null,
    offer: row.offers ? {
      id: row.offers.id,
      title: row.offers.title,
      partner: row.partners ? {
        id: row.partners.id,
        companyName: row.partners.companyName,
      } : null,
    } : null,
  }));
}

export async function approveContract(contractId: number, comment?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  await db
    .update(serviceContracts)
    .set({ verified: 1 })
    .where(eq(serviceContracts.id, contractId));
  
  // TODO: Enviar notificação ao usuário informando aprovação
  if (comment) {
    console.log(`[Contract ${contractId}] Aprovado com comentário: ${comment}`);
  }
  
  return { success: true };
}

export async function rejectContract(contractId: number, comment: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not initialized");
  
  // Marcar como rejeitado (verified = -1)
  await db
    .update(serviceContracts)
    .set({ verified: -1 })
    .where(eq(serviceContracts.id, contractId));
  
  // TODO: Enviar notificação ao usuário informando rejeição com motivo
  console.log(`[Contract ${contractId}] Rejeitado. Motivo: ${comment}`);
  
  return { success: true };
}

// Atribuir badge "Preferido da Comunidade" automaticamente
export async function updateCommunityFavoriteBadges() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Buscar parceiros com 10+ contratos verificados
  const partnersWithManyContracts = await db
    .select({
      partnerId: serviceContracts.partnerId,
      contractCount: sql<number>`COUNT(*)`,
    })
    .from(serviceContracts)
    .where(eq(serviceContracts.verified, 1))
    .groupBy(serviceContracts.partnerId)
    .having(sql`COUNT(*) >= 10`);

  // Atualizar badges dos parceiros
  for (const { partnerId } of partnersWithManyContracts) {
    const partner = await db
      .select()
      .from(partners)
      .where(eq(partners.id, partnerId))
      .limit(1);

    if (partner.length > 0) {
      const currentBadges = partner[0].badges ? JSON.parse(partner[0].badges) : [];
      
      // Adicionar badge se não existir
      if (!currentBadges.includes("community_favorite")) {
        currentBadges.push("community_favorite");
        
        await db
          .update(partners)
          .set({ badges: JSON.stringify(currentBadges) })
          .where(eq(partners.id, partnerId));
      }
    }
  }

  return { success: true, updated: partnersWithManyContracts.length };
}


// Unified search function
export async function unifiedSearch(query: string) {
  const database = await getDb();
  if (!database) throw new Error("Database not available");
  
  const searchTerm = `%${query.toLowerCase()}%`;

  // Search offers
  const offerResults = await database
    .select({
      id: offers.id,
      title: offers.title,
      description: offers.description,
      partnerName: partners.companyName,
    })
    .from(offers)
    .leftJoin(partners, eq(offers.partnerId, partners.id))
    .where(
      and(
        eq(offers.status, "PUBLISHED"),
        or(
          sql`LOWER(${offers.title}) LIKE ${searchTerm}`,
          sql`LOWER(${offers.description}) LIKE ${searchTerm}`
        )
      )
    )
    .limit(5);

  // Search partners
  const partnerResults = await database
    .select({
      id: partners.id,
      companyName: partners.companyName,
      description: partners.description,
    })
    .from(partners)
    .where(
      or(
        sql`LOWER(${partners.companyName}) LIKE ${searchTerm}`,
        sql`LOWER(${partners.description}) LIKE ${searchTerm}`
      )
    )
    .limit(5);

  // Search categories
  const categoryResults = await database
    .select({
      id: categories.id,
      name: categories.name,
      description: categories.description,
    })
    .from(categories)
    .where(sql`LOWER(${categories.name}) LIKE ${searchTerm}`)
    .limit(3);

  return {
    offers: offerResults,
    partners: partnerResults,
    categories: categoryResults,
  };
}


// ============ ANALYTICS HELPERS ============

export async function trackEvent(data: {
  partnerId?: number;
  offerId?: number;
  eventType: string;
  metadata?: any;
}) {
  const db = await getDb();
  if (!db) return;

  await db.insert(analytics).values({
    partnerId: data.partnerId || null,
    offerId: data.offerId || null,
    eventType: data.eventType,
    metadata: data.metadata ? JSON.stringify(data.metadata) : null,
  });
}

export async function getPartnerMetrics(partnerId: number, startDate?: Date, endDate?: Date) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const dateFilter = startDate && endDate 
    ? and(
        gte(analytics.createdAt, startDate),
        lte(analytics.createdAt, endDate)
      )
    : undefined;

  // Profile views over time
  const profileViews = await db
    .select({
      date: sql<string>`DATE(${analytics.createdAt})`.as('view_date'),
      count: sql<number>`COUNT(*)`,
    })
    .from(analytics)
    .where(
      and(
        eq(analytics.partnerId, partnerId),
        eq(analytics.eventType, "profile_view"),
        dateFilter
      )
    )
    .groupBy(sql`view_date`)
    .orderBy(sql`view_date`);

  // Leads generated by offer
  const leadsByOffer = await db
    .select({
      offerId: analytics.offerId,
      offerTitle: offers.title,
      count: sql<number>`COUNT(*)`,
    })
    .from(analytics)
    .leftJoin(offers, eq(analytics.offerId, offers.id))
    .where(
      and(
        eq(analytics.partnerId, partnerId),
        eq(analytics.eventType, "lead_generated"),
        dateFilter
      )
    )
    .groupBy(analytics.offerId, offers.title);

  // WhatsApp clicks over time
  const whatsappClicks = await db
    .select({
      date: sql<string>`DATE(${analytics.createdAt})`.as('click_date'),
      count: sql<number>`COUNT(*)`,
    })
    .from(analytics)
    .where(
      and(
        eq(analytics.partnerId, partnerId),
        eq(analytics.eventType, "whatsapp_click"),
        dateFilter
      )
    )
    .groupBy(sql`click_date`)
    .orderBy(sql`click_date`);

  // Total metrics
  const totalViews = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(analytics)
    .where(
      and(
        eq(analytics.partnerId, partnerId),
        eq(analytics.eventType, "profile_view"),
        dateFilter
      )
    );

  const totalLeads = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(analytics)
    .where(
      and(
        eq(analytics.partnerId, partnerId),
        eq(analytics.eventType, "lead_generated"),
        dateFilter
      )
    );

  const totalWhatsAppClicks = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(analytics)
    .where(
      and(
        eq(analytics.partnerId, partnerId),
        eq(analytics.eventType, "whatsapp_click"),
        dateFilter
      )
    );

  // Rating evolution (from reviews table)
  const ratingEvolution = await db
    .select({
      date: sql<string>`DATE(${reviews.createdAt})`.as('rating_date'),
      avgRating: sql<number>`AVG(${reviews.rating})`,
    })
    .from(reviews)
    .where(eq(reviews.partnerId, partnerId))
    .groupBy(sql`rating_date`)
    .orderBy(sql`rating_date`);

  // Conversion rate (leads / views)
  const conversionRate = totalViews[0]?.count > 0 
    ? ((totalLeads[0]?.count || 0) / totalViews[0].count) * 100 
    : 0;

  return {
    profileViews,
    leadsByOffer,
    whatsappClicks,
    ratingEvolution,
    totals: {
      views: totalViews[0]?.count || 0,
      leads: totalLeads[0]?.count || 0,
      whatsappClicks: totalWhatsAppClicks[0]?.count || 0,
      conversionRate: Math.round(conversionRate * 100) / 100,
    },
  };
}


export async function generateMetricsCSV(partnerId: number, startDate?: Date, endDate?: Date): Promise<string> {
  const metrics = await getPartnerMetrics(partnerId, startDate, endDate);
  
  const lines: string[] = [];
  
  // Header
  lines.push("ZOPUMarket - Relatório de Métricas do Parceiro");
  lines.push(`Data de Geração: ${new Date().toLocaleString("pt-BR")}`);
  lines.push("");
  
  // Resumo Geral
  lines.push("=== RESUMO GERAL ===");
  lines.push("Métrica,Valor");
  lines.push(`Total de Visualizações,${metrics.totals.views}`);
  lines.push(`Total de Leads Gerados,${metrics.totals.leads}`);
  lines.push(`Total de Cliques WhatsApp,${metrics.totals.whatsappClicks}`);
  lines.push(`Taxa de Conversão,${metrics.totals.conversionRate}%`);
  lines.push("");
  
  // Visualizações por Data
  if (metrics.profileViews.length > 0) {
    lines.push("=== VISUALIZAÇÕES POR DATA ===");
    lines.push("Data,Visualizações");
    metrics.profileViews.forEach(item => {
      lines.push(`${item.date},${item.count}`);
    });
    lines.push("");
  }
  
  // Leads por Oferta
  if (metrics.leadsByOffer.length > 0) {
    lines.push("=== LEADS POR OFERTA ===");
    lines.push("Oferta,Leads Gerados");
    metrics.leadsByOffer.forEach(item => {
      const title = item.offerTitle || "Sem título";
      // Escapar vírgulas no título
      const escapedTitle = title.includes(",") ? `"${title}"` : title;
      lines.push(`${escapedTitle},${item.count}`);
    });
    lines.push("");
  }
  
  // Cliques WhatsApp por Data
  if (metrics.whatsappClicks.length > 0) {
    lines.push("=== CLIQUES WHATSAPP POR DATA ===");
    lines.push("Data,Cliques");
    metrics.whatsappClicks.forEach(item => {
      lines.push(`${item.date},${item.count}`);
    });
    lines.push("");
  }
  
  // Evolução do Rating
  if (metrics.ratingEvolution.length > 0) {
    lines.push("=== EVOLUÇÃO DO RATING ===");
    lines.push("Data,Rating Médio");
    metrics.ratingEvolution.forEach(item => {
      lines.push(`${item.date},${item.avgRating.toFixed(2)}`);
    });
    lines.push("");
  }
  
  return lines.join("\n");
}


// ============ BUYER HELPERS ============

export async function getBuyerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(buyers).where(eq(buyers.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBuyerById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(buyers).where(eq(buyers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBuyerByCNPJ(cnpj: string) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(buyers).where(eq(buyers.cnpj, cnpj)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBuyer(data: typeof buyers.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(buyers).values(data);
  return result;
}

export async function updateBuyer(id: number, data: Partial<typeof buyers.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(buyers).set(data).where(eq(buyers.id, id));
  return { success: true };
}

export async function getAllBuyers(filters?: {
  ecossistema?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];
  
  let query = db.select().from(buyers);
  
  const conditions = [];
  if (filters?.ecossistema) conditions.push(eq(buyers.ecossistema, filters.ecossistema));
  if (filters?.status) conditions.push(eq(buyers.status, filters.status as any));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }
  
  return query.orderBy(desc(buyers.createdAt));
}


// ============================================
// BUYER RECOMMENDATIONS
// ============================================

export async function getRecommendationsForBuyer(userId: number) {
  const db = await getDb();
  if (!db) return { partners: [], offers: [] };

  // Buscar perfil do comprador
  const buyer = await getBuyerByUserId(userId);

  if (!buyer) {
    return { partners: [], offers: [] };
  }

  // Parse categorias de interesse
  let categoriasInteresse: number[] = [];
  try {
    categoriasInteresse = buyer.categoriasInteresse 
      ? JSON.parse(buyer.categoriasInteresse) 
      : [];
  } catch (e) {
    categoriasInteresse = [];
  }

  // 1. Recomendar parceiros aprovados (premium primeiro)
  const recommendedPartners = await db
    .select()
    .from(partners)
    .where(eq(partners.curationStatus, "APPROVED"))
    .orderBy(
      // Premium primeiro, depois por rating
      sql`CASE WHEN ${partners.tier} = 'PREMIUM' THEN 0 ELSE 1 END`,
      desc(partners.rating)
    )
    .limit(10);

  // 2. Recomendar ofertas baseadas em categorias de interesse
  let recommendedOffers: any[] = [];
  
  if (categoriasInteresse.length > 0) {
    recommendedOffers = await db
      .select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        price: offers.price,
        imageUrl: offers.imageUrl,
        categoryId: offers.categoryId,
        partnerId: offers.partnerId,
      })
      .from(offers)
      .where(
        and(
          eq(offers.status, "PUBLISHED"),
          sql`${offers.categoryId} IN (${sql.join(categoriasInteresse.map((id: number) => sql`${id}`), sql`, `)})`
        )
      )
      .limit(10);
  }

  // 3. Se não houver ofertas por categoria, recomendar ofertas publicadas
  if (recommendedOffers.length === 0) {
    recommendedOffers = await db
      .select({
        id: offers.id,
        title: offers.title,
        description: offers.description,
        price: offers.price,
        imageUrl: offers.imageUrl,
        categoryId: offers.categoryId,
        partnerId: offers.partnerId,
      })
      .from(offers)
      .where(eq(offers.status, "PUBLISHED"))
      .limit(10);
  }

  return {
    partners: recommendedPartners,
    offers: recommendedOffers,
  };
}


// ============ COUPON FUNCTIONS ============

export async function getAllCoupons(filters?: {
  status?: string;
  search?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(coupons);

  const conditions = [];
  if (filters?.status) {
    conditions.push(eq(coupons.status, filters.status as any));
  }
  if (filters?.search) {
    conditions.push(
      or(
        like(coupons.code, `%${filters.search}%`),
        like(coupons.description, `%${filters.search}%`)
      )
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return await query.orderBy(desc(coupons.createdAt));
}

export async function getCouponById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(coupons).where(eq(coupons.id, id));
  return result[0] || null;
}

export async function getCouponByCode(code: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase()));
  return result[0] || null;
}

export async function createCoupon(data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(coupons).values({
    ...data,
    code: data.code.toUpperCase(), // Sempre maiúsculo
  });

  // Busca o cupom recém-criado
  return await getCouponById(result[0].insertId);
}

export async function updateCoupon(id: number, data: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(coupons).set(data).where(eq(coupons.id, id));

  return await getCouponById(id);
}

export async function deleteCoupon(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(coupons).where(eq(coupons.id, id));
}

export async function validateCoupon(params: {
  code: string;
  userId: number;
  offerId?: number;
  amount: number;
  paymentMethod?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const coupon = await getCouponByCode(params.code);

  if (!coupon) {
    return { valid: false, error: "Cupom não encontrado" };
  }

  // Verifica status
  if (coupon.status !== "ACTIVE") {
    return { valid: false, error: "Cupom inativo" };
  }

  // Verifica período de validade
  const now = new Date();
  if (now < new Date(coupon.startDate) || now > new Date(coupon.endDate)) {
    return { valid: false, error: "Cupom fora do período de validade" };
  }

  // Verifica valor mínimo de compra
  if (coupon.minPurchaseAmount && params.amount < Number(coupon.minPurchaseAmount)) {
    return {
      valid: false,
      error: `Valor mínimo de compra: R$ ${Number(coupon.minPurchaseAmount).toFixed(2)}`,
    };
  }

  // Verifica limite total de usos
  if (coupon.maxUsageTotal && coupon.currentUsageCount >= coupon.maxUsageTotal) {
    return { valid: false, error: "Cupom esgotado" };
  }

  // Verifica limite de usos por usuário
  if (coupon.maxUsagePerUser) {
    const usageCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(couponUsages)
      .where(
        and(
          eq(couponUsages.couponId, coupon.id),
          eq(couponUsages.userId, params.userId)
        )
      );

    const count = Number(usageCount[0]?.count || 0);
    if (count >= coupon.maxUsagePerUser) {
      return { valid: false, error: "Você já atingiu o limite de usos deste cupom" };
    }
  }

  // Verifica primeira compra
  if (coupon.firstPurchaseOnly) {
    const previousPurchases = await db
      .select({ count: sql<number>`count(*)` })
      .from(couponUsages)
      .where(eq(couponUsages.userId, params.userId));

    const count = Number(previousPurchases[0]?.count || 0);
    if (count > 0) {
      return { valid: false, error: "Cupom válido apenas para primeira compra" };
    }
  }

  // Verifica aplicabilidade por oferta ou categoria
  if (params.offerId) {
    // Prioridade 1: Verifica ofertas específicas
    if (coupon.applicableOfferIds) {
      const applicableIds = JSON.parse(coupon.applicableOfferIds);
      if (applicableIds.length > 0) {
        // Se há ofertas específicas, verifica apenas isso
        if (!applicableIds.includes(params.offerId)) {
          return { valid: false, error: "Cupom não aplicável a esta oferta" };
        }
        // Se a oferta está na lista, não precisa verificar categoria
      } else {
        // Se a lista de ofertas está vazia, verifica categorias
        if (coupon.applicableCategoryIds) {
          const applicableCatIds = JSON.parse(coupon.applicableCategoryIds);
          if (applicableCatIds.length > 0) {
            const offerResult = await db
              .select({ categoryId: offers.categoryId })
              .from(offers)
              .where(eq(offers.id, params.offerId));
            
            const offerCategoryId = offerResult[0]?.categoryId;
            if (!offerCategoryId || !applicableCatIds.includes(offerCategoryId)) {
              return { valid: false, error: "Cupom não aplicável a esta categoria" };
            }
          }
        }
      }
    } else {
      // Se não há lista de ofertas, verifica categorias
      if (coupon.applicableCategoryIds) {
        const applicableCatIds = JSON.parse(coupon.applicableCategoryIds);
        if (applicableCatIds.length > 0) {
          const offerResult = await db
            .select({ categoryId: offers.categoryId })
            .from(offers)
            .where(eq(offers.id, params.offerId));
          
          const offerCategoryId = offerResult[0]?.categoryId;
          if (!offerCategoryId || !applicableCatIds.includes(offerCategoryId)) {
            return { valid: false, error: "Cupom não aplicável a esta categoria" };
          }
        }
      }
    }
  }

  // Verifica ofertas excluídas
  if (params.offerId && coupon.excludedOfferIds) {
    const excludedIds = JSON.parse(coupon.excludedOfferIds);
    if (excludedIds.includes(params.offerId)) {
      return { valid: false, error: "Cupom não aplicável a esta oferta" };
    }
  }

  // Verifica método de pagamento
  if (params.paymentMethod && coupon.applicablePaymentMethods) {
    const methods = JSON.parse(coupon.applicablePaymentMethods);
    if (!methods.includes(params.paymentMethod)) {
      return { valid: false, error: "Cupom não aplicável a este método de pagamento" };
    }
  }

  // Calcula desconto
  let discountAmount = 0;
  if (coupon.discountType === "PERCENTAGE") {
    discountAmount = (params.amount * Number(coupon.discountValue)) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscountAmount));
    }
  } else {
    discountAmount = Number(coupon.discountValue);
  }

  const finalAmount = Math.max(0, params.amount - discountAmount);

  return {
    valid: true,
    coupon,
    discountAmount,
    finalAmount,
  };
}

export async function applyCoupon(params: {
  couponId: number;
  userId: number;
  offerId?: number;
  referralId?: number;
  originalAmount: number;
  discountAmount: number;
  finalAmount: number;
  paymentMethod?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Registra uso
  await db.insert(couponUsages).values({
    couponId: params.couponId,
    userId: params.userId,
    offerId: params.offerId,
    referralId: params.referralId,
    originalAmount: params.originalAmount.toString(),
    discountAmount: params.discountAmount.toString(),
    finalAmount: params.finalAmount.toString(),
    paymentMethod: params.paymentMethod,
  });

  // Incrementa contador de usos
  await db
    .update(coupons)
    .set({
      currentUsageCount: sql`${coupons.currentUsageCount} + 1`,
    })
    .where(eq(coupons.id, params.couponId));
}

export async function getCouponUsageStats(couponId: number) {
  const db = await getDb();
  if (!db) return null;

  const stats = await db
    .select({
      totalUsages: sql<number>`count(*)`,
      totalRevenue: sql<number>`sum(${couponUsages.originalAmount})`,
      totalDiscount: sql<number>`sum(${couponUsages.discountAmount})`,
      uniqueUsers: sql<number>`count(distinct ${couponUsages.userId})`,
    })
    .from(couponUsages)
    .where(eq(couponUsages.couponId, couponId));

  return stats[0];
}
