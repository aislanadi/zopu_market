# Documentação Técnica - ZOPUMarket API

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Autor:** Manus AI

---

## Sumário Executivo

O ZOPUMarket é um marketplace B2B de soluções empresariais que conecta compradores corporativos a parceiros especializados através de um sistema de indicações e comissionamento. A plataforma oferece **94 procedures tRPC** organizados em **24 routers**, cobrindo autenticação, gestão de parceiros, ofertas, leads, comissionamento, analytics e muito mais.

Esta documentação técnica detalha todos os endpoints da API, fluxos de negócio, arquitetura do sistema e boas práticas de desenvolvimento. O sistema foi construído com React 19, tRPC 11, Express 4, Drizzle ORM e TiDB (MySQL compatível).

---

## Arquitetura do Sistema

### Stack Tecnológico

O ZOPUMarket utiliza uma arquitetura moderna full-stack com as seguintes tecnologias principais:

**Frontend:**
- React 19 com TypeScript
- Tailwind CSS 4 + shadcn/ui
- Wouter (roteamento)
- TanStack Query (via tRPC)
- Vite (build tool)

**Backend:**
- Node.js 22 + Express 4
- tRPC 11 (type-safe API)
- Drizzle ORM (database)
- Superjson (serialização)
- JWT (autenticação)

**Banco de Dados:**
- TiDB (MySQL compatível)
- 15 tabelas principais
- Relacionamentos complexos

**Integrações:**
- Manus OAuth (autenticação)
- Bitrix24 (CRM)
- S3 (armazenamento de arquivos)
- Manus LLM (IA)
- Manus Analytics (métricas)

### Princípios Arquiteturais

A arquitetura do ZOPUMarket segue os seguintes princípios fundamentais que garantem escalabilidade, manutenibilidade e segurança do sistema:

**Type-Safety End-to-End:** Através do tRPC, os tipos TypeScript fluem automaticamente do backend para o frontend, eliminando inconsistências de API e reduzindo bugs em tempo de execução. Qualquer mudança em um procedure é imediatamente refletida no cliente.

**Separation of Concerns:** A lógica de negócio reside em `server/db.ts` (query helpers), enquanto `server/routers.ts` contém apenas validação de entrada, autorização e orquestração. Isso facilita testes unitários e reutilização de código.

**Role-Based Access Control (RBAC):** Quatro middlewares customizados (`publicProcedure`, `protectedProcedure`, `adminProcedure`, `gerenteProcedure`, `parceiroProcedure`) garantem que cada endpoint seja acessível apenas pelos perfis autorizados.

**Audit Trail Completo:** Todas as operações críticas (criação, atualização, exclusão) geram registros na tabela `auditLogs`, permitindo rastreabilidade completa de ações no sistema e conformidade com LGPD.

**Optimistic Updates:** O frontend utiliza optimistic updates em operações de lista (favoritos, notificações) para proporcionar feedback instantâneo ao usuário, melhorando significativamente a percepção de performance.

---

## Visão Geral dos Routers

O sistema está organizado em 24 routers funcionais, cada um responsável por um domínio específico do negócio:

| Router | Procedures | Descrição | Autenticação |
|--------|-----------|-----------|--------------|
| **authRouter** | 2 | Autenticação e sessão | Público/Protegido |
| **categoryRouter** | 5 | Gestão de categorias de ofertas | Público + Admin |
| **partnerRouter** | 11 | CRUD e curadoria de parceiros | Público + Admin + Parceiro |
| **offerRouter** | 8 | Gestão de ofertas e aprovação | Público + Admin + Parceiro |
| **leadRequestRouter** | 1 | Submissão de propostas por compradores | Público |
| **referralRouter** | 4 | Gestão de indicações e SLA | Protegido + Admin |
| **orderRouter** | 3 | Pedidos e transações | Protegido |
| **bitrixRouter** | 2 | Integração com Bitrix24 CRM | Admin |
| **auditRouter** | 1 | Logs de auditoria | Admin |
| **reviewRouter** | 3 | Avaliações de parceiros | Protegido |
| **notificationRouter** | 4 | Sistema de notificações | Protegido |
| **favoriteRouter** | 4 | Favoritos de ofertas | Protegido |
| **invitationRouter** | 3 | Convites para parceiros | Admin |
| **contractRouter** | 5 | Contratos e elegibilidade | Admin + Parceiro |
| **leadRouter** | 1 | Criação de leads | Público |
| **partnerCaseRouter** | 7 | Casos de sucesso | Público + Admin + Parceiro |
| **badgeRouter** | 3 | Badges e destaques | Admin |
| **searchRouter** | 1 | Busca unificada | Público |
| **analyticsRouter** | 3 | Métricas e relatórios | Protegido + Admin |
| **buyerRouter** | 7 | Perfil e recomendações de compradores | Protegido |
| **licenseRouter** | 2 | Gestão de licenças | Admin |
| **commissionRouter** | 5 | Comissionamento e relatórios financeiros | Admin + Parceiro |
| **gerenteRouter** | 5 | Dashboard e ações de gerentes de contas | Gerente + Admin |
| **adminDashboardRouter** | 4 | Dashboards administrativos avançados | Admin |

**Total:** 94 procedures cobrindo todos os aspectos do marketplace B2B.

---

## Convenções de Nomenclatura

O projeto segue convenções consistentes para facilitar a compreensão e manutenção do código:

**Procedures:**
- **Queries** (leitura): `list`, `getById`, `getByStatus`, `check`, `search`
- **Mutations** (escrita): `create`, `update`, `delete`, `approve`, `reject`, `submit`
- **Prefixos especiais**: `admin*` (ações administrativas), `get*` (busca específica), `update*` (atualização parcial)

**Tipos de Retorno:**
- Listas: `Array<T>` com metadados opcionais (`total`, `page`, `pageSize`)
- Objetos únicos: `T | null` (null quando não encontrado)
- Operações de escrita: `{ success: boolean }` ou objeto criado com `id`
- Relatórios: `{ data: T[], summary: {...} }`

**Códigos de Erro tRPC:**
- `UNAUTHORIZED`: Usuário não autenticado
- `FORBIDDEN`: Usuário sem permissão para a ação
- `NOT_FOUND`: Recurso não encontrado
- `BAD_REQUEST`: Dados de entrada inválidos
- `INTERNAL_SERVER_ERROR`: Erro inesperado no servidor

---

## Middleware e Autorização

O sistema implementa quatro níveis de autorização através de middlewares customizados:

### publicProcedure

Acessível por qualquer usuário, autenticado ou não. Utilizado para endpoints públicos como listagem de ofertas, detalhes de parceiros e submissão de leads.

```typescript
// Exemplo de uso
const categoryRouter = router({
  list: publicProcedure.query(async () => {
    return await db.getAllCategories();
  }),
});
```

### protectedProcedure

Requer autenticação válida. O contexto `ctx.user` está sempre disponível e contém os dados do usuário logado. Utilizado para ações que requerem identificação do usuário.

```typescript
// Exemplo de uso
const favoriteRouter = router({
  add: protectedProcedure
    .input(z.object({ offerId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      // ctx.user está disponível e tipado
      return await db.addFavorite(ctx.user.id, input.offerId);
    }),
});
```

### adminProcedure

Restrito a usuários com `role === "admin"`. Utilizado para operações administrativas críticas como aprovação de parceiros, gestão de categorias e acesso a dashboards financeiros.

```typescript
// Implementação
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a administradores" 
    });
  }
  return next({ ctx });
});
```

### gerenteProcedure

Acessível por gerentes de contas (`role === "gerente_contas"`) e administradores. Utilizado para funcionalidades de gestão de carteira de clientes e indicações manuais.

```typescript
// Implementação
const gerenteProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin" && ctx.user.role !== "gerente_contas") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a gerentes de contas" 
    });
  }
  return next({ ctx });
});
```

### parceiroProcedure

Restrito a usuários parceiros (`role === "parceiro"`). Utilizado para ações específicas de parceiros como atualização de perfil e gestão de ofertas próprias.

---

## Próximas Seções

Esta documentação está organizada nas seguintes seções:

1. **Referência de API** - Documentação detalhada de todos os 94 procedures
2. **Fluxos de Negócio** - Diagramas e explicações dos processos principais
3. **Modelo de Dados** - Schema do banco e relacionamentos
4. **Guia de Desenvolvimento** - Boas práticas e padrões de código
5. **Integrações** - Documentação de APIs externas (Bitrix24, S3, LLM)

Continue lendo para explorar cada seção em detalhes.
