/**
 * Utilitários para formatação e validação de CNPJ
 */

/**
 * Aplica máscara de CNPJ durante digitação (00.000.000/0000-00)
 * Remove caracteres não numéricos e aplica formatação
 * @param value Valor do input
 * @returns Valor formatado com máscara
 */
export function formatCNPJInput(value: string): string {
  // Remove tudo que não é dígito
  const numbers = value.replace(/\D/g, '');
  
  // Limita a 14 dígitos
  const limited = numbers.slice(0, 14);
  
  // Aplica a máscara progressivamente conforme o usuário digita
  if (limited.length <= 2) {
    return limited;
  } else if (limited.length <= 5) {
    return `${limited.slice(0, 2)}.${limited.slice(2)}`;
  } else if (limited.length <= 8) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5)}`;
  } else if (limited.length <= 12) {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8)}`;
  } else {
    return `${limited.slice(0, 2)}.${limited.slice(2, 5)}.${limited.slice(5, 8)}/${limited.slice(8, 12)}-${limited.slice(12)}`;
  }
}

/**
 * Remove formatação do CNPJ (retorna apenas números)
 * @param cnpj CNPJ formatado ou não
 * @returns Apenas os dígitos do CNPJ
 */
export function cleanCNPJ(cnpj: string): string {
  return cnpj.replace(/\D/g, '');
}

/**
 * Valida dígitos verificadores do CNPJ
 * @param cnpj CNPJ com ou sem formatação
 * @returns true se o CNPJ é válido
 */
export function validateCNPJ(cnpj: string): boolean {
  const numbers = cleanCNPJ(cnpj);
  
  // CNPJ deve ter 14 dígitos
  if (numbers.length !== 14) {
    return false;
  }
  
  // Rejeita CNPJs com todos os dígitos iguais
  if (/^(\d)\1+$/.test(numbers)) {
    return false;
  }
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  if (digit1 !== parseInt(numbers[12])) {
    return false;
  }
  
  // Validação do segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weight;
    weight = weight === 2 ? 9 : weight - 1;
  }
  let digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  
  return digit2 === parseInt(numbers[13]);
}

/**
 * Formata CNPJ completo (apenas para exibição)
 * @param cnpj CNPJ sem formatação (14 dígitos)
 * @returns CNPJ formatado (00.000.000/0000-00)
 */
export function formatCNPJ(cnpj: string): string {
  const numbers = cleanCNPJ(cnpj);
  if (numbers.length !== 14) {
    return cnpj; // Retorna original se não tiver 14 dígitos
  }
  return formatCNPJInput(numbers);
}
