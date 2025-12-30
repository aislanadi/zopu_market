import axios from "axios";

interface BitrixLeadData {
  TITLE: string;
  NAME?: string;
  EMAIL?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  PHONE?: Array<{ VALUE: string; VALUE_TYPE: string }>;
  COMPANY_TITLE?: string;
  COMMENTS?: string;
  SOURCE_ID?: string;
  SOURCE_DESCRIPTION?: string;
  UF_CRM_OFFER_ID?: string;
  UF_CRM_REFERRAL_ID?: string;
  UF_CRM_SUCCESS_FEE?: string;
}

interface CreateLeadResponse {
  success: boolean;
  leadId?: string;
  error?: string;
}

/**
 * Cria um lead no Bitrix24 do parceiro
 * @param webhookUrl URL completa do webhook de saída do Bitrix24 do parceiro
 * @param leadData Dados do lead a ser criado
 */
export async function createBitrixLead(
  webhookUrl: string,
  leadData: BitrixLeadData
): Promise<CreateLeadResponse> {
  try {
    // Validar URL do webhook
    if (!webhookUrl || !webhookUrl.includes("bitrix24")) {
      throw new Error("URL do webhook Bitrix24 inválida");
    }

    // Construir URL da API
    const apiUrl = webhookUrl.endsWith("/")
      ? `${webhookUrl}crm.lead.add.json`
      : `${webhookUrl}/crm.lead.add.json`;

    // Fazer requisição para criar lead
    const response = await axios.post(apiUrl, {
      fields: leadData,
    });

    if (response.data && response.data.result) {
      return {
        success: true,
        leadId: response.data.result.toString(),
      };
    }

    return {
      success: false,
      error: "Resposta inválida do Bitrix24",
    };
  } catch (error: any) {
    console.error("[Bitrix24] Erro ao criar lead:", error.message);
    return {
      success: false,
      error: error.message || "Erro ao criar lead no Bitrix24",
    };
  }
}

/**
 * Testa a conexão com o Bitrix24
 * @param webhookUrl URL completa do webhook de saída do Bitrix24
 */
export async function testBitrixConnection(webhookUrl: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!webhookUrl || !webhookUrl.includes("bitrix24")) {
      throw new Error("URL do webhook Bitrix24 inválida");
    }

    // Testar com endpoint simples que não cria dados
    const apiUrl = webhookUrl.endsWith("/")
      ? `${webhookUrl}crm.lead.fields.json`
      : `${webhookUrl}/crm.lead.fields.json`;

    const response = await axios.get(apiUrl, { timeout: 10000 });

    if (response.data && response.data.result) {
      return { success: true };
    }

    return {
      success: false,
      error: "Resposta inválida do Bitrix24",
    };
  } catch (error: any) {
    console.error("[Bitrix24] Erro ao testar conexão:", error.message);
    return {
      success: false,
      error: error.message || "Erro ao conectar com Bitrix24",
    };
  }
}

/**
 * Busca usuários do Bitrix24 (para configuração)
 * @param webhookUrl URL completa do webhook de saída do Bitrix24
 */
export async function getBitrixUsers(webhookUrl: string): Promise<{
  success: boolean;
  users?: Array<{ ID: string; NAME: string; EMAIL: string }>;
  error?: string;
}> {
  try {
    if (!webhookUrl || !webhookUrl.includes("bitrix24")) {
      throw new Error("URL do webhook Bitrix24 inválida");
    }

    const apiUrl = webhookUrl.endsWith("/")
      ? `${webhookUrl}user.get.json`
      : `${webhookUrl}/user.get.json`;

    const response = await axios.get(apiUrl, { timeout: 10000 });

    if (response.data && response.data.result) {
      return {
        success: true,
        users: response.data.result.map((user: any) => ({
          ID: user.ID,
          NAME: user.NAME + " " + user.LAST_NAME,
          EMAIL: user.EMAIL,
        })),
      };
    }

    return {
      success: false,
      error: "Resposta inválida do Bitrix24",
    };
  } catch (error: any) {
    console.error("[Bitrix24] Erro ao buscar usuários:", error.message);
    return {
      success: false,
      error: error.message || "Erro ao buscar usuários do Bitrix24",
    };
  }
}
