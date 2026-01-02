import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { localAuthRouter } from "./localAuthRouter";
import * as db from "./db";
import { createAuditLog, getDb } from "./db";
import { clientLeads, users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// ============ MIDDLEWARE HELPERS ============

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a administradores" });
  }
  return next({ ctx });
});

const gerenteProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "gerente_contas") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a gerentes de contas" });
  }
  return next({ ctx });
});

const parceiroProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "parceiro") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a parceiros" });
  }
  return next({ ctx });
});

// ============ AUTH ROUTER ============

const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
});

// ============ CATEGORY ROUTER ============

const categoryRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getAllCategories();
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCategoryById(input.id);
    }),

  create: adminProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await db.createCategory(input);
      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_CATEGORY",
        entityType: "category",
        newValue: JSON.stringify(input),
      });
      return result;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).optional(),
      description: z.string().optional(),
      icon: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const old = await db.getCategoryById(id);
      await db.updateCategory(id, data);
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_CATEGORY",
        entityType: "category",
        entityId: id,
        oldValue: JSON.stringify(old),
        newValue: JSON.stringify(data),
      });
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const old = await db.getCategoryById(input.id);
      await db.deleteCategory(input.id);
      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_CATEGORY",
        entityType: "category",
        entityId: input.id,
        oldValue: JSON.stringify(old),
      });
      return { success: true };
    }),
});

// ============ PARTNER ROUTER ============

const partnerRouter = router({
  // Buscar dados de CNPJ via BrasilAPI
  fetchCNPJ: publicProcedure
    .input(z.object({ cnpj: z.string().min(14) }))
    .query(async ({ input }) => {
      const { fetchCNPJ } = await import("./_core/cnpj");
      try {
        const data = await fetchCNPJ(input.cnpj);
        if (!data) {
          throw new TRPCError({ code: "NOT_FOUND", message: "CNPJ não encontrado" });
        }
        return data;
      } catch (error: any) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: error.message || "Erro ao buscar CNPJ" 
        });
      }
    }),

  list: adminProcedure.query(async () => {
    return await db.getAllPartners();
  }),

  listByStatus: adminProcedure
    .input(z.object({ status: z.enum(["PENDING", "APPROVED", "REJECTED"]) }))
    .query(async ({ input }) => {
      return await db.getPartnersByStatus(input.status);
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const partner = await db.getPartnerById(input.id);
      if (!partner) throw new TRPCError({ code: "NOT_FOUND" });
      
      // Parceiros só podem ver seus próprios dados
      if (ctx.user.role === "parceiro" && ctx.user.partnerId !== partner.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      return partner;
    }),

  getPublicProfile: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      // Fetch all data in parallel for better performance
      const [partner, offers, reviews] = await Promise.all([
        db.getPartnerById(input.id),
        db.getOffersByPartner(input.id),
        db.getReviewsByPartner(input.id),
      ]);

      if (!partner || partner.curationStatus !== "APPROVED") {
        throw new TRPCError({ code: "NOT_FOUND", message: "Parceiro não encontrado" });
      }

      // Calcular rating médio
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

      return {
        partner,
        offers,
        reviews,
        stats: {
          avgRating: Math.round(avgRating * 10) / 10,
          totalReviews: reviews.length,
          totalOffers: offers.length,
        },
      };
    }),

  create: publicProcedure
    .input(z.object({
      companyName: z.string().min(1),
      cnpj: z.string().optional(),
      legalName: z.string().optional(),
      razaoSocial: z.string().optional(),
      cnae: z.string().optional(),
      cnaeSecundario: z.string().optional(),
      uf: z.string().optional(),
      bitrix24Url: z.string().optional(),
      bitrix24Webhook: z.string().optional(),
      bitrix24LicenseExpiry: z.string().optional(),
      mainCategoryId: z.number().optional(),
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      institutionalVideoUrl: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const { bitrix24LicenseExpiry, ...rest } = input;
      const result = await db.createPartner({
        ...rest,
        curationStatus: "PENDING",
        bitrix24LicenseExpiry: bitrix24LicenseExpiry ? new Date(bitrix24LicenseExpiry) : undefined,
      });
      return result;
    }),

  updateCurationStatus: adminProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["PENDING", "APPROVED", "REJECTED"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const partner = await db.getPartnerById(input.id);
      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Parceiro não encontrado" });
      }

      const oldStatus = partner.curationStatus;
      await db.updatePartner(input.id, { curationStatus: input.status });
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_PARTNER_STATUS",
        entityType: "partner",
        entityId: input.id,
        oldValue: oldStatus,
        newValue: input.status,
      });

      // Se aprovado, enviar email de boas-vindas
      if (input.status === "APPROVED" && oldStatus !== "APPROVED") {
        if (!partner.contactEmail) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: "Email de contato é obrigatório para aprovar parceiro" 
          });
        }

        const { sendEmail, getPartnerApprovedEmailTemplate } = await import("./_core/email");
        
        // Enviar email de aprovação
        // O usuário será associado automaticamente ao parceiro no primeiro login
        const loginUrl = `${process.env.VITE_OAUTH_PORTAL_URL || "https://oauth.manus.im"}/login`;
        const emailTemplate = getPartnerApprovedEmailTemplate({
          partnerName: partner.contactName || "Parceiro",
          companyName: partner.companyName,
          loginUrl,
        });

        await sendEmail({
          to: partner.contactEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        // Criar usuário automaticamente
        try {
          const dbInstance = await getDb();
          if (!dbInstance) {
            console.error(`[Partner Approval] Banco de dados não disponível`);
            return { success: true };
          }
          
          // Verificar se já existe usuário com esse email
          const existingUsers = await dbInstance.select().from(users).where(eq(users.email, partner.contactEmail)).limit(1);
          
          if (existingUsers.length > 0) {
            // Usuário já existe, apenas atualizar role e partnerId
            const existingUser = existingUsers[0];
            await dbInstance.update(users)
              .set({ 
                role: "parceiro", 
                partnerId: partner.id,
                updatedAt: new Date()
              })
              .where(eq(users.id, existingUser.id));
            console.log(`[Partner Approval] Usuário existente ${partner.contactEmail} atualizado com partnerId ${partner.id}`);
          } else {
            // Criar novo usuário
            await dbInstance.insert(users).values({
              email: partner.contactEmail,
              name: partner.contactName || partner.companyName,
              role: "parceiro",
              partnerId: partner.id,
              loginMethod: "oauth",
              emailVerified: 1, // Consideramos verificado pois passou pela curadoria
              lastSignedIn: new Date(),
            });
            console.log(`[Partner Approval] Novo usuário criado para ${partner.contactEmail} com partnerId ${partner.id}`);
          }
        } catch (error) {
          console.error(`[Partner Approval] Erro ao criar/atualizar usuário:`, error);
          // Não lançar erro para não bloquear a aprovação
        }

        console.log(`[Partner Approval] Email de aprovação enviado para ${partner.contactEmail}.`);
      }

      // Se rejeitado, enviar email de rejeição
      if (input.status === "REJECTED" && oldStatus !== "REJECTED") {
        if (!partner.contactEmail) {
          console.warn(`[Partner Rejection] Parceiro ${input.id} não tem email de contato`);
          return { success: true };
        }

        const { sendEmail, getPartnerRejectedEmailTemplate } = await import("./_core/email");
        
        const emailTemplate = getPartnerRejectedEmailTemplate({
          partnerName: partner.contactName || "Parceiro",
          companyName: partner.companyName,
        });

        await sendEmail({
          to: partner.contactEmail,
          subject: emailTemplate.subject,
          html: emailTemplate.html,
          text: emailTemplate.text,
        });

        console.log(`[Partner Rejection] Email de rejeição enviado para ${partner.contactEmail}`);
      }

      return { success: true };
    }),

  updateBitrixConfig: protectedProcedure
    .input(z.object({
      bitrixWebhookUrl: z.string().url(),
      bitrixToken: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Permitir parceiros e admins com partnerId
      if (ctx.user.role !== "parceiro" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a parceiros" });
      }
      
      if (!ctx.user.partnerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a um parceiro" });
      }
      
      await db.updatePartner(ctx.user.partnerId, input);
      return { success: true };
    }),

  updatePaymentInfo: protectedProcedure
    .input(z.object({
      bankAccount: z.string().optional(),
      pixKey: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Permitir parceiros e admins com partnerId
      if (ctx.user.role !== "parceiro" && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a parceiros" });
      }
      
      if (!ctx.user.partnerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a um parceiro" });
      }
      
      await db.updatePartner(ctx.user.partnerId, input);
      return { success: true };
    }),

  updateProfile: adminProcedure
    .input(z.object({
      id: z.number(),
      companyName: z.string().min(1),
      cnpj: z.string().optional(),
      legalName: z.string().optional(),
      description: z.string().optional(),
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      institutionalVideoUrl: z.string().optional(),
      logoUrl: z.string().optional(),
      curationStatus: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      await db.updatePartner(id, updateData);
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_PARTNER_PROFILE",
        entityType: "partner",
        entityId: id,
        oldValue: null,
        newValue: JSON.stringify(updateData),
      });
      return { success: true };
    }),

  updateSelfProfile: protectedProcedure
    .input(z.object({
      companyName: z.string().min(1),
      cnpj: z.string().optional(),
      legalName: z.string().optional(),
      razaoSocial: z.string().optional(),
      cnae: z.string().optional(),
      cnaeSecundario: z.string().optional(),
      uf: z.string().optional(),
      description: z.string().optional(),
      contactName: z.string().min(1),
      contactEmail: z.string().email(),
      contactPhone: z.string().optional(),
      institutionalVideoUrl: z.string().optional(),
      logoUrl: z.string().optional(),
      bitrix24Url: z.string().optional(),
      bitrix24Webhook: z.string().optional(),
      bitrix24LicenseExpiry: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Permitir parceiros e admins com partnerId
      if (ctx.user.role === "parceiro") {
        if (!ctx.user.partnerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a um parceiro" });
        }
        const updateData = {
          ...input,
          bitrix24LicenseExpiry: input.bitrix24LicenseExpiry ? new Date(input.bitrix24LicenseExpiry) : undefined,
        };
        await db.updatePartner(ctx.user.partnerId, updateData);
      } else if (ctx.user.role === "admin") {
        // Admin com partnerId pode editar seu próprio perfil de parceiro
        if (!ctx.user.partnerId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Admin deve usar updateProfile com id específico" });
        }
        const updateData = {
          ...input,
          bitrix24LicenseExpiry: input.bitrix24LicenseExpiry ? new Date(input.bitrix24LicenseExpiry) : undefined,
        };
        await db.updatePartner(ctx.user.partnerId, updateData);
      } else {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso restrito a parceiros" });
      }
      
      return { success: true };
    }),

  updateTier: adminProcedure
    .input(z.object({
      id: z.number(),
      tier: z.enum(["STANDARD", "PREMIUM"]),
    }))
    .mutation(async ({ input, ctx }) => {
      const old = await db.getPartnerById(input.id);
      await db.updatePartner(input.id, { tier: input.tier });
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_PARTNER_TIER",
        entityType: "partner",
        entityId: input.id,
        oldValue: old?.tier,
        newValue: input.tier,
      });
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const partner = await db.getPartnerById(input.id);
      if (!partner) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Parceiro não encontrado" });
      }

      // Registrar log de auditoria antes de excluir
      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_PARTNER",
        entityType: "partner",
        entityId: input.id,
        oldValue: JSON.stringify(partner),
        newValue: null,
      });

      // Excluir parceiro
      await db.deletePartner(input.id);

      return { success: true };
    }),
});

// ============ USER ROUTER ============

const userRouter = router({
  list: adminProcedure.query(async () => {
    return await db.getAllUsers();
  }),

  search: adminProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return await db.searchUsers(input.query);
    }),

  updateRole: adminProcedure
    .input(z.object({
      userId: z.number(),
      role: z.enum(["admin", "gerente_contas", "parceiro", "cliente"]),
      partnerId: z.number().nullable().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // Registrar log de auditoria
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_USER_ROLE",
        entityType: "user",
        entityId: input.userId,
        oldValue: JSON.stringify({ role: user.role, partnerId: user.partnerId }),
        newValue: JSON.stringify({ role: input.role, partnerId: input.partnerId }),
      });

      await db.updateUserRole(input.userId, input.role, input.partnerId);

      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserById(input.userId);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Usuário não encontrado" });
      }

      // Não permitir deletar o próprio usuário
      if (user.id === ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Você não pode deletar seu próprio usuário" });
      }

      // Registrar log de auditoria antes de deletar
      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_USER",
        entityType: "user",
        entityId: input.userId,
        oldValue: JSON.stringify({ name: user.name, email: user.email, role: user.role }),
        newValue: null,
      });

      await db.deleteUser(input.userId);

      return { success: true };
    }),
});

// ============ OFFER ROUTER ============

const offerRouter = router({
  list: publicProcedure
    .input(z.object({
      categoryId: z.number().optional(),
      offerType: z.string().optional(),
      partnerId: z.number().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllOffers(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getOfferById(input.id);
    }),

  create: protectedProcedure
    .input(z.object({
      categoryId: z.number(),
      title: z.string().min(1),
      description: z.string().optional(),
      saleMode: z.enum(["CHECKOUT", "LEAD_FORM", "BOTH"]),
      offerType: z.enum(["DIGITAL", "SERVICE_STANDARD", "SERVICE_COMPLEX", "LICENSE"]),
      price: z.number().optional(),
      splitEnabled: z.number().optional(),
      zopuTakeRatePercent: z.number().optional(),
      partnerSharePercent: z.number().optional(),
      successFeePercent: z.number(),
      successFeeRuleNotes: z.string().optional(),
      exclusiveBenefitText: z.string().optional(),
      partnerAckHours: z.number().optional(),
      statusUpdateDays: z.number().optional(),
      icp: z.string().optional(),
      promessa: z.string().optional(),
      entregaveis: z.string().optional(),
      cases: z.string().optional(),
      faq: z.string().optional(),
      ctaCopy: z.string().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      profitMargin: z.number().optional(),
      status: z.enum(["DRAFT", "PENDING_INTERVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      let partnerId = null;
      let finalStatus = input.status || "DRAFT";
      
      if (ctx.user.role === "parceiro") {
        if (!ctx.user.partnerId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a um parceiro" });
        }
        partnerId = ctx.user.partnerId;
        
        // Verificar se parceiro está aprovado
        const partner = await db.getPartnerById(ctx.user.partnerId);
        if (partner?.curationStatus !== "APPROVED") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Parceiro precisa estar aprovado para criar ofertas" });
        }
        
        // Parceiros sempre criam ofertas com status PENDING_INTERVIEW
        finalStatus = "PENDING_INTERVIEW" as any;
      }
      
      const result = await db.createOffer({
        ...input,
        partnerId,
        status: finalStatus as any,
      });
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_OFFER",
        entityType: "offer",
        newValue: JSON.stringify(input),
      });
      
      return result;
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      categoryId: z.number().optional(),
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      saleMode: z.enum(["CHECKOUT", "LEAD_FORM", "BOTH"]).optional(),
      offerType: z.enum(["DIGITAL", "SERVICE_STANDARD", "SERVICE_COMPLEX", "LICENSE"]).optional(),
      price: z.number().optional(),
      splitEnabled: z.number().optional(),
      zopuTakeRatePercent: z.number().optional(),
      partnerSharePercent: z.number().optional(),
      successFeePercent: z.number().optional(),
      successFeeRuleNotes: z.string().optional(),
      exclusiveBenefitText: z.string().optional(),
      partnerAckHours: z.number().optional(),
      statusUpdateDays: z.number().optional(),
      icp: z.string().optional(),
      promessa: z.string().optional(),
      entregaveis: z.string().optional(),
      cases: z.string().optional(),
      faq: z.string().optional(),
      ctaCopy: z.string().optional(),
      imageUrl: z.string().optional(),
      videoUrl: z.string().optional(),
      profitMargin: z.number().optional(),
      status: z.enum(["DRAFT", "PENDING_INTERVIEW", "PUBLISHED", "ARCHIVED"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...data } = input;
      const offer = await db.getOfferById(id);
      
      if (!offer) throw new TRPCError({ code: "NOT_FOUND" });
      
      // Parceiros só podem editar suas próprias ofertas
      if (ctx.user.role === "parceiro" && ctx.user.partnerId !== offer.partnerId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      await db.updateOffer(id, data);
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_OFFER",
        entityType: "offer",
        entityId: id,
        oldValue: JSON.stringify(offer),
        newValue: JSON.stringify(data),
      });
      
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const offer = await db.getOfferById(input.id);
      await db.deleteOffer(input.id);
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_OFFER",
        entityType: "offer",
        entityId: input.id,
        oldValue: JSON.stringify(offer),
      });
      
      return { success: true };
    }),

  getPending: adminProcedure
    .query(async () => {
      return await db.getPendingOffers();
    }),

  approve: adminProcedure
    .input(z.object({
      id: z.number(),
      successFeePercent: z.number().min(0).max(100),
      negotiationNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, successFeePercent, negotiationNotes } = input;
      const offer = await db.getOfferById(id);
      
      if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta não encontrada" });
      if (offer.status !== "PENDING_INTERVIEW") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Apenas ofertas pendentes podem ser aprovadas" });
      }
      
      await db.updateOffer(id, {
        status: "PUBLISHED" as any,
        successFeePercent,
        negotiationNotes,
      });
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "APPROVE_OFFER",
        entityType: "offer",
        entityId: id,
        oldValue: JSON.stringify(offer),
        newValue: JSON.stringify({ status: "PUBLISHED", successFeePercent, negotiationNotes }),
      });
      
      return { success: true };
    }),

  reject: adminProcedure
    .input(z.object({
      id: z.number(),
      negotiationNotes: z.string().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, negotiationNotes } = input;
      const offer = await db.getOfferById(id);
      
      if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta não encontrada" });
      if (offer.status !== "PENDING_INTERVIEW") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Apenas ofertas pendentes podem ser rejeitadas" });
      }
      
      await db.updateOffer(id, {
        status: "DRAFT" as any,
        negotiationNotes,
      });
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "REJECT_OFFER",
        entityType: "offer",
        entityId: id,
        oldValue: JSON.stringify(offer),
        newValue: JSON.stringify({ status: "DRAFT", negotiationNotes }),
      });
      
      return { success: true };
    }),
});

// ============ LEAD REQUEST ROUTER ============

const leadRequestRouter = router({
  submit: publicProcedure
    .input(z.object({
      offerId: z.number(),
      clientName: z.string().min(1),
      clientEmail: z.string().email(),
      clientPhone: z.string().optional(),
      companyName: z.string().optional(),
      painPoint: z.string().optional(),
      attachments: z.string().optional(),
      lgpdConsent: z.number(),
    }))
    .mutation(async ({ input }) => {
      if (!input.lgpdConsent) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Consentimento LGPD é obrigatório" });
      }
      
      // Criar lead request
      const leadRequestResult = await db.createLeadRequest(input);
      const leadRequestId = (leadRequestResult as any).insertId;
      
      // Buscar oferta e parceiro
      const offer = await db.getOfferById(input.offerId);
      if (!offer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Oferta não encontrada" });
      }
      
      const partner = offer.partnerId ? await db.getPartnerById(offer.partnerId) : null;
      
      // Criar referral
      const ackDeadline = new Date();
      ackDeadline.setHours(ackDeadline.getHours() + (offer.partnerAckHours || 48));
      
      const referralData: any = {
        offerId: input.offerId,
        partnerId: partner?.id || 0,
        leadRequestId,
        buyerCompany: input.companyName,
        buyerContact: input.clientName,
        origin: "ZOPU_MARKET",
        status: "SENT",
        successFeePercent: offer.successFeePercent,
        ackDeadline,
      };
      
      const referralResult = await db.createReferral(referralData);
      const referralId = (referralResult as any).insertId;
      
      // Se parceiro tem Bitrix configurado, criar lead
      if (partner?.bitrixWebhookUrl) {
        try {
          const { createBitrixLead } = await import("./bitrix");
          
          const bitrixResult = await createBitrixLead(partner.bitrixWebhookUrl, {
            TITLE: `Lead ZOPUMarket - ${offer.title}`,
            NAME: input.clientName,
            EMAIL: [{ VALUE: input.clientEmail, VALUE_TYPE: "WORK" }],
            PHONE: input.clientPhone ? [{ VALUE: input.clientPhone, VALUE_TYPE: "WORK" }] : undefined,
            COMPANY_TITLE: input.companyName,
            COMMENTS: input.painPoint,
            SOURCE_ID: "WEB",
            SOURCE_DESCRIPTION: "ZOPUMarket",
            UF_CRM_OFFER_ID: input.offerId.toString(),
            UF_CRM_REFERRAL_ID: referralId.toString(),
            UF_CRM_SUCCESS_FEE: offer.successFeePercent.toString() + "%",
          });
          
          if (bitrixResult.success && bitrixResult.leadId) {
            await db.updateReferral(referralId, {
              partnerLeadId: bitrixResult.leadId,
            });
          }
        } catch (error) {
          console.error("[LeadRequest] Erro ao criar lead no Bitrix:", error);
        }
      }
      
      return { success: true, referralId };
    }),
});

// ============ REFERRAL ROUTER ============

const referralRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role === "parceiro" && ctx.user.partnerId) {
      return await db.getReferralsByPartner(ctx.user.partnerId);
    } else if (ctx.user.role === "gerente_contas") {
      return await db.getReferralsByGerente(ctx.user.id);
    } else if (ctx.user.role === "admin") {
      // Admin vê todos
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      const { referrals } = await import("../drizzle/schema");
      return dbInstance.select().from(referrals);
    }
    return [];
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const referral = await db.getReferralById(input.id);
      if (!referral) throw new TRPCError({ code: "NOT_FOUND" });
      
      // Verificar permissões
      if (ctx.user.role === "parceiro" && ctx.user.partnerId !== referral.partnerId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (ctx.user.role === "gerente_contas" && ctx.user.id !== referral.gerenteId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      return referral;
    }),

  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["SENT", "ACKED", "IN_NEGOTIATION", "WON", "LOST", "OVERDUE"]),
      wonValue: z.number().optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, status, wonValue, internalNotes } = input;
      const referral = await db.getReferralById(id);
      
      if (!referral) throw new TRPCError({ code: "NOT_FOUND" });
      
      // Parceiros podem atualizar suas próprias indicações
      if (ctx.user.role === "parceiro" && ctx.user.partnerId !== referral.partnerId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      const updateData: any = {
        status,
        lastStatusUpdate: new Date(),
      };
      
      if (wonValue !== undefined) updateData.wonValue = wonValue;
      if (internalNotes !== undefined) updateData.internalNotes = internalNotes;
      
      // Calcular success fee realizado se WON
      if (status === "WON" && wonValue) {
        updateData.successFeeRealized = Math.round((wonValue * referral.successFeePercent) / 100);
      }
      
      await db.updateReferral(id, updateData);
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_REFERRAL_STATUS",
        entityType: "referral",
        entityId: id,
        oldValue: referral.status,
        newValue: status,
      });
      
      return { success: true };
    }),
    
  checkOverdueSLAs: adminProcedure.mutation(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return { updated: 0 };
    
    const { referrals } = await import("../drizzle/schema");
    const { eq, and, lt } = await import("drizzle-orm");
    
    const overdueReferrals = await dbInstance
      .select()
      .from(referrals)
      .where(
        and(
          eq(referrals.status, "SENT"),
          lt(referrals.ackDeadline, new Date())
        )
      );
    
    let updated = 0;
    
    for (const referral of overdueReferrals) {
      await db.updateReferral(referral.id, {
        status: "OVERDUE",
        lastStatusUpdate: new Date(),
      });
      
      console.log(`[SLA Check] Referral ${referral.id} marcado como OVERDUE`);
      updated++;
    }
    
    return { updated, checked: overdueReferrals.length };
  }),
});

// ============ ORDER ROUTER ============

const orderRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getOrdersByBuyer(ctx.user.id);
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const order = await db.getOrderById(input.id);
      if (!order) throw new TRPCError({ code: "NOT_FOUND" });
      
      // Usuários só podem ver seus próprios pedidos (exceto admin)
      if (ctx.user.role !== "admin" && order.buyerId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      
      return order;
    }),

  create: protectedProcedure
    .input(z.object({
      offerId: z.number(),
      quantity: z.number().min(1),
    }))
    .mutation(async ({ input, ctx }) => {
      const offer = await db.getOfferById(input.offerId);
      if (!offer) throw new TRPCError({ code: "NOT_FOUND", message: "Oferta não encontrada" });
      if (!offer.price) throw new TRPCError({ code: "BAD_REQUEST", message: "Oferta não tem preço definido" });
      
      const unitPrice = offer.price;
      const totalAmount = unitPrice * input.quantity;
      
      let zopuAmount = totalAmount;
      let partnerAmount = 0;
      let splitApplied = 0;
      
      if (offer.splitEnabled && offer.zopuTakeRatePercent && offer.partnerSharePercent) {
        zopuAmount = Math.round((totalAmount * offer.zopuTakeRatePercent) / 100);
        partnerAmount = Math.round((totalAmount * offer.partnerSharePercent) / 100);
        splitApplied = 1;
      }
      
      const result = await db.createOrder({
        offerId: input.offerId,
        buyerId: ctx.user.id,
        quantity: input.quantity,
        unitPrice,
        totalAmount,
        zopuAmount,
        partnerAmount,
        splitApplied,
        paymentStatus: "PENDING",
      });
      
      return result;
    }),
});

// ============ BITRIX ROUTER ============

const bitrixRouter = router({
  testConnection: protectedProcedure
    .input(z.object({ webhookUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const { testBitrixConnection } = await import("./bitrix");
      return await testBitrixConnection(input.webhookUrl);
    }),

  getUsers: protectedProcedure
    .input(z.object({ webhookUrl: z.string().url() }))
    .query(async ({ input }) => {
      const { getBitrixUsers } = await import("./bitrix");
      return await getBitrixUsers(input.webhookUrl);
    }),
});

// ============ AUDIT ROUTER ============

const auditRouter = router({
  list: adminProcedure
    .input(z.object({
      userId: z.number().optional(),
      entityType: z.string().optional(),
      entityId: z.number().optional(),
      limit: z.number().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAuditLogs(input);
    }),
});

// ============ REVIEW ROUTER ============

const reviewRouter = router({
  listByPartner: publicProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getReviewsByPartner(input.partnerId);
    }),

  listAll: publicProcedure.query(async () => {
    return await db.getAllReviews();
  }),

  create: protectedProcedure
    .input(z.object({
      partnerId: z.number(),
      rating: z.number().min(1).max(5),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Criar review
      const result = await db.createReview({
        partnerId: input.partnerId,
        reviewerName: ctx.user.name || "Usuário Anônimo",
        reviewerCompany: null,
        rating: input.rating,
        comment: input.comment || null,
        isVerified: 1, // Usuário autenticado = verificado
      });
      
      return result;
    }),
});

// ============ FAVORITE ROUTER ============

const notificationRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    return await db.getNotificationsByUser(ctx.user.openId || "");
  }),
  
  unreadCount: protectedProcedure.query(async ({ ctx }) => {
    return await db.getUnreadNotificationsCount(ctx.user.openId || "");
  }),
  
  markAsRead: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.markNotificationAsRead(input.id);
      return { success: true };
    }),
  
  markAllAsRead: protectedProcedure.mutation(async ({ ctx }) => {
    await db.markAllNotificationsAsRead(ctx.user.openId || "");
    return { success: true };
  }),
});

const favoriteRouter = router({
  add: protectedProcedure
    .input(z.object({
      offerId: z.number().optional(),
      partnerId: z.number().optional(),
      type: z.enum(["offer", "partner"]),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.addFavorite(
        ctx.user.openId || "",
        input.offerId || null,
        input.partnerId || null,
        input.type
      );
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({
      offerId: z.number().optional(),
      partnerId: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      await db.removeFavorite(
        ctx.user.openId || "",
        input.offerId || null,
        input.partnerId || null
      );
      return { success: true };
    }),

  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getFavoritesByUser(ctx.user.openId || "");
    }),

  check: protectedProcedure
    .input(z.object({
      offerId: z.number().optional(),
      partnerId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      const isFav = await db.isFavorite(
        ctx.user.openId || "",
        input.offerId || null,
        input.partnerId || null
      );
      return { isFavorite: isFav };
    }),
});

// ============ APP ROUTER ============

const invitationRouter = router({
  create: adminProcedure
    .input(z.object({
      email: z.string().email(),
      name: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { token, expiresAt } = await db.createUserInvitation({
        email: input.email,
        name: input.name,
        createdBy: ctx.user.openId || "",
      });
      
      // TODO: Enviar email com link de convite
      const inviteLink = `${process.env.VITE_OAUTH_PORTAL_URL || 'http://localhost:3000'}/register/${token}`;
      
      return { 
        success: true, 
        token, 
        inviteLink,
        expiresAt 
      };
    }),
    
  list: adminProcedure
    .query(async () => {
      return await db.listInvitations();
    }),
    
  validate: publicProcedure
    .input(z.object({ token: z.string() }))
    .query(async ({ input }) => {
      const invitation = await db.getInvitationByToken(input.token);
      
      if (!invitation) {
        return { valid: false, reason: 'not_found' };
      }
      
      if (invitation.usedAt) {
        return { valid: false, reason: 'already_used' };
      }
      
      if (new Date() > new Date(invitation.expiresAt)) {
        return { valid: false, reason: 'expired' };
      }
      
      return { 
        valid: true, 
        email: invitation.email,
        name: invitation.name 
      };
    }),
});

const contractRouter = router({
  create: protectedProcedure
    .input(z.object({
      offerId: z.number(),
      partnerId: z.number(),
      contractDate: z.string(),
      value: z.string().optional(),
      period: z.string().optional(),
      comments: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return await db.createServiceContract({
        userId: Number(ctx.user.id),
        offerId: input.offerId,
        partnerId: input.partnerId,
        contractDate: new Date(input.contractDate),
        value: input.value,
        period: input.period,
        comments: input.comments,
      });
    }),
    
  checkEligibility: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await db.checkContractEligibility(Number(ctx.user.id), input.offerId);
    }),

  listPending: adminProcedure
    .query(async () => {
      return await db.getPendingContracts();
    }),

  approve: adminProcedure
    .input(z.object({
      contractId: z.number(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.approveContract(input.contractId, input.comment);
    }),

  reject: adminProcedure
    .input(z.object({
      contractId: z.number(),
      comment: z.string(),
    }))
    .mutation(async ({ input }) => {
      return await db.rejectContract(input.contractId, input.comment);
    }),
});

const leadRouter = router({
  create: publicProcedure
    .input(z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      companyName: z.string(),
      message: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      await db.insert(clientLeads).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        companyName: input.companyName,
        message: input.message || null,
        status: "new",
      });
      
      return { success: true };
    }),
});

// ============ PARTNER CASE ROUTER ============

const partnerCaseRouter = router({
  listByPartner: publicProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getCasesByPartner(input.partnerId);
    }),

  listAll: adminProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getAllCasesByPartner(input.partnerId);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCaseById(input.id);
    }),

  create: parceiroProcedure
    .input(z.object({
      title: z.string().min(1),
      clientName: z.string().min(1),
      clientCompany: z.string().optional(),
      description: z.string().min(1),
      results: z.string().optional(),
      testimonial: z.string().optional(),
      imageUrl: z.string().optional(),
      displayOrder: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.partnerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a um parceiro" });
      }

      return await db.createPartnerCase({
        partnerId: ctx.user.partnerId,
        ...input,
      });
    }),

  adminCreate: adminProcedure
    .input(z.object({
      partnerId: z.number(),
      title: z.string().min(1),
      clientName: z.string().min(1),
      clientCompany: z.string().optional(),
      description: z.string().min(1),
      results: z.string().optional(),
      testimonial: z.string().optional(),
      imageUrl: z.string().optional(),
      displayOrder: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.createPartnerCase(input);
    }),

  adminUpdate: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      clientName: z.string().min(1).optional(),
      clientCompany: z.string().optional(),
      description: z.string().min(1).optional(),
      results: z.string().optional(),
      testimonial: z.string().optional(),
      imageUrl: z.string().optional(),
      displayOrder: z.number().optional(),
      isPublished: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      return await db.updatePartnerCase(input.id, input);
    }),

  adminDelete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      return await db.deletePartnerCase(input.id);
    }),
});

const badgeRouter = router({
  updateCommunityFavorites: adminProcedure
    .mutation(async () => {
      return await db.updateCommunityFavoriteBadges();
    }),

  update: parceiroProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      clientName: z.string().min(1).optional(),
      clientCompany: z.string().optional(),
      description: z.string().min(1).optional(),
      results: z.string().optional(),
      testimonial: z.string().optional(),
      imageUrl: z.string().optional(),
      displayOrder: z.number().optional(),
      isPublished: z.number().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const caseItem = await db.getCaseById(id);
      
      if (!caseItem || caseItem.partnerId !== ctx.user.partnerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      return await db.updatePartnerCase(id, updateData);
    }),

  delete: parceiroProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const caseItem = await db.getCaseById(input.id);
      
      if (!caseItem || caseItem.partnerId !== ctx.user.partnerId) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      return await db.deletePartnerCase(input.id);
    }),
});

// Search router
const searchRouter = router({
  unified: publicProcedure
    .input(z.object({ query: z.string().min(2) }))
    .query(async ({ input }) => {
      const results = await db.unifiedSearch(input.query);
      
      // Format results
      const formatted = [
        ...results.offers.map((o: any) => ({
          type: "offer" as const,
          id: o.id,
          title: o.title,
          subtitle: o.partnerName || undefined,
        })),
        ...results.partners.map((p: any) => ({
          type: "partner" as const,
          id: p.id,
          title: p.companyName,
          subtitle: p.description || undefined,
        })),
        ...results.categories.map((c: any) => ({
          type: "category" as const,
          id: c.id,
          title: c.name,
          subtitle: c.description || undefined,
        })),
      ];
      
      return formatted;
    }),
});

// ============ ANALYTICS ROUTER ============

const analyticsRouter = router({
  track: publicProcedure
    .input(z.object({
      partnerId: z.number().optional(),
      offerId: z.number().optional(),
      eventType: z.string(),
      metadata: z.any().optional(),
    }))
    .mutation(async ({ input }) => {
      await db.trackEvent(input);
      return { success: true };
    }),

  getPartnerMetrics: protectedProcedure
    .input(z.object({
      partnerId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Se não for admin, só pode ver métricas do próprio parceiro
      let targetPartnerId = input.partnerId;
      
      if (ctx.user.role === "parceiro") {
        if (!ctx.user.partnerId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Parceiro não vinculado" });
        }
        targetPartnerId = ctx.user.partnerId;
      } else if (ctx.user.role === "admin") {
        // Admin pode ver métricas de qualquer parceiro
        // Se não especificar partnerId, usa o partnerId do próprio admin (se houver)
        if (!input.partnerId) {
          if (ctx.user.partnerId) {
            targetPartnerId = ctx.user.partnerId;
          } else {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Admin deve especificar partnerId" });
          }
        } else {
          targetPartnerId = input.partnerId;
        }
      } else {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      if (!targetPartnerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "partnerId é obrigatório" });
      }

      return await db.getPartnerMetrics(targetPartnerId, input.startDate, input.endDate);
    }),

  exportReport: protectedProcedure
    .input(z.object({
      partnerId: z.number().optional(),
      startDate: z.date().optional(),
      endDate: z.date().optional(),
    }))
    .query(async ({ input, ctx }) => {
      // Mesma lógica de permissões do getPartnerMetrics
      let targetPartnerId = input.partnerId;
      
      if (ctx.user.role === "parceiro") {
        if (!ctx.user.partnerId) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Parceiro não vinculado" });
        }
        targetPartnerId = ctx.user.partnerId;
      } else if (ctx.user.role === "admin") {
        // Admin pode ver métricas de qualquer parceiro
        // Se não especificar partnerId, usa o partnerId do próprio admin (se houver)
        if (!input.partnerId) {
          if (ctx.user.partnerId) {
            targetPartnerId = ctx.user.partnerId;
          } else {
            throw new TRPCError({ code: "BAD_REQUEST", message: "Admin deve especificar partnerId" });
          }
        } else {
          targetPartnerId = input.partnerId;
        }
      } else {
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
      }

      if (!targetPartnerId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "partnerId é obrigatório" });
      }

      const csvContent = await db.generateMetricsCSV(targetPartnerId, input.startDate, input.endDate);
      
      return {
        content: csvContent,
        filename: `relatorio-metricas-${targetPartnerId}-${new Date().toISOString().split('T')[0]}.csv`,
      };
    }),
});

// ============ BUYER ROUTER ============

const buyerRouter = router({
  searchCNPJ: publicProcedure
    .input(z.object({ cnpj: z.string().min(14).max(18) }))
    .query(async ({ input }) => {
      const { searchCNPJ } = await import("./_core/receitaws");
      const data = await searchCNPJ(input.cnpj);
      
      if (!data) {
        throw new TRPCError({ code: "NOT_FOUND", message: "CNPJ não encontrado ou inválido" });
      }
      
      return data;
    }),

  getProfile: protectedProcedure
    .query(async ({ ctx }) => {
      const buyer = await db.getBuyerByUserId(ctx.user.id);
      return buyer;
    }),

  completeProfile: protectedProcedure
    .input(z.object({
      cnpj: z.string().min(14).max(18),
      razaoSocial: z.string().optional(),
      nomeFantasia: z.string().optional(),
      porte: z.string().optional(),
      cnaePrincipal: z.string().optional(),
      cnaePrincipalDescricao: z.string().optional(),
      cnaesSecundarios: z.string().optional(),
      regimeTributario: z.string().optional(),
      dataAbertura: z.string().optional(),
      situacaoCadastral: z.string().optional(),
      logradouro: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      municipio: z.string().optional(),
      uf: z.string().optional(),
      cep: z.string().optional(),
      photoUrl: z.string().optional(),
      cargo: z.string().optional(),
      departamento: z.string().optional(),
      telefone: z.string().optional(),
      whatsapp: z.string().optional(),
      interessesTexto: z.string().optional(),
      categoriasInteresse: z.string().optional(),
      bitrixUrl: z.string().optional(),
      bitrixLicenseType: z.string().optional(),
      bitrixLicenseExpiry: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { classifyEcosystem, calculateLeadScore } = await import("./_core/receitaws");
      
      // Verificar se já existe buyer para este usuário
      const existingBuyer = await db.getBuyerByUserId(ctx.user.id);
      
      // Classificar ecossistema baseado no CNAE
      const ecossistema = input.cnaePrincipal ? classifyEcosystem(input.cnaePrincipal) : "Outros";
      const leadScore = input.porte ? calculateLeadScore(input.porte) : 50;
      
      if (existingBuyer) {
        // Atualizar perfil existente
        const updateData = {
          ...input,
          bitrixLicenseExpiry: input.bitrixLicenseExpiry ? new Date(input.bitrixLicenseExpiry) : undefined,
          ecossistema,
          leadScore,
          profileComplete: 1,
        };
        await db.updateBuyer(existingBuyer.id, updateData);
        
        await createAuditLog({
          userId: ctx.user.id,
          action: "UPDATE_BUYER_PROFILE",
          entityType: "buyer",
          entityId: existingBuyer.id,
          newValue: JSON.stringify(input),
        });
      } else {
        // Criar novo perfil
        const createData = {
          userId: ctx.user.id,
          ...input,
          bitrixLicenseExpiry: input.bitrixLicenseExpiry ? new Date(input.bitrixLicenseExpiry) : undefined,
          ecossistema,
          leadScore,
          profileComplete: 1,
          status: "ACTIVE" as any,
        };
        await db.createBuyer(createData);
        
        await createAuditLog({
          userId: ctx.user.id,
          action: "CREATE_BUYER_PROFILE",
          entityType: "buyer",
          newValue: JSON.stringify(input),
        });
      }
      
      return { success: true };
    }),

  uploadPhoto: protectedProcedure
    .input(z.object({
      fileData: z.string(), // Base64 encoded image
      fileName: z.string(),
      contentType: z.string(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { storagePut } = await import("./storage");
      
      // Validar tamanho (5MB max)
      const buffer = Buffer.from(input.fileData, 'base64');
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (buffer.length > maxSize) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Imagem muito grande. Tamanho máximo: 5MB" 
        });
      }
      
      // Validar formato
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(input.contentType)) {
        throw new TRPCError({ 
          code: "BAD_REQUEST", 
          message: "Formato inválido. Use JPG, PNG ou WEBP" 
        });
      }
      
      // Gerar nome único
      const timestamp = Date.now();
      const randomSuffix = Math.random().toString(36).substring(7);
      const ext = input.fileName.split('.').pop();
      const fileKey = `buyer-photos/${ctx.user.id}-${timestamp}-${randomSuffix}.${ext}`;
      
      // Upload para S3
      const { url } = await storagePut(fileKey, buffer, input.contentType);
      
      // Atualizar perfil do comprador
      const buyer = await db.getBuyerByUserId(ctx.user.id);
      if (buyer) {
        await db.updateBuyer(buyer.id, { photoUrl: url });
      }
      
      return { url };
    }),

  updateProfile: protectedProcedure
    .input(z.object({
      photoUrl: z.string().optional(),
      cargo: z.string().optional(),
      departamento: z.string().optional(),
      telefone: z.string().optional(),
      whatsapp: z.string().optional(),
      interessesTexto: z.string().optional(),
      categoriasInteresse: z.string().optional(),
      bitrixUrl: z.string().optional(),
      bitrixLicenseType: z.string().optional(),
      bitrixLicenseExpiry: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const buyer = await db.getBuyerByUserId(ctx.user.id);
      
      if (!buyer) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Perfil de comprador não encontrado" });
      }
      
      // Converter bitrixLicenseExpiry de string para Date se fornecido
      const updateData = {
        ...input,
        bitrixLicenseExpiry: input.bitrixLicenseExpiry ? new Date(input.bitrixLicenseExpiry) : undefined,
      };
      
      await db.updateBuyer(buyer.id, updateData);
      
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_BUYER_PROFILE",
        entityType: "buyer",
        entityId: buyer.id,
        oldValue: JSON.stringify(buyer),
        newValue: JSON.stringify(input),
      });
      
      return { success: true };
    }),

  listAll: adminProcedure
    .input(z.object({
      ecossistema: z.string().optional(),
      status: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllBuyers(input);
    }),

  getRecommendations: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.getRecommendationsForBuyer(ctx.user.id);
    }),
});

// License management router
const licenseRouter = router({
  getExpiring: adminProcedure
    .input(z.object({
      days: z.number().optional().default(90),
    }))
    .query(async ({ input }) => {
      const { getLicensesExpiring } = await import("./_core/licenseNotifications");
      return await getLicensesExpiring(input.days);
    }),

  checkExpirations: adminProcedure
    .mutation(async () => {
      const { checkLicenseExpirations } = await import("./_core/licenseNotifications");
      const result = await checkLicenseExpirations();
      
      await createAuditLog({
        userId: 1, // System
        action: "CHECK_LICENSE_EXPIRATIONS",
        entityType: "license",
        newValue: JSON.stringify(result),
      });
      
      return result;
    }),

  getMetrics: adminProcedure
    .query(async () => {
      const { getLicenseMetrics } = await import("./_core/licenseMetrics");
      return await getLicenseMetrics();
    }),
});

// ============ COMMISSION ROUTER ============

const commissionRouter = router({
  getSummary: adminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return null;
      
      const { referrals } = await import("../drizzle/schema");
      const { sql, and, gte, lte } = await import("drizzle-orm");
      
      // Construir filtros de data
      const filters = [];
      if (input.startDate) {
        filters.push(gte(referrals.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        filters.push(lte(referrals.createdAt, new Date(input.endDate)));
      }
      
      // Buscar todos os referrals no período
      const allReferrals = await dbInstance
        .select()
        .from(referrals)
        .where(filters.length > 0 ? and(...filters) : undefined);
      
      // Calcular métricas
      const totalReferrals = allReferrals.length;
      const totalPrevisto = allReferrals.reduce((sum, r) => sum + (r.successFeeExpected || 0), 0);
      const totalRealizado = allReferrals.reduce((sum, r) => sum + (r.successFeeRealized || 0), 0);
      const totalWon = allReferrals.filter(r => r.status === "WON").length;
      const totalLost = allReferrals.filter(r => r.status === "LOST").length;
      const totalInProgress = allReferrals.filter(r => ["SENT", "ACKED", "IN_NEGOTIATION"].includes(r.status)).length;
      
      const conversionRate = totalReferrals > 0 ? (totalWon / totalReferrals) * 100 : 0;
      
      return {
        totalReferrals,
        totalPrevisto,
        totalRealizado,
        totalWon,
        totalLost,
        totalInProgress,
        conversionRate,
      };
    }),
    
  getByPartner: adminProcedure
    .input(z.object({
      partnerId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { referrals, partners } = await import("../drizzle/schema");
      const { eq, and, gte, lte } = await import("drizzle-orm");
      
      // Construir filtros
      const filters = [];
      if (input.partnerId) {
        filters.push(eq(referrals.partnerId, input.partnerId));
      }
      if (input.startDate) {
        filters.push(gte(referrals.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        filters.push(lte(referrals.createdAt, new Date(input.endDate)));
      }
      
      // Buscar referrals com dados do parceiro
      const results = await dbInstance
        .select({
          referralId: referrals.id,
          partnerId: referrals.partnerId,
          partnerName: partners.legalName,
          status: referrals.status,
          expectedValue: referrals.expectedValue,
          wonValue: referrals.wonValue,
          successFeeExpected: referrals.successFeeExpected,
          successFeeRealized: referrals.successFeeRealized,
          createdAt: referrals.createdAt,
          lastStatusUpdate: referrals.lastStatusUpdate,
        })
        .from(referrals)
        .leftJoin(partners, eq(referrals.partnerId, partners.id))
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(referrals.createdAt);
      
      return results;
    }),
    
  getByCategory: adminProcedure
    .input(z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { referrals, offers, categories } = await import("../drizzle/schema");
      const { eq, and, gte, lte, sql } = await import("drizzle-orm");
      
      // Construir filtros de data
      const filters = [];
      if (input.startDate) {
        filters.push(gte(referrals.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        filters.push(lte(referrals.createdAt, new Date(input.endDate)));
      }
      
      // Buscar referrals com categoria da oferta
      const results = await dbInstance
        .select({
          categoryId: categories.id,
          categoryName: categories.name,
          totalReferrals: sql<number>`count(${referrals.id})`,
          totalPrevisto: sql<number>`sum(${referrals.successFeeExpected})`,
          totalRealizado: sql<number>`sum(${referrals.successFeeRealized})`,
          totalWon: sql<number>`sum(case when ${referrals.status} = 'WON' then 1 else 0 end)`,
        })
        .from(referrals)
        .leftJoin(offers, eq(referrals.offerId, offers.id))
        .leftJoin(categories, eq(offers.categoryId, categories.id))
        .where(filters.length > 0 ? and(...filters) : undefined)
        .groupBy(categories.id, categories.name);
      
      return results;
    }),
    
  getMonthlyEvolution: adminProcedure
    .input(z.object({
      months: z.number().optional().default(12),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { referrals } = await import("../drizzle/schema");
      const { sql, gte } = await import("drizzle-orm");
      
      // Data de início (X meses atrás)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);
      
      // Buscar referrals agrupados por mês
      const results = await dbInstance
        .select({
          month: sql<string>`DATE_FORMAT(createdAt, '%Y-%m')`,
          totalReferrals: sql<number>`count(id)`,
          totalPrevisto: sql<number>`COALESCE(sum(successFeeExpected), 0)`,
          totalRealizado: sql<number>`COALESCE(sum(successFeeRealized), 0)`,
          totalWon: sql<number>`sum(case when status = 'WON' then 1 else 0 end)`,
        })
        .from(referrals)
        .where(gte(referrals.createdAt, startDate))
        .groupBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`)
        .orderBy(sql`DATE_FORMAT(createdAt, '%Y-%m')`);
      
      return results;
    }),
    
  exportCSV: adminProcedure
    .input(z.object({
      type: z.enum(["by_partner"]),
      partnerId: z.number().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return { csv: "", filename: "error.csv" };
      
      const { referrals, partners } = await import("../drizzle/schema");
      const { eq, and, gte, lte } = await import("drizzle-orm");
      
      // Construir filtros
      const filters = [];
      if (input.partnerId) {
        filters.push(eq(referrals.partnerId, input.partnerId));
      }
      if (input.startDate) {
        filters.push(gte(referrals.createdAt, new Date(input.startDate)));
      }
      if (input.endDate) {
        filters.push(lte(referrals.createdAt, new Date(input.endDate)));
      }
      
      // Buscar dados
      const results = await dbInstance
        .select({
          referralId: referrals.id,
          partnerName: partners.legalName,
          status: referrals.status,
          expectedValue: referrals.expectedValue,
          wonValue: referrals.wonValue,
          successFeeExpected: referrals.successFeeExpected,
          successFeeRealized: referrals.successFeeRealized,
          createdAt: referrals.createdAt,
        })
        .from(referrals)
        .leftJoin(partners, eq(referrals.partnerId, partners.id))
        .where(filters.length > 0 ? and(...filters) : undefined);
      
      // Gerar CSV
      const headers = ["ID", "Parceiro", "Status", "Valor Esperado", "Valor Ganho", "Comissão Prevista", "Comissão Realizada", "Data"];
      const csvRows = [headers.join(",")];
      
      for (const row of results) {
        const values = [
          row.referralId,
          row.partnerName || "N/A",
          row.status,
          row.expectedValue || 0,
          row.wonValue || 0,
          row.successFeeExpected || 0,
          row.successFeeRealized || 0,
          row.createdAt ? new Date(row.createdAt).toLocaleDateString("pt-BR") : "N/A",
        ];
        csvRows.push(values.join(","));
      }
      
      return {
        csv: csvRows.join("\n"),
        filename: `comissoes_${input.type}_${new Date().toISOString().split("T")[0]}.csv`,
      };
    }),
});

// ============ GERENTE ROUTER ============

const gerenteRouter = router({
  // Dashboard: Indicações por carteira do gerente
  getMyReferrals: gerenteProcedure
    .input(z.object({
      status: z.enum(["SENT", "ACKED", "IN_NEGOTIATION", "WON", "LOST", "OVERDUE"]).optional(),
      limit: z.number().optional().default(100),
    }))
    .query(async ({ ctx, input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { referrals, offers, partners, users } = await import("../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      
      // Construir filtros
      const filters = [eq(referrals.gerenteId, ctx.user.id)];
      if (input.status) {
        filters.push(eq(referrals.status, input.status));
      }
      
      const results = await dbInstance
        .select({
          id: referrals.id,
          offerId: referrals.offerId,
          offerTitle: offers.title,
          partnerId: referrals.partnerId,
          partnerName: partners.companyName,
          buyerCompany: referrals.buyerCompany,
          buyerContact: referrals.buyerContact,
          status: referrals.status,
          origin: referrals.origin,
          expectedValue: referrals.expectedValue,
          wonValue: referrals.wonValue,
          successFeeExpected: referrals.successFeeExpected,
          successFeeRealized: referrals.successFeeRealized,
          internalNotes: referrals.internalNotes,
          lastStatusUpdate: referrals.lastStatusUpdate,
          createdAt: referrals.createdAt,
        })
        .from(referrals)
        .leftJoin(offers, eq(referrals.offerId, offers.id))
        .leftJoin(partners, eq(referrals.partnerId, partners.id))
        .where(and(...filters))
        .orderBy(desc(referrals.createdAt))
        .limit(input.limit);
      
      return results;
    }),
  
  // Alertas de Follow-up (indicações que precisam de atenção)
  getFollowUpAlerts: gerenteProcedure.query(async ({ ctx }) => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return [];
    
    const { referrals, offers, partners } = await import("../drizzle/schema");
    const { eq, and, sql, inArray } = await import("drizzle-orm");
    
    // Buscar indicações em andamento do gerente que estão há mais de 7 dias sem atualização
    const results = await dbInstance
      .select({
        id: referrals.id,
        offerId: referrals.offerId,
        offerTitle: offers.title,
        partnerId: referrals.partnerId,
        partnerName: partners.companyName,
        buyerCompany: referrals.buyerCompany,
        status: referrals.status,
        lastStatusUpdate: referrals.lastStatusUpdate,
        daysSinceUpdate: sql<number>`DATEDIFF(NOW(), ${referrals.lastStatusUpdate})`,
        createdAt: referrals.createdAt,
      })
      .from(referrals)
      .leftJoin(offers, eq(referrals.offerId, offers.id))
      .leftJoin(partners, eq(referrals.partnerId, partners.id))
      .where(
        and(
          eq(referrals.gerenteId, ctx.user.id),
          inArray(referrals.status, ["SENT", "ACKED", "IN_NEGOTIATION"]),
          sql`DATEDIFF(NOW(), ${referrals.lastStatusUpdate}) > 7`
        )
      )
      .orderBy(sql`DATEDIFF(NOW(), ${referrals.lastStatusUpdate}) DESC`);
    
    return results;
  }),
  
  // Criar indicação manual (assisted referral)
  createManualReferral: gerenteProcedure
    .input(z.object({
      offerId: z.number(),
      partnerId: z.number(),
      buyerCompany: z.string(),
      buyerContact: z.string(),
      expectedValue: z.number().optional(),
      internalNotes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { referrals, offers } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");
      
      // Buscar oferta para pegar successFeePercent
      const offer = await dbInstance.select().from(offers).where(eq(offers.id, input.offerId)).limit(1);
      if (!offer || offer.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Oferta não encontrada" });
      }
      
      const successFeePercent = offer[0].successFeePercent;
      const successFeeExpected = input.expectedValue ? Math.round((input.expectedValue * successFeePercent) / 100) : null;
      
      // Criar indicação
      const [newReferral] = await dbInstance.insert(referrals).values({
        offerId: input.offerId,
        partnerId: input.partnerId,
        gerenteId: ctx.user.id,
        buyerCompany: input.buyerCompany,
        buyerContact: input.buyerContact,
        origin: "ASSISTED_REFERRAL",
        status: "SENT",
        expectedValue: input.expectedValue || null,
        successFeePercent,
        successFeeExpected,
        internalNotes: input.internalNotes || null,
        lastStatusUpdate: new Date(),
      });
      
      // Criar log de auditoria
      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_MANUAL_REFERRAL",
        entityType: "REFERRAL",
        entityId: newReferral.insertId,
        newValue: JSON.stringify({
          offerId: input.offerId,
          partnerId: input.partnerId,
          buyerCompany: input.buyerCompany,
          origin: "ASSISTED_REFERRAL",
        }),
      });
      
      return { id: newReferral.insertId, success: true };
    }),
  
  // Adicionar/atualizar observações internas
  updateInternalNotes: gerenteProcedure
    .input(z.object({
      referralId: z.number(),
      notes: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });
      
      const { referrals } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");
      
      // Buscar referral atual para pegar valor antigo
      const current = await dbInstance
        .select({ internalNotes: referrals.internalNotes })
        .from(referrals)
        .where(
          and(
            eq(referrals.id, input.referralId),
            eq(referrals.gerenteId, ctx.user.id)
          )
        )
        .limit(1);
      
      if (!current || current.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Indicação não encontrada ou você não tem permissão" });
      }
      
      // Atualizar notas
      await dbInstance
        .update(referrals)
        .set({ internalNotes: input.notes })
        .where(
          and(
            eq(referrals.id, input.referralId),
            eq(referrals.gerenteId, ctx.user.id)
          )
        );
      
      // Criar log de auditoria
      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_INTERNAL_NOTES",
        entityType: "REFERRAL",
        entityId: input.referralId,
        oldValue: JSON.stringify({ internalNotes: current[0].internalNotes }),
        newValue: JSON.stringify({ internalNotes: input.notes }),
      });
      
      return { success: true };
    }),
  
  // Estatísticas do dashboard
  getDashboardStats: gerenteProcedure.query(async ({ ctx }) => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return null;
    
    const { referrals } = await import("../drizzle/schema");
    const { eq, sql } = await import("drizzle-orm");
    
    const [stats] = await dbInstance
      .select({
        totalReferrals: sql<number>`count(${referrals.id})`,
        inProgress: sql<number>`sum(case when ${referrals.status} IN ('SENT', 'ACKED', 'IN_NEGOTIATION') then 1 else 0 end)`,
        won: sql<number>`sum(case when ${referrals.status} = 'WON' then 1 else 0 end)`,
        lost: sql<number>`sum(case when ${referrals.status} = 'LOST' then 1 else 0 end)`,
        totalExpectedValue: sql<number>`COALESCE(sum(${referrals.expectedValue}), 0)`,
        totalWonValue: sql<number>`COALESCE(sum(${referrals.wonValue}), 0)`,
        totalCommission: sql<number>`COALESCE(sum(${referrals.successFeeRealized}), 0)`,
        conversionRate: sql<number>`ROUND((sum(case when ${referrals.status} = 'WON' then 1 else 0 end) / count(${referrals.id})) * 100, 2)`,
      })
      .from(referrals)
      .where(eq(referrals.gerenteId, ctx.user.id));
    
    // Converter valores para números (MySQL retorna alguns como string/object)
    return {
      totalReferrals: Number(stats.totalReferrals) || 0,
      inProgress: Number(stats.inProgress) || 0,
      won: Number(stats.won) || 0,
      lost: Number(stats.lost) || 0,
      totalExpectedValue: Number(stats.totalExpectedValue) || 0,
      totalWonValue: Number(stats.totalWonValue) || 0,
      totalCommission: Number(stats.totalCommission) || 0,
      conversionRate: Number(stats.conversionRate) || 0,
    };
  }),
});

// ============ ADMIN DASHBOARD ROUTER ============

const adminDashboardRouter = router({
  // Dashboard de Leads por Categoria
  getLeadsByCategory: adminProcedure.query(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return [];
    
    const { referrals, offers, categories } = await import("../drizzle/schema");
    const { eq, sql } = await import("drizzle-orm");
    
    const results = await dbInstance
      .select({
        categoryId: categories.id,
        categoryName: categories.name,
        totalLeads: sql<number>`count(${referrals.id})`,
        leadsWon: sql<number>`sum(case when ${referrals.status} = 'WON' then 1 else 0 end)`,
        leadsLost: sql<number>`sum(case when ${referrals.status} = 'LOST' then 1 else 0 end)`,
        leadsInProgress: sql<number>`sum(case when ${referrals.status} IN ('SENT', 'ACKED', 'IN_NEGOTIATION') then 1 else 0 end)`,
        totalValue: sql<number>`COALESCE(sum(${referrals.expectedValue}), 0)`,
        wonValue: sql<number>`COALESCE(sum(${referrals.wonValue}), 0)`,
      })
      .from(referrals)
      .leftJoin(offers, eq(referrals.offerId, offers.id))
      .leftJoin(categories, eq(offers.categoryId, categories.id))
      .groupBy(categories.id, categories.name)
      .orderBy(sql`count(${referrals.id}) DESC`);
    
    return results;
  }),
  
  // Dashboard de Aging de Indicações
  getAgingReport: adminProcedure.query(async () => {
    const dbInstance = await db.getDb();
    if (!dbInstance) return { buckets: [], total: 0 };
    
    const { referrals } = await import("../drizzle/schema");
    const { sql, inArray } = await import("drizzle-orm");
    
    // Buscar apenas indicações em andamento
    const activeStatuses = ['SENT', 'ACKED', 'IN_NEGOTIATION'] as const;
    
    const results = await dbInstance
      .select({
        id: referrals.id,
        status: referrals.status,
        createdAt: referrals.createdAt,
        daysOld: sql<number>`DATEDIFF(NOW(), ${referrals.createdAt})`,
      })
      .from(referrals)
      .where(inArray(referrals.status, activeStatuses));
    
    // Agrupar por buckets de idade
    const buckets = {
      "0-7 dias": 0,
      "8-15 dias": 0,
      "16-30 dias": 0,
      "30+ dias": 0,
    };
    
    for (const row of results) {
      const days = row.daysOld || 0;
      if (days <= 7) buckets["0-7 dias"]++;
      else if (days <= 15) buckets["8-15 dias"]++;
      else if (days <= 30) buckets["16-30 dias"]++;
      else buckets["30+ dias"]++;
    }
    
    return {
      buckets: Object.entries(buckets).map(([range, count]) => ({ range, count })),
      total: results.length,
    };
  }),
  
  // Ranking de Conversão de Parceiros
  getConversionRanking: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(20),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { referrals, partners } = await import("../drizzle/schema");
      const { eq, sql } = await import("drizzle-orm");
      
      const results = await dbInstance
        .select({
          partnerId: partners.id,
          partnerName: partners.companyName,
          totalLeads: sql<number>`count(${referrals.id})`,
          leadsWon: sql<number>`sum(case when ${referrals.status} = 'WON' then 1 else 0 end)`,
          leadsLost: sql<number>`sum(case when ${referrals.status} = 'LOST' then 1 else 0 end)`,
          conversionRate: sql<number>`ROUND((sum(case when ${referrals.status} = 'WON' then 1 else 0 end) / count(${referrals.id})) * 100, 2)`,
          totalCommission: sql<number>`COALESCE(sum(${referrals.successFeeRealized}), 0)`,
        })
        .from(partners)
        .leftJoin(referrals, eq(referrals.partnerId, partners.id))
        .groupBy(partners.id, partners.companyName)
        .having(sql`count(${referrals.id}) > 0`)
        .orderBy(sql`ROUND((sum(case when ${referrals.status} = 'WON' then 1 else 0 end) / count(${referrals.id})) * 100, 2) DESC`)
        .limit(input.limit);
      
      return results;
    }),
  
  // Logs de Auditoria
  getAuditLogs: adminProcedure
    .input(z.object({
      limit: z.number().optional().default(100),
      entityType: z.string().optional(),
      userId: z.number().optional(),
    }))
    .query(async ({ input }) => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      
      const { auditLogs, users } = await import("../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");
      
      // Construir filtros
      const filters = [];
      if (input.entityType) {
        filters.push(eq(auditLogs.entityType, input.entityType));
      }
      if (input.userId) {
        filters.push(eq(auditLogs.userId, input.userId));
      }
      
      const results = await dbInstance
        .select({
          id: auditLogs.id,
          userId: auditLogs.userId,
          userName: users.name,
          userEmail: users.email,
          action: auditLogs.action,
          entityType: auditLogs.entityType,
          entityId: auditLogs.entityId,
          oldValue: auditLogs.oldValue,
          newValue: auditLogs.newValue,
          ipAddress: auditLogs.ipAddress,
          createdAt: auditLogs.createdAt,
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(filters.length > 0 ? and(...filters) : undefined)
        .orderBy(desc(auditLogs.createdAt))
        .limit(input.limit);
      
      return results;
    }),
});

// ============ COUPON ROUTER ============

const couponRouter = router({
  list: adminProcedure
    .input(z.object({
      status: z.string().optional(),
      search: z.string().optional(),
    }).optional())
    .query(async ({ input }) => {
      return await db.getAllCoupons(input);
    }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCouponById(input.id);
    }),

  create: adminProcedure
    .input(z.object({
      code: z.string().min(3).max(50),
      description: z.string().optional(),
      discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
      discountValue: z.number().positive(),
      maxDiscountAmount: z.number().positive().optional(),
      minPurchaseAmount: z.number().positive().optional(),
      startDate: z.string(),
      endDate: z.string(),
      maxUsageTotal: z.number().int().positive().optional(),
      maxUsagePerUser: z.number().int().positive().default(1),
      applicableOfferIds: z.array(z.number()).optional(),
      applicableCategoryIds: z.array(z.number()).optional(),
      applicablePaymentMethods: z.array(z.string()).optional(),
      firstPurchaseOnly: z.boolean().default(false),
      excludedOfferIds: z.array(z.number()).optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    }))
    .mutation(async ({ input, ctx }) => {
      const coupon = await db.createCoupon({
        ...input,
        applicableOfferIds: input.applicableOfferIds ? JSON.stringify(input.applicableOfferIds) : null,
        applicableCategoryIds: input.applicableCategoryIds ? JSON.stringify(input.applicableCategoryIds) : null,
        applicablePaymentMethods: input.applicablePaymentMethods ? JSON.stringify(input.applicablePaymentMethods) : null,
        excludedOfferIds: input.excludedOfferIds ? JSON.stringify(input.excludedOfferIds) : null,
        firstPurchaseOnly: input.firstPurchaseOnly ? 1 : 0,
        createdBy: ctx.user.id,
      });

      if (!coupon) throw new Error("Failed to create coupon");

      await createAuditLog({
        userId: ctx.user.id,
        action: "CREATE_COUPON",
        entityType: "coupon",
        entityId: coupon.id,
        newValue: JSON.stringify(coupon),
      });

      return coupon;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      code: z.string().min(3).max(50).optional(),
      description: z.string().optional(),
      discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]).optional(),
      discountValue: z.number().positive().optional(),
      maxDiscountAmount: z.number().positive().optional(),
      minPurchaseAmount: z.number().positive().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      maxUsageTotal: z.number().int().positive().optional(),
      maxUsagePerUser: z.number().int().positive().optional(),
      applicableOfferIds: z.array(z.number()).optional(),
      applicableCategoryIds: z.array(z.number()).optional(),
      applicablePaymentMethods: z.array(z.string()).optional(),
      firstPurchaseOnly: z.boolean().optional(),
      excludedOfferIds: z.array(z.number()).optional(),
      status: z.enum(["ACTIVE", "INACTIVE", "EXPIRED"]).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const { id, ...updateData } = input;
      const oldCoupon = await db.getCouponById(id);

      const processedData: any = { ...updateData };
      if (updateData.applicableOfferIds) {
        processedData.applicableOfferIds = JSON.stringify(updateData.applicableOfferIds);
      }
      if (updateData.applicableCategoryIds) {
        processedData.applicableCategoryIds = JSON.stringify(updateData.applicableCategoryIds);
      }
      if (updateData.applicablePaymentMethods) {
        processedData.applicablePaymentMethods = JSON.stringify(updateData.applicablePaymentMethods);
      }
      if (updateData.excludedOfferIds) {
        processedData.excludedOfferIds = JSON.stringify(updateData.excludedOfferIds);
      }
      if (updateData.firstPurchaseOnly !== undefined) {
        processedData.firstPurchaseOnly = updateData.firstPurchaseOnly ? 1 : 0;
      }

      const updatedCoupon = await db.updateCoupon(id, processedData);

      await createAuditLog({
        userId: ctx.user.id,
        action: "UPDATE_COUPON",
        entityType: "coupon",
        entityId: id,
        oldValue: JSON.stringify(oldCoupon),
        newValue: JSON.stringify(updatedCoupon),
      });

      return updatedCoupon;
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const coupon = await db.getCouponById(input.id);
      await db.deleteCoupon(input.id);

      await createAuditLog({
        userId: ctx.user.id,
        action: "DELETE_COUPON",
        entityType: "coupon",
        entityId: input.id,
        oldValue: JSON.stringify(coupon),
      });

      return { success: true };
    }),

  validate: publicProcedure
    .input(z.object({
      code: z.string(),
      userId: z.number(),
      offerId: z.number().optional(),
      amount: z.number().positive(),
      paymentMethod: z.string().optional(),
    }))
    .query(async ({ input }) => {
      return await db.validateCoupon(input);
    }),

  getStats: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return await db.getCouponUsageStats(input.id);
    }),
});

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  localAuth: localAuthRouter,
  user: userRouter,
  category: categoryRouter,
  partner: partnerRouter,
  lead: leadRouter,
  contract: contractRouter,
  invitation: invitationRouter,
  offer: offerRouter,
  leadRequest: leadRequestRouter,
  referral: referralRouter,
  order: orderRouter,
  audit: auditRouter,
  bitrix: bitrixRouter,
  review: reviewRouter,
  favorite: favoriteRouter,
  notification: notificationRouter,
  partnerCase: partnerCaseRouter,
  badge: badgeRouter,
  search: searchRouter,
  analytics: analyticsRouter,
  buyer: buyerRouter,
  license: licenseRouter,
  commission: commissionRouter,
  adminDashboard: adminDashboardRouter,
  gerente: gerenteRouter,
  coupon: couponRouter,
});

export type AppRouter = typeof appRouter;
