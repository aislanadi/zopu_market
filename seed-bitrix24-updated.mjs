import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection, { schema, mode: "default" });

console.log("🚀 Atualizando planos Bitrix24...\n");

// IDs das ofertas antigas para deletar
const oldOfferIds = [90000, 90001, 90002]; // Start+, Professional, Enterprise antigos

// Deletar ofertas antigas
for (const offerId of oldOfferIds) {
  await db.delete(schema.offers).where(eq(schema.offers.id, offerId));
  console.log(`✅ Oferta antiga ID ${offerId} removida`);
}

// Novos planos Bitrix24
const newOffers = [
  {
    id: 90010,
    partnerId: 1, // ZOPU
    categoryId: 1, // Licenças Bitrix24
    title: "Bitrix24 Basic",
    description: "Plano básico ideal para pequenas empresas que estão começando a estruturar processos comerciais e de gestão.",
    offerType: "LICENSE",
    saleMode: "CHECKOUT",
    price: null, // Preço base não usado, usar priceQuarterly/priceAnnual
    priceQuarterly: 20700, // R$ 207,00 (R$ 69/mês * 3)
    priceAnnual: 79200, // R$ 792,00 (R$ 66/mês * 12 com desconto)
    billingPeriods: JSON.stringify(["QUARTERLY", "ANNUAL"]),
    variants: null,
    successFeePercent: 20,
    zopuTakeRatePercent: 100,
    partnerSharePercent: 0,
    icp: "Pequenas empresas de 2-10 colaboradores que precisam centralizar comunicação, tarefas e CRM básico em uma única plataforma.",
    promessa: "Organize sua equipe com CRM, tarefas, chat e videoconferências em um só lugar, sem complicação.",
    entregaveis: JSON.stringify([
      "Até 5 usuários",
      "CRM básico",
      "Chat e videoconferências ilimitadas",
      "Tarefas e projetos",
      "5GB de armazenamento",
      "Suporte por email",
      "Treinamento inicial de 2 horas"
    ]),
    cases: JSON.stringify([
      {
        title: "Startup de tecnologia organizou processos com Basic",
        description: "Equipe de 4 pessoas conseguiu centralizar comunicação e tarefas, reduzindo uso de ferramentas externas"
      },
      {
        title: "Consultoria aumentou produtividade em 40%",
        description: "Com CRM e tarefas integradas, a equipe conseguiu acompanhar melhor os projetos de clientes"
      }
    ]),
    faq: JSON.stringify([
      {
        question: "Quantos usuários posso ter no Basic?",
        answer: "O plano Basic suporta até 5 usuários ativos."
      },
      {
        question: "Posso fazer upgrade depois?",
        answer: "Sim, você pode migrar para Standard ou Professional a qualquer momento."
      },
      {
        question: "O treinamento está incluído?",
        answer: "Sim, oferecemos 2 horas de treinamento inicial para sua equipe."
      }
    ]),
    imageUrl: null,
    videoUrl: null,
    status: "PUBLISHED"
  },
  {
    id: 90011,
    partnerId: 1,
    categoryId: 1,
    title: "Bitrix24 Standard",
    description: "Plano intermediário para empresas em crescimento que precisam de automação e mais recursos de colaboração.",
    offerType: "LICENSE",
    saleMode: "CHECKOUT",
    price: null,
    priceQuarterly: 41700, // R$ 417,00 (R$ 139/mês * 3)
    priceAnnual: 159840, // R$ 1.598,40 (R$ 133,20/mês * 12 com desconto)
    billingPeriods: JSON.stringify(["QUARTERLY", "ANNUAL"]),
    variants: null,
    successFeePercent: 20,
    zopuTakeRatePercent: 100,
    partnerSharePercent: 0,
    icp: "Empresas de 10-50 colaboradores que precisam de automação de processos, relatórios avançados e integrações.",
    promessa: "Automatize processos comerciais e aumente a produtividade com CRM avançado, automação e relatórios personalizados.",
    entregaveis: JSON.stringify([
      "Até 50 usuários",
      "CRM avançado com automação",
      "Marketing digital integrado",
      "Relatórios e dashboards",
      "100GB de armazenamento",
      "Integrações com ferramentas externas",
      "Suporte prioritário",
      "Treinamento inicial de 4 horas"
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
        question: "Qual a diferença para o Basic?",
        answer: "O Standard inclui automação avançada, mais usuários, mais armazenamento e suporte prioritário."
      },
      {
        question: "Posso integrar com outras ferramentas?",
        answer: "Sim, o Standard permite integrações com diversas ferramentas via API e webhooks."
      },
      {
        question: "O treinamento está incluído?",
        answer: "Sim, oferecemos treinamento inicial de 4 horas para sua equipe."
      }
    ]),
    imageUrl: null,
    videoUrl: null,
    status: "PUBLISHED"
  },
  {
    id: 90012,
    partnerId: 1,
    categoryId: 1,
    title: "Bitrix24 Professional",
    description: "Plano profissional para empresas que precisam de recursos avançados de vendas, marketing e gestão de equipes.",
    offerType: "LICENSE",
    saleMode: "CHECKOUT",
    price: null,
    priceQuarterly: 74970, // R$ 749,70 (R$ 249,90/mês * 3)
    priceAnnual: 287904, // R$ 2.879,04 (R$ 239,92/mês * 12 com desconto)
    billingPeriods: JSON.stringify(["QUARTERLY", "ANNUAL"]),
    variants: null,
    successFeePercent: 20,
    zopuTakeRatePercent: 100,
    partnerSharePercent: 0,
    icp: "Empresas de 50-250 colaboradores com processos comerciais complexos, múltiplas equipes e necessidade de relatórios avançados.",
    promessa: "Gerencie operações complexas com recursos enterprise: automação avançada, BI, gestão de projetos e suporte premium.",
    entregaveis: JSON.stringify([
      "Até 250 usuários",
      "CRM enterprise com IA",
      "Automação avançada de processos",
      "Business Intelligence e relatórios customizados",
      "1024GB de armazenamento",
      "Integrações ilimitadas",
      "Suporte técnico premium 24/7",
      "Treinamento completo de 8 horas",
      "Consultoria de implementação"
    ]),
    cases: JSON.stringify([
      {
        title: "Rede de varejo aumentou eficiência operacional em 80%",
        description: "Com automação e BI, a rede conseguiu otimizar processos e reduzir custos operacionais significativamente"
      },
      {
        title: "Empresa de serviços dobrou receita em 12 meses",
        description: "Gestão avançada de projetos e CRM permitiram escalar operações sem perder qualidade"
      }
    ]),
    faq: JSON.stringify([
      {
        question: "Qual a diferença para o Standard?",
        answer: "O Professional inclui IA, BI avançado, mais usuários, armazenamento ilimitado e suporte premium 24/7."
      },
      {
        question: "Tem consultoria de implementação?",
        answer: "Sim, incluímos consultoria especializada para garantir o sucesso da implementação."
      },
      {
        question: "O suporte é 24/7?",
        answer: "Sim, o plano Professional inclui suporte técnico premium disponível 24 horas por dia, 7 dias por semana."
      }
    ]),
    imageUrl: null,
    videoUrl: null,
    status: "PUBLISHED"
  },
  {
    id: 90013,
    partnerId: 1,
    categoryId: 1,
    title: "Bitrix24 Enterprise",
    description: "Solução enterprise customizável para grandes empresas com necessidades específicas e volumes elevados de usuários.",
    offerType: "LICENSE",
    saleMode: "LEAD_FORM", // Sob consulta
    price: null,
    priceMonthly: null, // Definido nas variantes
    priceQuarterly: null,
    priceAnnual: null,
    billingPeriods: JSON.stringify(["MONTHLY", "QUARTERLY", "ANNUAL"]), // Enterprise permite mensal
    variants: JSON.stringify([
      {
        name: "Enterprise 250",
        userLimit: 250,
        priceMonthly: 59900, // R$ 599,00/mês
        priceQuarterly: 161730, // R$ 1.617,30 (10% desconto)
        priceAnnual: 611280 // R$ 6.112,80 (15% desconto)
      },
      {
        name: "Enterprise 500",
        userLimit: 500,
        priceMonthly: 109900, // R$ 1.099,00/mês
        priceQuarterly: 296730, // R$ 2.967,30 (10% desconto)
        priceAnnual: 1122480 // R$ 11.224,80 (15% desconto)
      },
      {
        name: "Enterprise 1000",
        userLimit: 1000,
        priceMonthly: 199900, // R$ 1.999,00/mês
        priceQuarterly: 539730, // R$ 5.397,30 (10% desconto)
        priceAnnual: 2038980 // R$ 20.389,80 (15% desconto)
      },
      {
        name: "Enterprise 2000",
        userLimit: 2000,
        priceMonthly: 349900, // R$ 3.499,00/mês
        priceQuarterly: 944730, // R$ 9.447,30 (10% desconto)
        priceAnnual: 3568980 // R$ 35.689,80 (15% desconto)
      }
    ]),
    successFeePercent: 20,
    zopuTakeRatePercent: 100,
    partnerSharePercent: 0,
    icp: "Grandes empresas e corporações com mais de 250 colaboradores que precisam de customização, infraestrutura dedicada e SLA garantido.",
    promessa: "Solução enterprise completa com infraestrutura dedicada, customização ilimitada, SLA garantido e suporte estratégico.",
    entregaveis: JSON.stringify([
      "250 a 2000+ usuários (escalável)",
      "Infraestrutura dedicada",
      "Customização ilimitada",
      "SLA de 99,9% de uptime",
      "Armazenamento ilimitado",
      "Integrações enterprise",
      "Gerente de conta dedicado",
      "Suporte estratégico 24/7",
      "Consultoria contínua",
      "Treinamentos personalizados ilimitados"
    ]),
    cases: JSON.stringify([
      {
        title: "Multinacional integrou 5 países em uma única plataforma",
        description: "Com Enterprise, a empresa conseguiu padronizar processos globalmente mantendo flexibilidade local"
      },
      {
        title: "Holding reduziu custos de TI em 40%",
        description: "Consolidação de ferramentas e infraestrutura dedicada geraram economia significativa"
      }
    ]),
    faq: JSON.stringify([
      {
        question: "Quais são as opções de usuários?",
        answer: "Oferecemos pacotes de 250, 500, 1000 e 2000 usuários. Para volumes maiores, consulte nossa equipe."
      },
      {
        question: "Posso pagar mensalmente?",
        answer: "Sim, o plano Enterprise é o único que permite pagamento mensal, além de trimestral e anual."
      },
      {
        question: "O que significa infraestrutura dedicada?",
        answer: "Sua empresa terá servidores exclusivos, garantindo máxima performance, segurança e customização."
      },
      {
        question: "Tem período de teste?",
        answer: "Sim, oferecemos 30 dias de teste gratuito com suporte completo para avaliar a solução."
      }
    ]),
    imageUrl: null,
    videoUrl: null,
    status: "PUBLISHED"
  }
];

// Inserir novas ofertas
for (const offer of newOffers) {
  await db.insert(schema.offers).values(offer);
  console.log(`✅ Oferta criada: ${offer.title} (ID: ${offer.id})`);
}

console.log("\n🎉 Planos Bitrix24 atualizados com sucesso!");
console.log("\n📋 Resumo:");
console.log("- Basic: Trimestral/Anual");
console.log("- Standard: Trimestral/Anual");
console.log("- Professional: Trimestral/Anual");
console.log("- Enterprise: Mensal/Trimestral/Anual (4 variantes: 250/500/1000/2000 usuários)");

await connection.end();
