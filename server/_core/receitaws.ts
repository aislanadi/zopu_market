/**
 * Integração com ReceitaWS - API Pública da Receita Federal
 * Documentação: https://developers.receitaws.com.br/
 * 
 * Limite: 3 consultas por minuto (API pública)
 */

export interface ReceitaWSResponse {
  status: string;
  message?: string;
  cnpj: string;
  tipo: string;
  abertura: string;
  nome: string; // Razão Social
  fantasia: string; // Nome Fantasia
  porte: string; // MEI, ME, EPP, DEMAIS
  natureza_juridica: string;
  atividade_principal: Array<{
    code: string;
    text: string;
  }>;
  atividades_secundarias: Array<{
    code: string;
    text: string;
  }>;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
  cep: string;
  telefone: string;
  email: string;
  situacao: string; // ATIVA, BAIXADA, SUSPENSA, etc.
  data_situacao: string;
  motivo_situacao: string;
  situacao_especial: string;
  data_situacao_especial: string;
  capital_social: string;
  qsa: Array<{
    nome: string;
    qual: string;
  }>;
  // Campos adicionais
  efr?: string;
  ultima_atualizacao: string;
}

/**
 * Consulta dados de CNPJ na ReceitaWS
 * @param cnpj - CNPJ com ou sem formatação
 * @returns Dados da empresa ou null em caso de erro
 */
export async function searchCNPJ(cnpj: string): Promise<ReceitaWSResponse | null> {
  try {
    // Remover formatação do CNPJ (apenas números)
    const cleanCNPJ = cnpj.replace(/\D/g, "");
    
    if (cleanCNPJ.length !== 14) {
      throw new Error("CNPJ inválido: deve conter 14 dígitos");
    }

    // Consultar API pública da ReceitaWS
    const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cleanCNPJ}`, {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      console.error(`ReceitaWS API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: ReceitaWSResponse = await response.json();

    // Verificar se a consulta foi bem-sucedida
    if (data.status === "ERROR") {
      console.error(`ReceitaWS error: ${data.message}`);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Erro ao consultar ReceitaWS:", error);
    return null;
  }
}

/**
 * Classifica empresa em ecossistema baseado no CNAE principal
 * @param cnaeCode - Código CNAE (ex: "6201-5/00")
 * @returns Nome do ecossistema
 */
export function classifyEcosystem(cnaeCode: string): string {
  if (!cnaeCode) return "Outros";

  // Extrair os 2 primeiros dígitos do CNAE (seção)
  const section = cnaeCode.substring(0, 2);
  const sectionNum = parseInt(section);

  // Classificação baseada nas seções do CNAE
  // Fonte: https://concla.ibge.gov.br/estrutura/natjur-estrutura/cnae-estrutura.html
  
  if (sectionNum >= 1 && sectionNum <= 3) {
    return "Agronegócio"; // Agricultura, pecuária, pesca
  } else if (sectionNum >= 5 && sectionNum <= 9) {
    return "Indústria Extrativa"; // Mineração
  } else if (sectionNum >= 10 && sectionNum <= 33) {
    return "Indústria de Transformação";
  } else if (sectionNum === 35) {
    return "Energia"; // Eletricidade e gás
  } else if (sectionNum >= 36 && sectionNum <= 39) {
    return "Saneamento e Gestão de Resíduos";
  } else if (sectionNum >= 41 && sectionNum <= 43) {
    return "Construção Civil";
  } else if (sectionNum >= 45 && sectionNum <= 47) {
    return "Comércio"; // Varejo e atacado
  } else if (sectionNum >= 49 && sectionNum <= 53) {
    return "Transporte e Logística";
  } else if (sectionNum >= 55 && sectionNum <= 56) {
    return "Hospitalidade"; // Alojamento e alimentação
  } else if (sectionNum >= 58 && sectionNum <= 63) {
    return "Tecnologia e Comunicação"; // Informação e comunicação
  } else if (sectionNum >= 64 && sectionNum <= 66) {
    return "Serviços Financeiros";
  } else if (sectionNum === 68) {
    return "Imobiliário";
  } else if (sectionNum >= 69 && sectionNum <= 75) {
    return "Serviços Profissionais"; // Jurídico, contábil, consultoria, etc.
  } else if (sectionNum >= 77 && sectionNum <= 82) {
    return "Serviços Administrativos";
  } else if (sectionNum === 84) {
    return "Administração Pública";
  } else if (sectionNum === 85) {
    return "Educação";
  } else if (sectionNum >= 86 && sectionNum <= 88) {
    return "Saúde"; // Saúde humana e serviços sociais
  } else if (sectionNum >= 90 && sectionNum <= 93) {
    return "Cultura e Entretenimento"; // Artes, cultura, esporte, recreação
  } else if (sectionNum >= 94 && sectionNum <= 96) {
    return "Outros Serviços";
  } else if (sectionNum === 97 || sectionNum === 98) {
    return "Serviços Domésticos";
  } else if (sectionNum === 99) {
    return "Organismos Internacionais";
  }

  return "Outros";
}

/**
 * Calcula lead score baseado no porte da empresa
 * @param porte - Porte da empresa (MEI, ME, EPP, DEMAIS)
 * @returns Pontuação de 0 a 100
 */
export function calculateLeadScore(porte: string): number {
  const porteMap: Record<string, number> = {
    "MEI": 20,
    "ME": 40,
    "EPP": 60,
    "DEMAIS": 80,
  };

  return porteMap[porte] || 50;
}
