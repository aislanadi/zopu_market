import { date, decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(), // Agora opcional (para compatibilidade com OAuth)
  email: varchar("email", { length: 320 }).unique(), // Email único (opcional para OAuth sem email)
  passwordHash: varchar("passwordHash", { length: 255 }), // Hash bcrypt da senha (null para OAuth users)
  name: text("name"),
  loginMethod: varchar("loginMethod", { length: 64 }), // "email", "google", "github", etc.
  role: mysqlEnum("role", ["admin", "gerente_contas", "parceiro", "cliente"]).default("cliente").notNull(),
  partnerId: int("partnerId"),
  
  // Campos de autenticação local
  emailVerified: int("emailVerified").default(0).notNull(), // 0 = não verificado, 1 = verificado
  emailVerificationToken: varchar("emailVerificationToken", { length: 255 }), // Token para verificação de email
  emailVerificationExpiry: timestamp("emailVerificationExpiry"), // Expiração do token de verificação
  passwordResetToken: varchar("passwordResetToken", { length: 255 }), // Token para reset de senha
  passwordResetExpiry: timestamp("passwordResetExpiry"), // Expiração do token de reset
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const categories = mysqlTable("categories", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  cnpj: varchar("cnpj", { length: 20 }),
  legalName: varchar("legalName", { length: 255 }),
  razaoSocial: varchar("razaoSocial", { length: 255 }), // Razão Social da Receita Federal
  cnae: varchar("cnae", { length: 20 }), // CNAE principal
  cnaeSecundario: text("cnaeSecundario"), // CNAEs secundários (JSON array)
  uf: varchar("uf", { length: 2 }), // UF da sede (da Receita Federal)
  mainCategoryId: int("mainCategoryId"),
  curationStatus: mysqlEnum("curationStatus", ["PENDING", "APPROVED", "REJECTED"]).default("PENDING").notNull(),
  // Campos de integração Bitrix24 (privados)
  bitrix24Url: text("bitrix24Url"), // URL do Bitrix24 do parceiro
  bitrix24Webhook: text("bitrix24Webhook"), // Webhook para integração
  bitrix24LicenseExpiry: timestamp("bitrix24LicenseExpiry"), // Data de vencimento da licença
  bitrixWebhookUrl: text("bitrixWebhookUrl"), // DEPRECATED: manter por compatibilidade
  bitrixToken: text("bitrixToken"), // DEPRECATED: manter por compatibilidade
  bankAccount: text("bankAccount"),
  pixKey: varchar("pixKey", { length: 255 }),
  contactName: varchar("contactName", { length: 255 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  contactPhone: varchar("contactPhone", { length: 20 }),
  logoUrl: text("logoUrl"),
  description: text("description"),
  ecosystems: text("ecosystems"),
  state: varchar("state", { length: 2 }), // UF (SP, RJ, MG, etc.)
  city: varchar("city", { length: 100 }), // Cidade
  rating: int("rating").default(0),
  totalProjects: int("totalProjects").default(0),
  totalEarned: int("totalEarned").default(0),
  avgResponseTime: int("avgResponseTime"),
  institutionalVideoUrl: text("institutionalVideoUrl"), // URL do vídeo institucional do YouTube
  badges: text("badges"), // JSON array de badges: ["verified", "top_rated", "fast_response"]
  tier: mysqlEnum("tier", ["STANDARD", "PREMIUM"]).default("STANDARD").notNull(), // Plano do parceiro
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const offers = mysqlTable("offers", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId"),
  categoryId: int("categoryId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  saleMode: mysqlEnum("saleMode", ["CHECKOUT", "LEAD_FORM", "BOTH"]).notNull(),
  offerType: mysqlEnum("offerType", ["DIGITAL", "SERVICE_STANDARD", "SERVICE_COMPLEX", "LICENSE"]).notNull(),
  price: int("price"),
  splitEnabled: int("splitEnabled").default(0).notNull(),
  zopuTakeRatePercent: int("zopuTakeRatePercent"),
  partnerSharePercent: int("partnerSharePercent"),
  successFeePercent: int("successFeePercent").notNull(),
  successFeeRuleNotes: text("successFeeRuleNotes"),
  exclusiveBenefitText: text("exclusiveBenefitText"),
  partnerAckHours: int("partnerAckHours").default(48),
  statusUpdateDays: int("statusUpdateDays").default(15),
  icp: text("icp"),
  promessa: text("promessa"),
  entregaveis: text("entregaveis"),
  cases: text("cases"),
  faq: text("faq"),
  ctaCopy: text("ctaCopy"),
  imageUrl: text("imageUrl"),
  videoUrl: text("videoUrl"), // URL do vídeo de review/demonstração do YouTube
  profitMargin: int("profitMargin"), // Margem líquida estimada pelo parceiro (em %)
  negotiationNotes: text("negotiationNotes"), // Observações da entrevista de negociação
  // Campos para licenças Bitrix24
  billingPeriods: text("billingPeriods"), // JSON array: ["MONTHLY", "QUARTERLY", "ANNUAL"]
  priceMonthly: int("priceMonthly"), // Preço mensal em centavos (apenas Enterprise)
  priceQuarterly: int("priceQuarterly"), // Preço trimestral em centavos
  priceAnnual: int("priceAnnual"), // Preço anual em centavos
  variants: text("variants"), // JSON array de variantes: [{name: "Enterprise 250", userLimit: 250, priceMonthly: X, priceQuarterly: Y, priceAnnual: Z}]
  status: mysqlEnum("status", ["DRAFT", "PENDING_INTERVIEW", "PUBLISHED", "ARCHIVED"]).default("DRAFT").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const leadRequests = mysqlTable("leadRequests", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientEmail: varchar("clientEmail", { length: 320 }).notNull(),
  clientPhone: varchar("clientPhone", { length: 20 }),
  companyName: varchar("companyName", { length: 255 }),
  painPoint: text("painPoint"),
  attachments: text("attachments"),
  lgpdConsent: int("lgpdConsent").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  partnerId: int("partnerId").notNull(),
  leadRequestId: int("leadRequestId"),
  gerenteId: int("gerenteId"),
  buyerCompany: varchar("buyerCompany", { length: 255 }),
  buyerContact: varchar("buyerContact", { length: 255 }),
  origin: mysqlEnum("origin", ["ZOPU_MARKET", "ASSISTED_REFERRAL", "CAMPAIGN"]).default("ZOPU_MARKET").notNull(),
  status: mysqlEnum("status", ["SENT", "ACKED", "IN_NEGOTIATION", "WON", "LOST", "OVERDUE"]).default("SENT").notNull(),
  expectedValue: int("expectedValue"),
  wonValue: int("wonValue"),
  successFeePercent: int("successFeePercent").notNull(),
  successFeeExpected: int("successFeeExpected"),
  successFeeRealized: int("successFeeRealized"),
  partnerLeadId: varchar("partnerLeadId", { length: 255 }),
  internalNotes: text("internalNotes"),
  ackDeadline: timestamp("ackDeadline"),
  lastStatusUpdate: timestamp("lastStatusUpdate").defaultNow(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  offerId: int("offerId").notNull(),
  buyerId: int("buyerId").notNull(),
  quantity: int("quantity").default(1).notNull(),
  unitPrice: int("unitPrice").notNull(),
  totalAmount: int("totalAmount").notNull(),
  zopuAmount: int("zopuAmount"),
  partnerAmount: int("partnerAmount"),
  splitApplied: int("splitApplied").default(0).notNull(),
  paymentStatus: mysqlEnum("paymentStatus", ["PENDING", "PAID", "FAILED", "REFUNDED"]).default("PENDING").notNull(),
  paymentGatewayId: varchar("paymentGatewayId", { length: 255 }),
  refundReason: text("refundReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  orderId: int("orderId"),
  referralId: int("referralId"),
  reviewerName: varchar("reviewerName", { length: 255 }).notNull(),
  reviewerCompany: varchar("reviewerCompany", { length: 255 }),
  rating: int("rating").notNull(),
  comment: text("comment"),
  isVerified: int("isVerified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const favorites = mysqlTable("favorites", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  offerId: int("offerId"),
  partnerId: int("partnerId"),
  type: mysqlEnum("type", ["offer", "partner"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: varchar("userId", { length: 64 }).notNull(),
  type: mysqlEnum("type", ["lead", "review", "message", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  link: varchar("link", { length: 500 }),
  read: int("read").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const userInvitations = mysqlTable("userInvitations", {
  id: int("id").autoincrement().primaryKey(),
  token: varchar("token", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  expiresAt: timestamp("expiresAt").notNull(),
  usedAt: timestamp("usedAt"),
  createdBy: varchar("createdBy", { length: 64 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const clientLeads = mysqlTable("clientLeads", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  companyName: varchar("companyName", { length: 255 }),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "converted", "rejected"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const serviceContracts = mysqlTable("serviceContracts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  offerId: int("offerId").notNull(),
  partnerId: int("partnerId").notNull(),
  contractDate: timestamp("contractDate").notNull(),
  value: varchar("value", { length: 50 }),
  period: varchar("period", { length: 100 }),
  comments: text("comments"),
  verified: int("verified").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  action: varchar("action", { length: 255 }).notNull(),
  entityType: varchar("entityType", { length: 100 }),
  entityId: int("entityId"),
  oldValue: text("oldValue"),
  newValue: text("newValue"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const partnerCases = mysqlTable("partnerCases", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientCompany: varchar("clientCompany", { length: 255 }),
  description: text("description").notNull(),
  results: text("results"),
  testimonial: text("testimonial"),
  imageUrl: text("imageUrl"),
  displayOrder: int("displayOrder").default(0),
  isPublished: int("isPublished").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const analytics = mysqlTable("analytics", {
  id: int("id").autoincrement().primaryKey(),
  partnerId: int("partnerId"),
  offerId: int("offerId"),
  eventType: varchar("eventType", { length: 50 }).notNull(), // profile_view, offer_view, offer_click, lead_generated, whatsapp_click
  metadata: text("metadata"), // JSON with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const buyers = mysqlTable("buyers", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(), // Referência ao users.id
  
  // Dados da empresa (ReceitaWS)
  cnpj: varchar("cnpj", { length: 18 }).notNull().unique(),
  razaoSocial: varchar("razaoSocial", { length: 255 }),
  nomeFantasia: varchar("nomeFantasia", { length: 255 }),
  porte: varchar("porte", { length: 50 }), // MEI, ME, EPP, DEMAIS
  cnaePrincipal: varchar("cnaePrincipal", { length: 20 }),
  cnaePrincipalDescricao: text("cnaePrincipalDescricao"),
  cnaesSecundarios: text("cnaesSecundarios"), // JSON array
  regimeTributario: varchar("regimeTributario", { length: 100 }),
  dataAbertura: varchar("dataAbertura", { length: 10 }),
  situacaoCadastral: varchar("situacaoCadastral", { length: 50 }),
  
  // Endereço (ReceitaWS)
  logradouro: varchar("logradouro", { length: 255 }),
  numero: varchar("numero", { length: 20 }),
  complemento: varchar("complemento", { length: 255 }),
  bairro: varchar("bairro", { length: 100 }),
  municipio: varchar("municipio", { length: 100 }),
  uf: varchar("uf", { length: 2 }),
  cep: varchar("cep", { length: 10 }),
  
  // Dados do contato
  photoUrl: text("photoUrl"),
  cargo: varchar("cargo", { length: 100 }),
  departamento: varchar("departamento", { length: 100 }),
  telefone: varchar("telefone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  
  // Interesses
  interessesTexto: text("interessesTexto"), // Campo livre
  categoriasInteresse: text("categoriasInteresse"), // JSON array de IDs de categorias
  
  // Classificação
  ecossistema: varchar("ecossistema", { length: 100 }), // Indústria, Varejo, Serviços, Tecnologia, etc.
  leadScore: int("leadScore").default(0), // Pontuação automática
  
  // Licença Bitrix24
  bitrixUrl: varchar("bitrixUrl", { length: 255 }), // URL da instância Bitrix24
  bitrix24Webhook: text("bitrix24Webhook"), // Webhook para integração
  bitrixLicenseType: varchar("bitrixLicenseType", { length: 50 }), // Professional, Enterprise, etc.
  bitrixLicenseExpiry: date("bitrixLicenseExpiry"), // Data de vencimento
  bitrixLicenseStatus: mysqlEnum("bitrixLicenseStatus", ["ATIVA", "VENCENDO", "VENCIDA", "NAO_INFORMADA"]).default("NAO_INFORMADA"),
  
  // Status
  profileComplete: int("profileComplete").default(0).notNull(),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});


// Tabela para controlar notificações de vencimento de licença
export const licenseNotifications = mysqlTable("license_notifications", {
  id: int("id").autoincrement().primaryKey(),
  buyerId: int("buyerId").notNull(), // Referência ao buyers.id
  notificationType: mysqlEnum("notificationType", ["90_DAYS", "60_DAYS", "30_DAYS", "EXPIRED"]).notNull(),
  sentAt: timestamp("sentAt").defaultNow().notNull(),
  licenseExpiryDate: date("licenseExpiryDate").notNull(), // Data de vencimento no momento do envio
});


// Tabela de cupons de desconto
export const coupons = mysqlTable("coupons", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(), // Código do cupom (ex: NATAL2025)
  description: text("description"), // Descrição do cupom
  
  // Tipo e valor do desconto
  discountType: mysqlEnum("discountType", ["PERCENTAGE", "FIXED_AMOUNT"]).notNull(), // Porcentagem ou valor fixo
  discountValue: decimal("discountValue", { precision: 10, scale: 2 }).notNull(), // Valor do desconto (ex: 10 para 10% ou R$10)
  maxDiscountAmount: decimal("maxDiscountAmount", { precision: 10, scale: 2 }), // Valor máximo de desconto (para porcentagem)
  minPurchaseAmount: decimal("minPurchaseAmount", { precision: 10, scale: 2 }), // Valor mínimo de compra
  
  // Período de validade
  startDate: timestamp("startDate").notNull(), // Data de início
  endDate: timestamp("endDate").notNull(), // Data de término
  
  // Limites de uso
  maxUsageTotal: int("maxUsageTotal"), // Número máximo de usos totais (null = ilimitado)
  maxUsagePerUser: int("maxUsagePerUser").default(1), // Número máximo de usos por usuário
  currentUsageCount: int("currentUsageCount").default(0).notNull(), // Contador de usos
  
  // Regras de aplicação
  applicableOfferIds: text("applicableOfferIds"), // JSON array de IDs de ofertas (null = todas)
  applicableCategoryIds: text("applicableCategoryIds"), // JSON array de IDs de categorias (null = todas)
  applicablePaymentMethods: text("applicablePaymentMethods"), // JSON array: ["CREDIT_CARD", "BOLETO", "PIX"]
  
  // Restrições
  firstPurchaseOnly: int("firstPurchaseOnly").default(0).notNull(), // 1 = apenas primeira compra
  excludedOfferIds: text("excludedOfferIds"), // JSON array de IDs de ofertas excluídas
  
  // Status
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE", "EXPIRED"]).default("ACTIVE").notNull(),
  
  // Metadados
  createdBy: int("createdBy").notNull(), // ID do admin que criou
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// Tabela de uso de cupons (histórico)
export const couponUsages = mysqlTable("coupon_usages", {
  id: int("id").autoincrement().primaryKey(),
  couponId: int("couponId").notNull(), // Referência ao cupom
  userId: int("userId").notNull(), // Usuário que usou
  offerId: int("offerId"), // Oferta onde foi usado
  referralId: int("referralId"), // Indicação onde foi usado (se aplicável)
  
  // Valores
  originalAmount: decimal("originalAmount", { precision: 10, scale: 2 }).notNull(), // Valor original
  discountAmount: decimal("discountAmount", { precision: 10, scale: 2 }).notNull(), // Valor do desconto aplicado
  finalAmount: decimal("finalAmount", { precision: 10, scale: 2 }).notNull(), // Valor final
  
  // Metadados
  paymentMethod: varchar("paymentMethod", { length: 50 }), // Método de pagamento usado
  usedAt: timestamp("usedAt").defaultNow().notNull(),
});

export type Coupon = typeof coupons.$inferSelect;
export type InsertCoupon = typeof coupons.$inferInsert;
export type CouponUsage = typeof couponUsages.$inferSelect;
export type InsertCouponUsage = typeof couponUsages.$inferInsert;
