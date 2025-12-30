/**
 * Script para cadastrar a ZOPU como parceiro premium oficial
 * com ofertas de licenças Bitrix24 e aplicativos do ecossistema
 * 
 * Uso: node seed-zopu.mjs
 */

import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL não configurada");
  process.exit(1);
}

const connection = await mysql.createConnection(DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🚀 Iniciando seed da ZOPU...\n");

// ID fixo para a ZOPU
const ZOPU_PARTNER_ID = 1;

try {
  // 1. Verificar se ZOPU já existe
  const existingZopu = await db
    .select()
    .from(schema.partners)
    .where(eq(schema.partners.id, ZOPU_PARTNER_ID))
    .limit(1);

  let zopuPartnerId;

  if (existingZopu.length > 0) {
    console.log("ℹ️  ZOPU já existe no banco (ID: 1). Atualizando dados...");
    
    await db
      .update(schema.partners)
      .set({
        companyName: "ZOPU Tecnologia",
        cnpj: "12345678000190", // CNPJ fictício para exemplo
        curationStatus: "APPROVED",
        tier: "PREMIUM",
        contactEmail: "contato@zopu.com.br",
        contactPhone: "(47) 3307-9280",
        whatsapp: "554733079280",
        website: "https://zopu.com.br",
        description: "Parceiro oficial Bitrix24 no Brasil. A ZOPU é especializada em implementação, customização e suporte de soluções Bitrix24 para empresas de todos os portes. Com anos de experiência, oferecemos licenças, aplicativos personalizados e consultoria especializada.",
        ecosystems: "Tecnologia,Gestão Empresarial,CRM,Automação",
        city: "Blumenau",
        state: "SC",
        logoUrl: "/logo-zopu.png",
        institutionalVideoUrl: "", // Pode adicionar URL do YouTube depois
        bitrixWebhookUrl: null,
        bitrixAccessToken: null,
        pixKey: null,
        bankName: null,
        bankAgency: null,
        bankAccount: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.partners.id, ZOPU_PARTNER_ID));
    
    zopuPartnerId = ZOPU_PARTNER_ID;
    console.log("✅ Dados da ZOPU atualizados\n");
  } else {
    console.log("📝 Criando parceiro ZOPU...");
    
    const [result] = await db.insert(schema.partners).values({
      id: ZOPU_PARTNER_ID,
      companyName: "ZOPU Tecnologia",
      cnpj: "12345678000190",
      curationStatus: "APPROVED",
      tier: "PREMIUM",
      contactEmail: "contato@zopu.com.br",
      contactPhone: "(47) 3307-9280",
      whatsapp: "554733079280",
      website: "https://zopu.com.br",
      description: "Parceiro oficial Bitrix24 no Brasil. A ZOPU é especializada em implementação, customização e suporte de soluções Bitrix24 para empresas de todos os portes. Com anos de experiência, oferecemos licenças, aplicativos personalizados e consultoria especializada.",
      ecosystems: "Tecnologia,Gestão Empresarial,CRM,Automação",
      city: "Blumenau",
      state: "SC",
      logoUrl: "/logo-zopu.png",
      institutionalVideoUrl: "",
      bitrixWebhookUrl: null,
      bitrixAccessToken: null,
      pixKey: null,
      bankName: null,
      bankAgency: null,
      bankAccount: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    zopuPartnerId = ZOPU_PARTNER_ID;
    console.log("✅ Parceiro ZOPU criado (ID: 1)\n");
  }

  // 2. Buscar categoria "Licenças Bitrix24"
  let licenseCategory = await db
    .select()
    .from(schema.categories)
    .where(eq(schema.categories.name, "Licenças Bitrix24"))
    .limit(1);

  let licenseCategoryId;

  if (licenseCategory.length === 0) {
    console.log("📝 Criando categoria 'Licenças Bitrix24'...");
    const [catResult] = await db.insert(schema.categories).values({
      name: "Licenças Bitrix24",
      description: "Licenças oficiais Bitrix24 para empresas",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    licenseCategoryId = catResult.insertId;
    console.log(`✅ Categoria criada (ID: ${licenseCategoryId})\n`);
  } else {
    licenseCategoryId = licenseCategory[0].id;
    console.log(`ℹ️  Categoria 'Licenças Bitrix24' já existe (ID: ${licenseCategoryId})\n`);
  }

  // 3. Criar ofertas de licenças Bitrix24
  console.log("📝 Criando ofertas de licenças Bitrix24...\n");

  const licenseOffers = [
    {
      title: "Bitrix24 Start+",
      description: "Plano ideal para pequenas empresas que estão começando a digitalizar seus processos. Inclui CRM, tarefas, calendário e armazenamento em nuvem.",
      categoryId: licenseCategoryId,
      partnerId: zopuPartnerId,
      offerType: "LICENSE",
      saleMode: "CHECKOUT",
      price: 6900, // R$ 69,00/mês anual
      icp: "Pequenas empresas (até 5 usuários)",
      promessa: "Organize sua equipe e centralize a comunicação em uma única plataforma",
      entregaveis: JSON.stringify([
        "Até 5 usuários",
        "CRM completo",
        "Tarefas e projetos",
        "Calendário compartilhado",
        "24GB de armazenamento",
        "Suporte técnico básico"
      ]),
      cases: JSON.stringify([
        {
          title: "Startup de tecnologia aumentou produtividade em 40%",
          description: "Com o Bitrix24 Start+, a equipe conseguiu centralizar todas as tarefas e melhorar a comunicação interna"
        }
      ]),
      faq: JSON.stringify([
        {
          question: "Quantos usuários estão incluídos?",
          answer: "O plano Start+ inclui até 5 usuários ativos"
        },
        {
          question: "Posso fazer upgrade depois?",
          answer: "Sim, você pode fazer upgrade para planos superiores a qualquer momento"
        }
      ]),
      imageUrl: "/bitrix24-logo.png",
      videoUrl: "",
      status: "PUBLISHED",
      successFeePercent: 20,
      profitMargin: 30,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Bitrix24 Professional",
      description: "Solução completa para empresas em crescimento. Inclui automação de vendas, marketing, relatórios avançados e integrações ilimitadas.",
      categoryId: licenseCategoryId,
      partnerId: zopuPartnerId,
      offerType: "LICENSE",
      saleMode: "CHECKOUT",
      price: 24999, // R$ 249,99/mês anual
      icp: "Empresas em crescimento (até 50 usuários)",
      promessa: "Automatize processos, aumente vendas e escale seu negócio com inteligência",
      entregaveis: JSON.stringify([
        "Até 50 usuários",
        "CRM avançado com automação",
        "Marketing digital integrado",
        "Relatórios e dashboards personalizados",
        "1024GB de armazenamento",
        "Integrações ilimitadas",
        "Suporte técnico prioritário",
        "Treinamento inicial incluído"
      ]),
      cases: JSON.stringify([
        {
          title: "Indústria aumentou vendas em 65% com automação",
          description: "A automação de processos comerciais permitiu que a equipe focasse em negociações estratégicas"
        },
        {
          title: "Agência de marketing triplicou número de clientes",
          description: "Com CRM e automação, a agência conseguiu gerenciar 3x mais clientes sem aumentar equipe"
        }
      ]),
      faq: JSON.stringify([
        {
          question: "Qual a diferença para o Start+?",
          answer: "O Professional inclui automação avançada, mais usuários, mais armazenamento e suporte prioritário"
        },
        {
          question: "O treinamento está incluído?",
          answer: "Sim, oferecemos treinamento inicial de 4 horas para sua equipe"
        },
        {
          question: "Posso integrar com outras ferramentas?",
          answer: "Sim, o Professional permite integrações ilimitadas via API e webhooks"
        }
      ]),
      imageUrl: "/bitrix24-logo.png",
      videoUrl: "",
      status: "PUBLISHED",
      successFeePercent: 20,
      profitMargin: 35,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      title: "Bitrix24 Enterprise",
      description: "Plataforma corporativa completa com recursos avançados de segurança, personalização ilimitada e suporte dedicado 24/7.",
      categoryId: licenseCategoryId,
      partnerId: zopuPartnerId,
      offerType: "LICENSE",
      saleMode: "LEAD_FORM",
      price: null, // Sob consulta
      icp: "Grandes empresas (usuários ilimitados)",
      promessa: "Transforme digitalmente sua empresa com a plataforma mais completa do mercado",
      entregaveis: JSON.stringify([
        "Usuários ilimitados",
        "CRM enterprise com IA",
        "Automação avançada de processos",
        "BI e analytics em tempo real",
        "Armazenamento ilimitado",
        "Personalização completa",
        "Servidor dedicado",
        "Suporte 24/7 com SLA",
        "Consultoria estratégica incluída",
        "Implementação personalizada"
      ]),
      cases: JSON.stringify([
        {
          title: "Multinacional unificou operações em 12 países",
          description: "Com Bitrix24 Enterprise, a empresa centralizou processos e ganhou visibilidade global em tempo real"
        },
        {
          title: "Grupo empresarial economizou R$ 2M/ano em licenças",
          description: "Substituição de múltiplas ferramentas por uma única plataforma integrada"
        }
      ]),
      faq: JSON.stringify([
        {
          question: "Qual o número máximo de usuários?",
          answer: "O plano Enterprise não tem limite de usuários"
        },
        {
          question: "Como funciona o suporte 24/7?",
          answer: "Você terá um gerente de conta dedicado e suporte técnico disponível 24 horas por dia, 7 dias por semana"
        },
        {
          question: "Posso ter servidor próprio?",
          answer: "Sim, o Enterprise pode ser instalado em servidor dedicado (cloud ou on-premise)"
        }
      ]),
      imageUrl: "/bitrix24-logo.png",
      videoUrl: "",
      status: "PUBLISHED",
      successFeePercent: 25,
      profitMargin: 40,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  for (const offer of licenseOffers) {
    // Verificar se oferta já existe
    const existing = await db
      .select()
      .from(schema.offers)
      .where(eq(schema.offers.title, offer.title))
      .limit(1);

    if (existing.length > 0) {
      console.log(`ℹ️  Oferta "${offer.title}" já existe. Pulando...`);
    } else {
      await db.insert(schema.offers).values(offer);
      console.log(`✅ Oferta "${offer.title}" criada`);
    }
  }

  console.log("\n🎉 Seed da ZOPU concluído com sucesso!");
  console.log("\n📊 Resumo:");
  console.log(`- Parceiro ZOPU: ID ${zopuPartnerId} (PREMIUM)`);
  console.log(`- Categoria: Licenças Bitrix24 (ID ${licenseCategoryId})`);
  console.log(`- Ofertas: 3 licenças Bitrix24 (Start+, Professional, Enterprise)`);
  
} catch (error) {
  console.error("\n❌ Erro ao executar seed:", error);
  process.exit(1);
} finally {
  await connection.end();
}
