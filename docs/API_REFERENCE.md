# Referência Completa da API tRPC

**Versão:** 1.0  
**Data:** Dezembro 2025

---

## 1. authRouter

O `authRouter` gerencia autenticação e sessão de usuários através do Manus OAuth.

### 1.1 auth.me

**Tipo:** Query  
**Autenticação:** Público  
**Descrição:** Retorna os dados do usuário autenticado atual ou `null` se não autenticado.

**Parâmetros:** Nenhum

**Retorno:**
```typescript
{
  id: number;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "gerente_contas" | "parceiro" | "comprador";
  avatarUrl?: string;
} | null
```

**Exemplo de Uso:**
```typescript
const { data: user } = trpc.auth.me.useQuery();

if (user) {
  console.log(`Usuário logado: ${user.name}`);
} else {
  console.log("Usuário não autenticado");
}
```

---

### 1.2 auth.logout

**Tipo:** Mutation  
**Autenticação:** Público  
**Descrição:** Encerra a sessão do usuário atual, limpando o cookie de autenticação.

**Parâmetros:** Nenhum

**Retorno:**
```typescript
{ success: true }
```

**Exemplo de Uso:**
```typescript
const logoutMutation = trpc.auth.logout.useMutation({
  onSuccess: () => {
    window.location.href = "/";
  },
});

logoutMutation.mutate();
```

---

## 2. categoryRouter

Gerencia categorias de ofertas no marketplace.

### 2.1 category.list

**Tipo:** Query  
**Autenticação:** Público  
**Descrição:** Lista todas as categorias ativas no sistema.

**Parâmetros:** Nenhum

**Retorno:**
```typescript
Array<{
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
}>
```

---

### 2.2 category.getById

**Tipo:** Query  
**Autenticação:** Público  
**Descrição:** Busca uma categoria específica por ID.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:**
```typescript
{
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
} | null
```

---

### 2.3 category.create

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Cria uma nova categoria. Gera log de auditoria.

**Parâmetros:**
```typescript
{
  name: string;           // Mínimo 1 caractere
  description?: string;
  icon?: string;          // URL ou nome do ícone
}
```

**Retorno:**
```typescript
{
  id: number;
  name: string;
  description: string | null;
  icon: string | null;
  createdAt: Date;
}
```

**Exemplo de Uso:**
```typescript
const createCategory = trpc.category.create.useMutation({
  onSuccess: (data) => {
    toast.success(`Categoria "${data.name}" criada!`);
  },
});

createCategory.mutate({
  name: "Consultoria Financeira",
  description: "Serviços de planejamento e gestão financeira",
  icon: "DollarSign",
});
```

---

### 2.4 category.update

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Atualiza uma categoria existente. Gera log de auditoria com valores antigos e novos.

**Parâmetros:**
```typescript
{
  id: number;
  name?: string;
  description?: string;
  icon?: string;
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 2.5 category.delete

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Exclui uma categoria. Gera log de auditoria.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:**
```typescript
{ success: boolean }
```

**Observações:** Não é possível excluir categorias que possuem ofertas associadas.

---

## 3. partnerRouter

Gerencia parceiros, curadoria e perfis públicos.

### 3.1 partner.list

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Lista todos os parceiros com filtros opcionais.

**Parâmetros:**
```typescript
{
  status?: "PENDING" | "APPROVED" | "REJECTED";
  tier?: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
}
```

**Retorno:**
```typescript
Array<{
  id: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  curationStatus: "PENDING" | "APPROVED" | "REJECTED";
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  createdAt: Date;
  approvedAt: Date | null;
}>
```

---

### 3.2 partner.listByStatus

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Lista parceiros filtrados por status de curadoria.

**Parâmetros:**
```typescript
{ status: "PENDING" | "APPROVED" | "REJECTED" }
```

**Retorno:** Mesmo formato de `partner.list`

---

### 3.3 partner.getById

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Busca detalhes completos de um parceiro, incluindo configurações Bitrix24.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:**
```typescript
{
  id: number;
  userId: number;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  description: string | null;
  logo: string | null;
  curationStatus: "PENDING" | "APPROVED" | "REJECTED";
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  bitrix24Config: {
    webhookUrl?: string;
    userId?: string;
  } | null;
  createdAt: Date;
  approvedAt: Date | null;
  rejectedAt: Date | null;
}
```

---

### 3.4 partner.getPublicProfile

**Tipo:** Query  
**Autenticação:** Público  
**Descrição:** Busca perfil público de um parceiro (apenas parceiros aprovados).

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:** Mesmo formato de `partner.getById`, mas sem campos sensíveis como `bitrix24Config`.

---

### 3.5 partner.create

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Cria um novo parceiro no sistema.

**Parâmetros:**
```typescript
{
  userId: number;
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
}
```

**Retorno:**
```typescript
{
  id: number;
  companyName: string;
  // ... outros campos
}
```

---

### 3.6 partner.updateCurationStatus

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Aprova ou rejeita um parceiro pendente. Gera log de auditoria.

**Parâmetros:**
```typescript
{
  id: number;
  status: "APPROVED" | "REJECTED";
  rejectionReason?: string;  // Obrigatório se status = REJECTED
}
```

**Retorno:**
```typescript
{ success: boolean }
```

**Exemplo de Uso:**
```typescript
// Aprovar parceiro
updateStatus.mutate({
  id: 123,
  status: "APPROVED",
});

// Rejeitar parceiro
updateStatus.mutate({
  id: 456,
  status: "REJECTED",
  rejectionReason: "Documentação incompleta",
});
```

---

### 3.7 partner.updateBitrixConfig

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Atualiza configurações de integração Bitrix24 do parceiro.

**Parâmetros:**
```typescript
{
  partnerId: number;
  webhookUrl: string;
  userId: string;
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 3.8 partner.updatePaymentInfo

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Atualiza informações de pagamento do parceiro (dados bancários, PIX).

**Parâmetros:**
```typescript
{
  partnerId: number;
  bankName?: string;
  accountNumber?: string;
  pixKey?: string;
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 3.9 partner.updateProfile

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Atualiza perfil completo do parceiro (admin).

**Parâmetros:**
```typescript
{
  id: number;
  companyName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  logo?: string;
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 3.10 partner.updateSelfProfile

**Tipo:** Mutation  
**Autenticação:** Parceiro  
**Descrição:** Permite que o parceiro atualize seu próprio perfil.

**Parâmetros:** Mesmo formato de `partner.updateProfile`, mas sem `id` (usa `ctx.user.id`).

**Retorno:**
```typescript
{ success: boolean }
```

---

### 3.11 partner.updateTier

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Atualiza o tier (nível) do parceiro.

**Parâmetros:**
```typescript
{
  partnerId: number;
  tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

## 4. offerRouter

Gerencia ofertas de serviços/produtos no marketplace.

### 4.1 offer.list

**Tipo:** Query  
**Autenticação:** Público  
**Descrição:** Lista ofertas com filtros opcionais. Apenas ofertas aprovadas são retornadas para usuários não-admin.

**Parâmetros:**
```typescript
{
  categoryId?: number;
  partnerId?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED";
  search?: string;
}
```

**Retorno:**
```typescript
Array<{
  id: number;
  partnerId: number;
  categoryId: number;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  successFeePercent: number;
  zopuTakeRatePercent: number;
  partnerSharePercent: number;
  createdAt: Date;
  approvedAt: Date | null;
  partner: {
    companyName: string;
    logo: string | null;
  };
  category: {
    name: string;
    icon: string | null;
  };
}>
```

---

### 4.2 offer.getById

**Tipo:** Query  
**Autenticação:** Público  
**Descrição:** Busca detalhes completos de uma oferta específica.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:** Mesmo formato de `offer.list`, mas retorna um único objeto ou `null`.

---

### 4.3 offer.create

**Tipo:** Mutation  
**Autenticação:** Admin ou Parceiro  
**Descrição:** Cria uma nova oferta. Parceiros criam com status PENDING; admins podem criar já aprovadas.

**Parâmetros:**
```typescript
{
  partnerId: number;
  categoryId: number;
  title: string;
  description: string;
  price?: number;
  imageUrl?: string;
  successFeePercent: number;    // Taxa de comissão por indicação
  zopuTakeRatePercent: number;  // Taxa ZOPU em checkout
  partnerSharePercent: number;  // Percentual do parceiro
}
```

**Retorno:**
```typescript
{
  id: number;
  title: string;
  status: "PENDING" | "APPROVED";
  // ... outros campos
}
```

---

### 4.4 offer.update

**Tipo:** Mutation  
**Autenticação:** Admin ou Parceiro (própria oferta)  
**Descrição:** Atualiza uma oferta existente. Gera log de auditoria.

**Parâmetros:**
```typescript
{
  id: number;
  title?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  successFeePercent?: number;
  zopuTakeRatePercent?: number;
  partnerSharePercent?: number;
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 4.5 offer.delete

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Exclui uma oferta. Gera log de auditoria.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 4.6 offer.getPending

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Lista todas as ofertas pendentes de aprovação.

**Parâmetros:** Nenhum

**Retorno:** Array no formato de `offer.list`, filtrado por `status = PENDING`.

---

### 4.7 offer.approve

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Aprova uma oferta pendente. Gera log de auditoria e notificação ao parceiro.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 4.8 offer.reject

**Tipo:** Mutation  
**Autenticação:** Admin  
**Descrição:** Rejeita uma oferta pendente. Gera log de auditoria e notificação ao parceiro.

**Parâmetros:**
```typescript
{
  id: number;
  reason: string;  // Motivo da rejeição
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

## 5. referralRouter

Gerencia indicações (leads qualificados) e SLA.

### 5.1 referral.list

**Tipo:** Query  
**Autenticação:** Protegido  
**Descrição:** Lista indicações com base no perfil do usuário. Parceiros veem apenas suas indicações; admins veem todas.

**Parâmetros:**
```typescript
{
  status?: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "WON" | "LOST";
  partnerId?: number;
  gerenteId?: number;
}
```

**Retorno:**
```typescript
Array<{
  id: number;
  offerId: number;
  partnerId: number;
  gerenteId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  companyName: string;
  message: string | null;
  status: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "WON" | "LOST";
  slaDeadline: Date;
  internalNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  offer: {
    title: string;
    successFeePercent: number;
  };
  partner: {
    companyName: string;
  };
}>
```

---

### 5.2 referral.getById

**Tipo:** Query  
**Autenticação:** Protegido  
**Descrição:** Busca detalhes completos de uma indicação específica.

**Parâmetros:**
```typescript
{ id: number }
```

**Retorno:** Mesmo formato de `referral.list`, mas retorna um único objeto.

---

### 5.3 referral.updateStatus

**Tipo:** Mutation  
**Autenticação:** Admin ou Parceiro (própria indicação)  
**Descrição:** Atualiza o status de uma indicação. Gera log de auditoria.

**Parâmetros:**
```typescript
{
  id: number;
  status: "ACCEPTED" | "IN_PROGRESS" | "WON" | "LOST";
  lostReason?: string;  // Obrigatório se status = LOST
}
```

**Retorno:**
```typescript
{ success: boolean }
```

**Regras de Negócio:**
- Apenas indicações PENDING podem ser ACCEPTED
- Apenas indicações ACCEPTED podem ir para IN_PROGRESS
- Apenas indicações IN_PROGRESS podem ir para WON ou LOST
- Transição para WON gera comissão automaticamente

---

### 5.4 referral.checkOverdueSLAs

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Retorna indicações com SLA vencido ou próximo do vencimento (24h).

**Parâmetros:** Nenhum

**Retorno:**
```typescript
{
  overdue: Array<ReferralWithDetails>;      // SLA já vencido
  expiringSoon: Array<ReferralWithDetails>; // Vence em 24h
}
```

**Uso Recomendado:** Executar diariamente via cron job para enviar alertas.

---

## 6. commissionRouter

Gerencia comissionamento e relatórios financeiros.

### 6.1 commission.getSummary

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Retorna resumo financeiro geral do sistema.

**Parâmetros:**
```typescript
{
  startDate?: string;  // ISO 8601
  endDate?: string;
}
```

**Retorno:**
```typescript
{
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  totalRevenue: number;
  zopuRevenue: number;
  partnerRevenue: number;
  conversionRate: number;
}
```

---

### 6.2 commission.getByPartner

**Tipo:** Query  
**Autenticação:** Admin ou Parceiro (próprias comissões)  
**Descrição:** Lista comissões de um parceiro específico.

**Parâmetros:**
```typescript
{
  partnerId: number;
  startDate?: string;
  endDate?: string;
}
```

**Retorno:**
```typescript
Array<{
  id: number;
  referralId: number;
  partnerId: number;
  amount: number;
  status: "PENDING" | "PAID";
  paidAt: Date | null;
  createdAt: Date;
  referral: {
    customerName: string;
    companyName: string;
    offer: {
      title: string;
    };
  };
}>
```

---

### 6.3 commission.getByCategory

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Agrupa comissões por categoria de oferta.

**Parâmetros:**
```typescript
{
  startDate?: string;
  endDate?: string;
}
```

**Retorno:**
```typescript
Array<{
  categoryId: number;
  categoryName: string;
  totalCommissions: number;
  count: number;
}>
```

---

### 6.4 commission.getMonthlyEvolution

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Retorna evolução mensal de comissões para gráficos.

**Parâmetros:**
```typescript
{
  months: number;  // Número de meses retroativos
}
```

**Retorno:**
```typescript
Array<{
  month: string;        // "2025-12"
  totalCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  count: number;
}>
```

---

### 6.5 commission.exportCSV

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Exporta relatório de comissões em formato CSV.

**Parâmetros:**
```typescript
{
  partnerId?: number;
  startDate?: string;
  endDate?: string;
}
```

**Retorno:**
```typescript
{
  csv: string;  // Conteúdo CSV pronto para download
  filename: string;
}
```

---

## 7. gerenteRouter

Funcionalidades exclusivas para gerentes de contas.

### 7.1 gerente.getMyReferrals

**Tipo:** Query  
**Autenticação:** Gerente ou Admin  
**Descrição:** Lista indicações da carteira do gerente logado.

**Parâmetros:**
```typescript
{
  status?: "PENDING" | "ACCEPTED" | "IN_PROGRESS" | "WON" | "LOST";
}
```

**Retorno:** Mesmo formato de `referral.list`.

---

### 7.2 gerente.getFollowUpAlerts

**Tipo:** Query  
**Autenticação:** Gerente ou Admin  
**Descrição:** Retorna indicações que precisam de follow-up (sem atualização há mais de 7 dias).

**Parâmetros:** Nenhum

**Retorno:**
```typescript
Array<{
  id: number;
  customerName: string;
  companyName: string;
  status: string;
  daysSinceUpdate: number;
  slaDeadline: Date;
  offer: {
    title: string;
  };
}>
```

---

### 7.3 gerente.createManualReferral

**Tipo:** Mutation  
**Autenticação:** Gerente ou Admin  
**Descrição:** Cria uma indicação manual (tipo ASSISTED_REFERRAL).

**Parâmetros:**
```typescript
{
  offerId: number;
  partnerId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  companyName: string;
  message?: string;
}
```

**Retorno:**
```typescript
{
  id: number;
  status: "PENDING";
  // ... outros campos
}
```

---

### 7.4 gerente.updateInternalNotes

**Tipo:** Mutation  
**Autenticação:** Gerente ou Admin  
**Descrição:** Atualiza observações internas de uma indicação.

**Parâmetros:**
```typescript
{
  referralId: number;
  notes: string;
}
```

**Retorno:**
```typescript
{ success: boolean }
```

---

### 7.5 gerente.getDashboardStats

**Tipo:** Query  
**Autenticação:** Gerente ou Admin  
**Descrição:** Retorna métricas do dashboard do gerente.

**Parâmetros:** Nenhum

**Retorno:**
```typescript
{
  totalReferrals: number;
  activeReferrals: number;
  wonReferrals: number;
  conversionRate: number;
  totalCommissions: number;
  avgResponseTime: number;  // Em horas
}
```

---

## 8. adminDashboardRouter

Dashboards administrativos avançados.

### 8.1 adminDashboard.getLeadsByCategory

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Agrupa leads por categoria para análise.

**Parâmetros:**
```typescript
{
  startDate?: string;
  endDate?: string;
}
```

**Retorno:**
```typescript
Array<{
  categoryId: number;
  categoryName: string;
  totalLeads: number;
  convertedLeads: number;
  conversionRate: number;
}>
```

---

### 8.2 adminDashboard.getAgingReport

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Relatório de aging de indicações (0-7 dias, 8-15 dias, 16-30 dias, 30+ dias).

**Parâmetros:** Nenhum

**Retorno:**
```typescript
{
  "0-7": number;
  "8-15": number;
  "16-30": number;
  "30+": number;
}
```

---

### 8.3 adminDashboard.getConversionRanking

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Ranking dos top 20 parceiros por taxa de conversão.

**Parâmetros:** Nenhum

**Retorno:**
```typescript
Array<{
  partnerId: number;
  companyName: string;
  totalReferrals: number;
  wonReferrals: number;
  conversionRate: number;
  totalCommissions: number;
}>
```

---

### 8.4 adminDashboard.getAuditLogs

**Tipo:** Query  
**Autenticação:** Admin  
**Descrição:** Lista logs de auditoria com filtros.

**Parâmetros:**
```typescript
{
  userId?: number;
  action?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}
```

**Retorno:**
```typescript
Array<{
  id: number;
  userId: number;
  action: string;
  entityType: string;
  entityId: number | null;
  oldValue: string | null;
  newValue: string | null;
  createdAt: Date;
  user: {
    name: string;
    email: string;
  };
}>
```

---

## Observações Finais

Esta documentação cobre os 94 procedures principais do sistema. Para detalhes de implementação específicos, consulte o código-fonte em `server/routers.ts` e `server/db.ts`.

**Convenções Importantes:**
- Todos os timestamps são retornados como objetos `Date` (Superjson)
- Valores monetários são em centavos (number)
- Percentuais são decimais (0.15 = 15%)
- IDs são sempre `number`
- Strings vazias são convertidas para `null` no banco

**Tratamento de Erros:**
- `UNAUTHORIZED`: Redirecionar para login
- `FORBIDDEN`: Mostrar mensagem de permissão negada
- `NOT_FOUND`: Mostrar 404 ou mensagem amigável
- `BAD_REQUEST`: Validar formulário e mostrar erros específicos
