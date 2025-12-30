# Guia de Desenvolvimento - ZOPUMarket

**Versão:** 1.0  
**Data:** Dezembro 2025  
**Autor:** Manus AI

---

## Introdução

Este guia fornece diretrizes e boas práticas para desenvolvedores que trabalham no ZOPUMarket. O objetivo é manter consistência, qualidade e manutenibilidade do código à medida que o projeto evolui.

---

## Configuração do Ambiente de Desenvolvimento

### Pré-requisitos

Antes de iniciar o desenvolvimento, certifique-se de ter as seguintes ferramentas instaladas:

- Node.js 22.x ou superior
- pnpm 8.x ou superior
- Git 2.x ou superior
- Editor de código (recomendado: VS Code)

### Clonagem e Instalação

```bash
# Clonar o repositório
git clone <repository-url>
cd zopu_market

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
# As variáveis são injetadas automaticamente pela plataforma Manus
# Não é necessário criar arquivo .env manualmente

# Aplicar migrações do banco
pnpm db:push

# Iniciar servidor de desenvolvimento
pnpm dev
```

O servidor estará disponível em `http://localhost:3000`.

### Extensões Recomendadas (VS Code)

Para uma melhor experiência de desenvolvimento, instale as seguintes extensões:

- **ESLint**: Linting automático de código
- **Prettier**: Formatação automática
- **TypeScript Vue Plugin (Volar)**: Suporte TypeScript aprimorado
- **Tailwind CSS IntelliSense**: Autocomplete para classes Tailwind
- **Error Lens**: Visualização inline de erros

---

## Estrutura do Projeto

O projeto segue uma estrutura organizada que separa claramente responsabilidades:

### Diretórios Principais

**`client/`** contém todo o código frontend React, incluindo páginas, componentes, hooks e estilos. A pasta `client/public/` armazena assets estáticos servidos diretamente.

**`server/`** contém a lógica backend, incluindo routers tRPC, query helpers e integrações. A pasta `server/_core/` contém infraestrutura do framework que não deve ser modificada sem necessidade.

**`drizzle/`** define o schema do banco de dados e armazena migrações. Modificações no schema devem sempre ser seguidas de `pnpm db:push`.

**`shared/`** contém constantes e tipos compartilhados entre frontend e backend, garantindo consistência.

**`docs/`** armazena toda a documentação técnica do projeto, incluindo este guia.

### Arquivos Importantes

**`package.json`** define dependências e scripts do projeto. Nunca instale dependências diretamente com npm; use sempre pnpm.

**`tsconfig.json`** configura o compilador TypeScript. Modificações devem ser discutidas com a equipe.

**`tailwind.config.js`** configura o Tailwind CSS, incluindo tema, cores e plugins.

**`vite.config.ts`** configura o Vite (build tool). Modificações podem afetar performance.

---

## Convenções de Código

### TypeScript

O projeto utiliza TypeScript em modo estrito. Todos os arquivos devem ter extensão `.ts` ou `.tsx` e seguir as seguintes convenções:

**Tipos e Interfaces:** Prefira `type` para aliases simples e `interface` para objetos que podem ser extendidos. Use PascalCase para nomes de tipos.

```typescript
// ✅ Bom
type UserId = number;
interface User {
  id: UserId;
  name: string;
  email: string;
}

// ❌ Evite
type user = { id: number; name: string; };
```

**Evite `any`:** Sempre que possível, defina tipos explícitos. Use `unknown` quando o tipo é realmente desconhecido e adicione type guards.

```typescript
// ✅ Bom
function processData(data: unknown) {
  if (typeof data === "string") {
    return data.toUpperCase();
  }
  throw new Error("Invalid data type");
}

// ❌ Evite
function processData(data: any) {
  return data.toUpperCase();
}
```

**Imports:** Use imports absolutos configurados em `tsconfig.json` para melhor legibilidade.

```typescript
// ✅ Bom
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

// ❌ Evite
import { Button } from "../../../components/ui/button";
```

### React

Todos os componentes devem ser funcionais com hooks. Evite class components.

**Nomenclatura:** Use PascalCase para componentes e camelCase para funções e variáveis.

```typescript
// ✅ Bom
export function OfferCard({ offer }: { offer: Offer }) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return <Card>...</Card>;
}

// ❌ Evite
export function offer_card(props) {
  // ...
}
```

**Props:** Sempre defina tipos explícitos para props. Prefira interfaces inline para componentes simples.

```typescript
// ✅ Bom
interface OfferCardProps {
  offer: Offer;
  onSelect?: (id: number) => void;
}

export function OfferCard({ offer, onSelect }: OfferCardProps) {
  // ...
}
```

**Hooks:** Extraia lógica complexa em custom hooks reutilizáveis.

```typescript
// ✅ Bom
function useOfferFilters() {
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  
  const { data: offers } = trpc.offer.list.useQuery({
    categoryId,
    search,
  });
  
  return { offers, categoryId, setCategoryId, search, setSearch };
}
```

### Tailwind CSS

O projeto utiliza Tailwind CSS 4 para estilização. Siga estas convenções:

**Ordem de Classes:** Agrupe classes por categoria (layout, spacing, typography, colors, effects).

```tsx
// ✅ Bom
<div className="flex items-center gap-4 p-4 text-lg font-semibold text-gray-900 bg-white rounded-lg shadow-md">

// ❌ Evite
<div className="text-gray-900 flex shadow-md p-4 bg-white rounded-lg gap-4 items-center font-semibold text-lg">
```

**Componentes Reutilizáveis:** Use shadcn/ui components sempre que possível. Evite criar componentes customizados para funcionalidades já disponíveis.

```tsx
// ✅ Bom
import { Button } from "@/components/ui/button";
<Button variant="outline" size="lg">Clique aqui</Button>

// ❌ Evite
<button className="px-4 py-2 border border-gray-300 rounded-md">Clique aqui</button>
```

**Responsividade:** Sempre implemente design mobile-first com breakpoints progressivos.

```tsx
// ✅ Bom
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

// ❌ Evite (desktop-first)
<div className="grid grid-cols-3 md:grid-cols-2 sm:grid-cols-1 gap-4">
```

---

## Desenvolvimento Backend

### Criando um Novo Procedure

Para adicionar um novo endpoint à API, siga este processo:

**1. Defina o Query Helper em `server/db.ts`:**

```typescript
export async function getOffersByPartner(partnerId: number) {
  const db = getDb();
  return await db
    .select()
    .from(offers)
    .where(eq(offers.partnerId, partnerId));
}
```

**2. Adicione o Procedure em `server/routers.ts`:**

```typescript
const offerRouter = router({
  // ... procedures existentes
  
  getByPartner: publicProcedure
    .input(z.object({ partnerId: z.number() }))
    .query(async ({ input }) => {
      return await db.getOffersByPartner(input.partnerId);
    }),
});
```

**3. Use no Frontend:**

```typescript
const { data: offers } = trpc.offer.getByPartner.useQuery({
  partnerId: 42,
});
```

### Validação de Entrada

Sempre valide inputs com Zod. Isso garante type-safety e previne erros.

```typescript
// ✅ Bom - Validação completa
.input(z.object({
  email: z.string().email("Email inválido"),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Telefone inválido"),
  cnpj: z.string().length(14, "CNPJ deve ter 14 dígitos"),
  message: z.string().min(10, "Mensagem muito curta").max(500, "Mensagem muito longa"),
}))

// ❌ Evite - Validação fraca
.input(z.object({
  email: z.string(),
  phone: z.string().optional(),
  cnpj: z.string(),
  message: z.string(),
}))
```

### Tratamento de Erros

Use os códigos de erro tRPC apropriados para cada situação:

```typescript
import { TRPCError } from "@trpc/server";

// Recurso não encontrado
if (!offer) {
  throw new TRPCError({
    code: "NOT_FOUND",
    message: "Oferta não encontrada",
  });
}

// Permissão negada
if (ctx.user.role !== "admin") {
  throw new TRPCError({
    code: "FORBIDDEN",
    message: "Apenas administradores podem executar esta ação",
  });
}

// Dados inválidos
if (amount <= 0) {
  throw new TRPCError({
    code: "BAD_REQUEST",
    message: "Valor deve ser maior que zero",
  });
}
```

### Auditoria

Sempre crie logs de auditoria para operações críticas:

```typescript
import { createAuditLog } from "./db";

// Após criar/atualizar/deletar
await createAuditLog({
  userId: ctx.user.id,
  action: "UPDATE_OFFER",
  entityType: "offer",
  entityId: offerId,
  oldValue: JSON.stringify(oldOffer),
  newValue: JSON.stringify(newOffer),
});
```

---

## Desenvolvimento Frontend

### Criando uma Nova Página

Para adicionar uma nova página ao sistema:

**1. Crie o Componente em `client/src/pages/`:**

```typescript
// client/src/pages/MyNewPage.tsx
export function MyNewPage() {
  const { data, isLoading } = trpc.myRouter.myProcedure.useQuery();
  
  if (isLoading) return <div>Carregando...</div>;
  
  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold">Minha Nova Página</h1>
      {/* Conteúdo */}
    </div>
  );
}
```

**2. Adicione a Rota em `client/src/App.tsx`:**

```typescript
import { MyNewPage } from "./pages/MyNewPage";

// Dentro do Router
<Route path="/my-new-page" component={MyNewPage} />
```

**3. Adicione Link no Menu (se necessário):**

```typescript
// Em AdminLayout.tsx ou PublicHeader.tsx
<Link href="/my-new-page">Minha Nova Página</Link>
```

### Gerenciamento de Estado

Use tRPC + TanStack Query para estado do servidor e useState/useReducer para estado local.

**Estado do Servidor (dados da API):**

```typescript
// ✅ Bom - Usa tRPC
const { data: offers, isLoading } = trpc.offer.list.useQuery({
  categoryId: selectedCategory,
});

// ❌ Evite - Gerenciamento manual
const [offers, setOffers] = useState([]);
useEffect(() => {
  fetch("/api/offers").then(res => res.json()).then(setOffers);
}, []);
```

**Estado Local (UI):**

```typescript
// ✅ Bom - Estado local simples
const [isOpen, setIsOpen] = useState(false);
const [selectedId, setSelectedId] = useState<number | null>(null);

// Para estado complexo, use useReducer
const [state, dispatch] = useReducer(filterReducer, initialState);
```

### Optimistic Updates

Para melhor UX, use optimistic updates em operações de lista:

```typescript
const addFavorite = trpc.favorite.add.useMutation({
  onMutate: async (newFavorite) => {
    await utils.favorite.list.cancel();
    const previousFavorites = utils.favorite.list.getData();
    
    utils.favorite.list.setData(undefined, (old) => [
      ...(old || []),
      newFavorite,
    ]);
    
    return { previousFavorites };
  },
  onError: (err, newFavorite, context) => {
    utils.favorite.list.setData(undefined, context?.previousFavorites);
    toast.error("Erro ao adicionar favorito");
  },
  onSuccess: () => {
    toast.success("Favorito adicionado!");
  },
});
```

### Tratamento de Loading e Erros

Sempre trate estados de loading e erro de forma amigável:

```typescript
const { data, isLoading, error } = trpc.offer.getById.useQuery({ id: offerId });

if (isLoading) {
  return <Skeleton className="h-64 w-full" />;
}

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Erro ao carregar oferta</AlertTitle>
      <AlertDescription>{error.message}</AlertDescription>
    </Alert>
  );
}

if (!data) {
  return <div>Oferta não encontrada</div>;
}

return <OfferDetails offer={data} />;
```

---

## Banco de Dados

### Modificando o Schema

Para adicionar ou modificar tabelas:

**1. Edite `drizzle/schema.ts`:**

```typescript
export const myNewTable = sqliteTable("my_new_table", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});
```

**2. Aplique a Migração:**

```bash
pnpm db:push
```

Este comando gera e aplica automaticamente as migrações necessárias.

**3. Atualize Query Helpers em `server/db.ts`:**

```typescript
export async function getAllFromMyNewTable() {
  const db = getDb();
  return await db.select().from(myNewTable);
}
```

### Boas Práticas de Query

**Use Índices:** Para queries frequentes, adicione índices no schema.

```typescript
export const offers = sqliteTable("offers", {
  // ... colunas
}, (table) => ({
  categoryStatusIdx: index("idx_offers_category_status")
    .on(table.categoryId, table.status),
}));
```

**Evite N+1 Queries:** Use joins quando precisar de dados relacionados.

```typescript
// ✅ Bom - Uma query com join
const offersWithPartners = await db
  .select()
  .from(offers)
  .leftJoin(partners, eq(offers.partnerId, partners.id));

// ❌ Evite - N+1 queries
const offers = await db.select().from(offers);
for (const offer of offers) {
  const partner = await db.select().from(partners).where(eq(partners.id, offer.partnerId));
}
```

**Use Transações:** Para operações que modificam múltiplas tabelas.

```typescript
await db.transaction(async (tx) => {
  await tx.insert(referrals).values(newReferral);
  await tx.insert(notifications).values(newNotification);
  await tx.insert(auditLogs).values(newLog);
});
```

---

## Testes

### Estrutura de Testes

O projeto utiliza Vitest para testes unitários e de integração. Todos os testes devem estar em arquivos `*.test.ts` no diretório `server/`.

### Escrevendo Testes

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { createContext } from "./_core/context";

describe("offer.list", () => {
  it("deve retornar apenas ofertas aprovadas para usuários não-admin", async () => {
    const ctx = await createContext({
      req: mockRequest(),
      res: mockResponse(),
    });
    
    const caller = appRouter.createCaller(ctx);
    const offers = await caller.offer.list({});
    
    expect(offers.every(o => o.status === "APPROVED")).toBe(true);
  });
  
  it("deve retornar todas as ofertas para admin", async () => {
    const ctx = await createContext({
      req: mockRequestWithAdmin(),
      res: mockResponse(),
    });
    
    const caller = appRouter.createCaller(ctx);
    const offers = await caller.offer.list({});
    
    expect(offers.some(o => o.status === "PENDING")).toBe(true);
  });
});
```

### Executando Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes específicos
pnpm test server/routers.test.ts

# Executar com coverage
pnpm test --coverage

# Modo watch (re-executa ao salvar)
pnpm test --watch
```

### Cobertura de Testes

Mantenha cobertura mínima de:

- **Procedures críticos:** 100% (auth, pagamentos, comissões)
- **Procedures de negócio:** 80% (ofertas, indicações, parceiros)
- **Procedures auxiliares:** 60% (notificações, favoritos)

---

## Git e Controle de Versão

### Convenções de Commit

Use Conventional Commits para mensagens consistentes:

```bash
# Features
git commit -m "feat: adiciona filtro por categoria no catálogo"

# Bug fixes
git commit -m "fix: corrige cálculo de comissão para ofertas com desconto"

# Documentação
git commit -m "docs: atualiza guia de desenvolvimento com seção de testes"

# Refatoração
git commit -m "refactor: extrai lógica de validação de CNPJ para helper"

# Testes
git commit -m "test: adiciona testes para procedure offer.create"

# Chore (manutenção)
git commit -m "chore: atualiza dependências do projeto"
```

### Workflow de Branches

O projeto segue o modelo de feature branches:

**1. Crie uma branch para sua feature:**

```bash
git checkout -b feature/nome-da-feature
```

**2. Desenvolva e commite incrementalmente:**

```bash
git add .
git commit -m "feat: implementa parte X da feature"
```

**3. Mantenha sua branch atualizada:**

```bash
git checkout main
git pull
git checkout feature/nome-da-feature
git rebase main
```

**4. Abra um Pull Request:**

Após finalizar, abra um PR para revisão da equipe.

### Code Review

Todos os PRs devem passar por code review antes de merge. Checklist:

- Código segue convenções do projeto
- Testes estão passando
- Cobertura de testes adequada
- Documentação atualizada (se necessário)
- Sem warnings do TypeScript
- Performance não foi degradada

---

## Performance

### Frontend

**Lazy Loading:** Carregue componentes pesados sob demanda.

```typescript
import { lazy, Suspense } from "react";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

function MyPage() {
  return (
    <Suspense fallback={<Skeleton />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

**Memoização:** Use `useMemo` e `useCallback` para evitar re-renders desnecessários.

```typescript
const filteredOffers = useMemo(() => {
  return offers?.filter(o => o.categoryId === selectedCategory);
}, [offers, selectedCategory]);

const handleSelect = useCallback((id: number) => {
  setSelectedId(id);
}, []);
```

**Virtualização:** Para listas longas, use virtualização.

```typescript
import { useVirtualizer } from "@tanstack/react-virtual";

function LongList({ items }) {
  const parentRef = useRef<HTMLDivElement>(null);
  
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });
  
  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      {virtualizer.getVirtualItems().map(virtualItem => (
        <div key={virtualItem.key} style={{ height: virtualItem.size }}>
          {items[virtualItem.index]}
        </div>
      ))}
    </div>
  );
}
```

### Backend

**Evite Queries Desnecessárias:** Use `select` específico ao invés de `select()`.

```typescript
// ✅ Bom - Seleciona apenas campos necessários
const partners = await db
  .select({ id: partners.id, name: partners.companyName })
  .from(partners);

// ❌ Evite - Seleciona todos os campos
const partners = await db.select().from(partners);
```

**Cache de Queries Pesadas:** Para queries complexas que não mudam frequentemente, implemente cache.

```typescript
let cachedStats: Stats | null = null;
let cacheTime: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function getStats() {
  if (cachedStats && Date.now() - cacheTime < CACHE_TTL) {
    return cachedStats;
  }
  
  cachedStats = await computeExpensiveStats();
  cacheTime = Date.now();
  return cachedStats;
}
```

---

## Segurança

### Validação de Entrada

Nunca confie em dados do cliente. Sempre valide no backend.

```typescript
// ✅ Bom - Validação rigorosa
.input(z.object({
  amount: z.number().positive().max(1000000),
  email: z.string().email(),
  role: z.enum(["admin", "gerente_contas", "parceiro", "comprador"]),
}))

// ❌ Evite - Validação fraca
.input(z.object({
  amount: z.number(),
  email: z.string(),
  role: z.string(),
}))
```

### Autorização

Sempre verifique permissões antes de executar ações sensíveis.

```typescript
// ✅ Bom - Verifica ownership
const offer = await db.getOfferById(input.id);
if (offer.partnerId !== ctx.user.id && ctx.user.role !== "admin") {
  throw new TRPCError({ code: "FORBIDDEN" });
}

// ❌ Evite - Assume permissão
await db.updateOffer(input.id, input.data);
```

### Sanitização de Dados

Sanitize dados antes de exibir no frontend para prevenir XSS.

```typescript
import DOMPurify from "dompurify";

// ✅ Bom - Sanitiza HTML
const cleanHTML = DOMPurify.sanitize(userInput);

// ❌ Evite - Renderiza HTML não sanitizado
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

---

## Debugging

### Frontend

Use React DevTools para inspecionar componentes e estado:

```bash
# Instale a extensão React DevTools no navegador
```

Para debug de queries tRPC, habilite devtools:

```typescript
// client/src/lib/trpc.ts
export const trpc = createTRPCReact<AppRouter>({
  unstable_overrides: {
    useMutation: {
      async onSuccess(opts) {
        console.log("Mutation success:", opts);
      },
    },
  },
});
```

### Backend

Use `console.log` estratégico ou debugger do VS Code:

```json
// .vscode/launch.json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Server",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["dev"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## Conclusão

Este guia cobre os aspectos fundamentais do desenvolvimento no ZOPUMarket. À medida que o projeto evolui, este documento deve ser atualizado para refletir novas práticas e padrões adotados pela equipe.

**Princípios Fundamentais:**

**Consistência:** Siga as convenções estabelecidas para facilitar manutenção e onboarding.

**Type-Safety:** Aproveite o TypeScript e tRPC para detectar erros em tempo de compilação.

**Testabilidade:** Escreva código testável e mantenha cobertura adequada.

**Performance:** Otimize desde o início, mas não prematuramente.

**Segurança:** Sempre valide, autorize e sanitize dados.

**Documentação:** Documente decisões importantes e código complexo.

Para dúvidas ou sugestões de melhorias neste guia, abra uma issue ou PR no repositório.
