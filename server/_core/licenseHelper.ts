/**
 * Helper functions for Bitrix24 license management
 */

export type LicenseStatus = "ATIVA" | "VENCENDO" | "VENCIDA" | "NAO_INFORMADA";

/**
 * Calculate license status based on expiry date
 * - ATIVA: More than 90 days until expiry
 * - VENCENDO: 1-90 days until expiry
 * - VENCIDA: Already expired
 * - NAO_INFORMADA: No expiry date provided
 */
export function calculateLicenseStatus(expiryDate?: string | Date | null): LicenseStatus {
  if (!expiryDate) {
    return "NAO_INFORMADA";
  }

  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  const daysUntilExpiry = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry < 0) {
    return "VENCIDA";
  } else if (daysUntilExpiry <= 90) {
    return "VENCENDO";
  } else {
    return "ATIVA";
  }
}

/**
 * Get days until license expiry
 * Returns negative number if already expired
 */
export function getDaysUntilExpiry(expiryDate?: string | Date | null): number | null {
  if (!expiryDate) {
    return null;
  }

  const expiry = typeof expiryDate === "string" ? new Date(expiryDate) : expiryDate;
  const now = new Date();
  return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

/**
 * Check if license needs notification
 * Returns notification type: 90, 60, 30, 0 days before expiry
 */
export function getNotificationTrigger(expiryDate?: string | Date | null): number | null {
  const daysUntil = getDaysUntilExpiry(expiryDate);
  
  if (daysUntil === null) {
    return null;
  }

  if (daysUntil <= 0) {
    return 0; // Expired
  } else if (daysUntil <= 30) {
    return 30;
  } else if (daysUntil <= 60) {
    return 60;
  } else if (daysUntil <= 90) {
    return 90;
  }

  return null; // No notification needed
}
