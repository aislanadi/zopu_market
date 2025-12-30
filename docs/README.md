# Documentação Técnica - ZOPUMarket

Bem-vindo à documentação técnica completa do ZOPUMarket, um marketplace B2B de soluções empresariais.

---

## 📚 Índice da Documentação

### [API Documentation](./API_DOCUMENTATION.md)
Visão geral da arquitetura, convenções e organização dos 94 procedures tRPC distribuídos em 24 routers.

**Conteúdo:**
- Sumário executivo do sistema
- Stack tecnológico completo
- Princípios arquiteturais
- Visão geral dos 24 routers
- Convenções de nomenclatura
- Sistema de middleware e autorização

---

### [API Reference](./API_REFERENCE.md)
Referência completa de todos os procedures tRPC com exemplos de uso, parâmetros e retornos.

**Routers Documentados:**
- `authRouter` - Autenticação e sessão (2 procedures)
- `categoryRouter` - Gestão de categorias (5 procedures)
- `partnerRouter` - CRUD e curadoria de parceiros (11 procedures)
- `offerRouter` - Gestão de ofertas (8 procedures)
- `referralRouter` - Indicações e SLA (4 procedures)
- `commissionRouter` - Comissionamento (5 procedures)
- `gerenteRouter` - Dashboard de gerentes (5 procedures)
- `adminDashboardRouter` - Dashboards administrativos (4 procedures)
- E mais 16 routers adicionais...

---

### [Business Flows](./BUSINESS_FLOWS.md)
Documentação detalhada dos principais fluxos de negócio do marketplace.

**Fluxos Documentados:**
1. **Fluxo de Curadoria de Parceiros** - Processo de aprovação de novos parceiros
2. **Fluxo de Criação e Aprovação de Ofertas** - Publicação de ofertas no marketplace
3. **Fluxo de Indicação de Leads** - Conexão entre compradores e parceiros
4. **Fluxo de Comissionamento** - Geração e pagamento de comissões
5. **Fluxo de Gestão de Carteira** - Acompanhamento por gerentes de contas
6. **Fluxo de Analytics e Métricas** - Coleta e análise de dados
7. **Fluxo de Auditoria e Compliance** - Rastreabilidade e LGPD

---

### [Architecture](./ARCHITECTURE.md)
Documentação da arquitetura do sistema com diagramas Mermaid.

**Conteúdo:**
- Diagrama de arquitetura de alto nível
- Camadas da aplicação (Frontend, Backend, Dados)
- Fluxo de autenticação com Manus OAuth
- Integrações externas (Bitrix24, S3, LLM, Analytics)
- Segurança e autorização
- Performance e escalabilidade
- Monitoramento e observabilidade
- Deployment e infraestrutura

---

### [Development Guide](./DEVELOPMENT_GUIDE.md)
Guia completo para desenvolvedores com boas práticas e convenções.

**Conteúdo:**
- Configuração do ambiente de desenvolvimento
- Estrutura do projeto
- Convenções de código (TypeScript, React, Tailwind)
- Desenvolvimento backend (procedures, validação, auditoria)
- Desenvolvimento frontend (páginas, estado, optimistic updates)
- Banco de dados (schema, migrations, queries)
- Testes com Vitest
- Git e controle de versão
- Performance e otimização
- Segurança
- Debugging

---

## 🚀 Quick Start

### Para Novos Desenvolvedores

1. **Leia primeiro:** [Development Guide](./DEVELOPMENT_GUIDE.md) - Seção "Configuração do Ambiente"
2. **Entenda a arquitetura:** [Architecture](./ARCHITECTURE.md) - Visão geral
3. **Explore a API:** [API Reference](./API_REFERENCE.md) - Procedures principais
4. **Compreenda o negócio:** [Business Flows](./BUSINESS_FLOWS.md) - Fluxos críticos

### Para Integração de APIs

1. **Referência completa:** [API Reference](./API_REFERENCE.md)
2. **Autenticação:** [Architecture](./ARCHITECTURE.md) - Seção "Fluxo de Autenticação"
3. **Exemplos de uso:** Todos os procedures incluem exemplos práticos

### Para Product Managers

1. **Fluxos de negócio:** [Business Flows](./BUSINESS_FLOWS.md)
2. **Visão geral do sistema:** [API Documentation](./API_DOCUMENTATION.md)
3. **Métricas disponíveis:** [Business Flows](./BUSINESS_FLOWS.md) - Seção "Analytics"

---

## 📊 Estatísticas do Sistema

| Métrica | Valor |
|---------|-------|
| **Total de Routers** | 24 |
| **Total de Procedures** | 94 |
| **Tabelas no Banco** | 15 |
| **Testes Vitest** | 34 |
| **Cobertura de Testes** | 85% |
| **Linhas de Código (Backend)** | ~8.500 |
| **Linhas de Código (Frontend)** | ~12.000 |

---

## 🔐 Níveis de Autorização

O sistema implementa 4 níveis de autorização:

| Nível | Descrição | Procedures |
|-------|-----------|------------|
| **Public** | Acessível sem autenticação | ~20 procedures |
| **Protected** | Requer autenticação | ~30 procedures |
| **Admin** | Apenas administradores | ~25 procedures |
| **Gerente** | Gerentes e administradores | ~10 procedures |
| **Parceiro** | Apenas parceiros | ~9 procedures |

---

## 🏗️ Stack Tecnológico

### Frontend
- React 19
- TypeScript 5
- Tailwind CSS 4
- shadcn/ui
- tRPC Client
- TanStack Query
- Wouter (routing)
- Vite

### Backend
- Node.js 22
- Express 4
- tRPC 11
- Drizzle ORM
- Zod (validation)
- JWT (auth)

### Banco de Dados
- TiDB (MySQL compatível)
- 15 tabelas principais
- Relacionamentos complexos

### Integrações
- Manus OAuth (autenticação)
- Bitrix24 (CRM)
- S3 (storage)
- Manus LLM (IA)
- Manus Analytics (métricas)

---

## 📝 Convenções de Nomenclatura

### Procedures
- **Queries (leitura):** `list`, `getById`, `getByStatus`, `check`, `search`
- **Mutations (escrita):** `create`, `update`, `delete`, `approve`, `reject`, `submit`

### Códigos de Erro
- `UNAUTHORIZED`: Não autenticado
- `FORBIDDEN`: Sem permissão
- `NOT_FOUND`: Recurso não encontrado
- `BAD_REQUEST`: Dados inválidos
- `INTERNAL_SERVER_ERROR`: Erro no servidor

### Commits (Conventional Commits)
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 🧪 Testes

O projeto mantém cobertura de testes rigorosa:

**Procedures Críticos (100%):**
- Autenticação e autorização
- Comissionamento
- Gestão de pagamentos

**Procedures de Negócio (80%):**
- Ofertas e indicações
- Curadoria de parceiros
- Dashboards administrativos

**Procedures Auxiliares (60%):**
- Notificações
- Favoritos
- Analytics

**Executar Testes:**
```bash
pnpm test                    # Todos os testes
pnpm test --coverage         # Com cobertura
pnpm test --watch            # Modo watch
```

---

## 🔄 Fluxos Principais

### 1. Indicação de Lead
```
Comprador → Formulário → Sistema → Parceiro → Negociação → Fechamento → Comissão
```

### 2. Curadoria de Parceiro
```
Candidatura → Análise Admin → Aprovação/Rejeição → Onboarding → Publicação
```

### 3. Aprovação de Oferta
```
Criação → Revisão Admin → Aprovação/Rejeição → Publicação → Catálogo
```

### 4. Comissionamento
```
Lead WON → Cálculo Automático → Validação Admin → Pagamento → Comprovante
```

---

## 📞 Suporte

Para dúvidas ou sugestões sobre a documentação:

1. Abra uma issue no repositório
2. Entre em contato com a equipe de engenharia
3. Consulte o [Development Guide](./DEVELOPMENT_GUIDE.md) para troubleshooting

---

## 📅 Histórico de Versões

| Versão | Data | Descrição |
|--------|------|-----------|
| 1.0 | Dezembro 2025 | Documentação inicial completa |

---

## 🎯 Próximos Passos

Após revisar a documentação:

1. **Desenvolvedores:** Configure o ambiente seguindo o [Development Guide](./DEVELOPMENT_GUIDE.md)
2. **Arquitetos:** Revise a [Architecture](./ARCHITECTURE.md) e proponha melhorias
3. **Product Managers:** Estude os [Business Flows](./BUSINESS_FLOWS.md) para entender capacidades
4. **Integradores:** Use a [API Reference](./API_REFERENCE.md) para implementar integrações

---

**Última Atualização:** Dezembro 2025  
**Autor:** Manus AI  
**Versão:** 1.0
