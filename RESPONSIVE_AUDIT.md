# Auditoria de Responsividade - ZOPUMarket

## Breakpoints Tailwind CSS
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

## Resoluções de Teste
- 📱 Mobile Small: 320px (iPhone SE)
- 📱 Mobile: 375px (iPhone 12/13)
- 📱 Mobile Large: 414px (iPhone 12 Pro Max)
- 📱 Tablet: 768px (iPad)
- 💻 Desktop Small: 1024px
- 💻 Desktop: 1440px
- 💻 Desktop Large: 1920px

---

## Páginas Públicas

### ✅ Home.tsx
**Problemas identificados:**
- ❌ Header: Menu de navegação oculto em mobile (`hidden md:flex`) - falta menu hamburger
- ❌ Hero: Imagem pode quebrar layout em telas muito pequenas
- ⚠️ Cards de features: Grid pode ficar apertado em mobile
- ⚠️ Seção de depoimentos: Pode precisar scroll horizontal em mobile
- ⚠️ Footer: Links podem ficar apertados em mobile

**Correções necessárias:**
1. Adicionar menu hamburger responsivo
2. Ajustar espaçamentos do hero para mobile
3. Garantir grid de 1 coluna em mobile para cards
4. Implementar carousel ou scroll para depoimentos
5. Empilhar links do footer em mobile

### ❓ Catalog.tsx
**A auditar:**
- Sidebar de filtros
- Grid de ofertas
- Paginação
- Cabeçalho com busca

### ❓ OfferDetail.tsx
**A auditar:**
- Layout de 2 colunas (info + sidebar)
- Modal de proposta
- Tabs de informações
- Botões de ação

### ❓ About.tsx, Contact.tsx, Terms.tsx, Privacy.tsx
**A auditar:**
- Layout geral
- Formulários (Contact)
- Texto e espaçamentos

---

## Painéis Admin

### ❓ AdminLayout.tsx
**A auditar:**
- Sidebar de navegação
- Header com usuário
- Conteúdo principal
- Comportamento em mobile

### ❓ Páginas Admin
**A auditar:**
- AdminDashboard.tsx - Cards de métricas, tabelas
- AdminAnalytics.tsx - Gráficos, cards
- AdminConversionRanking.tsx - Tabela de ranking
- AdminFeesConfig.tsx - Tabela de ofertas com edição
- AdminAuditLogs.tsx - Tabela de logs
- AdminFinancialDashboard.tsx - Gráficos financeiros
- PartnerCommissions.tsx - Tabela de comissões
- Categories.tsx - CRUD de categorias
- Offers.tsx - Lista e modal de criação
- Partners.tsx - Lista de parceiros
- PendingOffers.tsx - Lista de ofertas pendentes
- Referrals.tsx - Lista de indicações

---

## Painel Gerente

### ❓ Páginas Gerente
**A auditar:**
- Dashboard.tsx - Cards de métricas, tabela de indicações
- FollowUpAlerts.tsx - Cards de alertas
- CreateReferral.tsx - Formulário multi-step
- ReferralDetail.tsx - Layout de 2 colunas

---

## Painel Parceiro

### ❓ Páginas Parceiro
**A auditar:**
- Dashboard.tsx - Gráficos, tabelas, cards
- EditProfile.tsx - Formulário de edição

---

## Componentes Globais

### ❓ DashboardLayout.tsx
**A auditar:**
- Sidebar responsiva
- Header mobile
- Menu colapsável

### ❓ NotificationBell.tsx
**A auditar:**
- Dropdown de notificações em mobile

---

## Problemas Comuns a Corrigir

### Tabelas
- ❌ Tabelas largas quebram em mobile
- **Solução:** Implementar scroll horizontal ou transformar em cards

### Formulários
- ❌ Campos lado a lado podem ficar apertados
- **Solução:** Empilhar campos em mobile (`flex-col` em `sm:`)

### Modais/Dialogs
- ❌ Modais podem ficar muito largos ou muito pequenos
- **Solução:** Ajustar `max-w-*` e padding para mobile

### Gráficos
- ❌ Gráficos podem não caber na tela
- **Solução:** Ajustar altura e responsividade do ResponsiveContainer

### Botões
- ❌ Botões pequenos difíceis de clicar em mobile
- **Solução:** Aumentar área de toque (min 44x44px)

---

## Status da Auditoria
- ✅ Home.tsx - Auditado
- ⏳ Demais páginas - Pendente

## Próximos Passos
1. Auditar todas as páginas listadas
2. Priorizar correções por impacto
3. Implementar correções página por página
4. Testar em diferentes resoluções
5. Documentar padrões responsivos para futuras páginas
