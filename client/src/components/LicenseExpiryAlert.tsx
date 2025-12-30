import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, XCircle, Calendar } from "lucide-react";
import { Link } from "wouter";

interface LicenseExpiryAlertProps {
  licenseType?: string;
  expiryDate?: Date;
  daysUntilExpiry?: number;
  licenseStatus?: string;
}

export function LicenseExpiryAlert({
  licenseType = "Bitrix24",
  expiryDate,
  daysUntilExpiry,
  licenseStatus,
}: LicenseExpiryAlertProps) {
  // Não mostrar alerta se não houver data de vencimento ou se a licença está ativa (mais de 90 dias)
  if (!expiryDate || licenseStatus === "ATIVA" || licenseStatus === "NAO_INFORMADA") {
    return null;
  }

  const isExpired = licenseStatus === "VENCIDA";
  const isExpiring = licenseStatus === "VENCENDO";

  if (!isExpired && !isExpiring) {
    return null;
  }

  const getAlertVariant = () => {
    if (isExpired) return "destructive";
    if (daysUntilExpiry !== undefined && daysUntilExpiry <= 30) return "destructive";
    return "default";
  };

  const getIcon = () => {
    if (isExpired) return <XCircle className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  };

  const getTitle = () => {
    if (isExpired) return "⚠️ Sua licença Bitrix24 está vencida!";
    if (daysUntilExpiry !== undefined && daysUntilExpiry <= 30) {
      return `🚨 Sua licença ${licenseType} vence em ${daysUntilExpiry} ${daysUntilExpiry === 1 ? "dia" : "dias"}!`;
    }
    return `⏰ Sua licença ${licenseType} está vencendo`;
  };

  const getDescription = () => {
    if (isExpired) {
      return `Sua licença ${licenseType} venceu em ${expiryDate.toLocaleDateString("pt-BR")}. Renove agora para continuar utilizando todos os recursos da plataforma sem interrupções.`;
    }
    
    if (daysUntilExpiry !== undefined) {
      if (daysUntilExpiry <= 30) {
        return `Sua licença ${licenseType} vence em ${expiryDate.toLocaleDateString("pt-BR")}. Não perca acesso aos seus dados e processos - renove agora com condições especiais!`;
      }
      return `Sua licença ${licenseType} vence em ${expiryDate.toLocaleDateString("pt-BR")} (${daysUntilExpiry} dias). Garanta a continuidade do seu negócio renovando antecipadamente.`;
    }
    
    return `Sua licença ${licenseType} está próxima do vencimento. Renove agora para evitar interrupções.`;
  };

  const alertVariant = getAlertVariant();
  const bgColor = alertVariant === "destructive" 
    ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800" 
    : "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800";

  return (
    <Alert className={`${bgColor} mb-6`} variant={alertVariant}>
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="flex-1">
          <AlertTitle className="text-lg font-bold mb-2">
            {getTitle()}
          </AlertTitle>
          <AlertDescription className="text-sm mb-4">
            {getDescription()}
          </AlertDescription>
          <div className="flex flex-wrap gap-3 items-center">
            <Button asChild size="default" className="font-semibold">
              <Link href="/catalog?partner=1&category=1">
                <Calendar className="mr-2 h-4 w-4" />
                Renovar Licença Agora
              </Link>
            </Button>
            {expiryDate && (
              <span className="text-sm text-muted-foreground">
                Vencimento: {expiryDate.toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}
