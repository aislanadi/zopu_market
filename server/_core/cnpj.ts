/**
 * Helper para buscar dados de CNPJ via BrasilAPI
 * Documentação: https://brasilapi.com.br/docs#tag/CNPJ
 */

export interface CNPJData {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia?: string;
  cnae: string;
  cnaeDescricao?: string;
  cnaesSecundarios?: Array<{
    codigo: string;
    descricao: string;
  }>;
  uf: string;
  municipio?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  situacaoCadastral?: string;
  dataAbertura?: string;
  porte?: string;
}

/**
 * Busca dados de CNPJ na BrasilAPI
 * @param cnpj CNPJ com ou sem formatação (00.000.000/0000-00 ou 00000000000000)
 * @returns Dados da empresa ou null se não encontrado
 */
export async function fetchCNPJ(cnpj: string): Promise<CNPJData | null> {
  try {
    // Remove formatação do CNPJ
    const cnpjClean = cnpj.replace(/[^\d]/g, '');
    
    if (cnpjClean.length !== 14) {
      throw new Error('CNPJ deve ter 14 dígitos');
    }
    
    const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return null; // CNPJ não encontrado
      }
      throw new Error(`Erro ao buscar CNPJ: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Mapear resposta da BrasilAPI para nosso formato
    return {
      cnpj: data.cnpj || cnpjClean,
      razaoSocial: data.razao_social || '',
      nomeFantasia: data.nome_fantasia || '',
      cnae: data.cnae_fiscal ? String(data.cnae_fiscal) : '',
      cnaeDescricao: data.cnae_fiscal_descricao || '',
      cnaesSecundarios: data.cnaes_secundarios?.map((cnae: any) => ({
        codigo: String(cnae.codigo || ''),
        descricao: cnae.descricao || '',
      })) || [],
      uf: data.uf || '',
      municipio: data.municipio || '',
      logradouro: data.logradouro || '',
      numero: data.numero || '',
      complemento: data.complemento || '',
      bairro: data.bairro || '',
      cep: data.cep || '',
      situacaoCadastral: data.descricao_situacao_cadastral || '',
      dataAbertura: data.data_inicio_atividade || '',
      porte: data.porte || '',
    };
  } catch (error) {
    console.error('Erro ao buscar CNPJ:', error);
    throw error;
  }
}

/**
 * Formata CNPJ para exibição (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const clean = cnpj.replace(/[^\d]/g, '');
  if (clean.length !== 14) return cnpj;
  
  return clean.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5'
  );
}

/**
 * Remove formatação do CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/[^\d]/g, '');
}
