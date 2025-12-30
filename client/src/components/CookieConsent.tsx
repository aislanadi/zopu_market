import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Cookie, Settings } from "lucide-react";
import { Link } from "wouter";

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
}

const COOKIE_CONSENT_KEY = "zopu_cookie_consent";
const CONSENT_VERSION = "1.0";

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Sempre true, não pode ser desabilitado
    analytics: false,
    marketing: false,
    timestamp: Date.now(),
  });

  useEffect(() => {
    // Verificar se já existe consentimento salvo
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!saved) {
      // Aguardar 1 segundo antes de mostrar o banner para não ser intrusivo
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      try {
        const parsed = JSON.parse(saved);
        // Verificar se a versão do consentimento mudou
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true);
        }
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const toSave = {
      ...prefs,
      version: CONSENT_VERSION,
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(toSave));
    setShowBanner(false);

    // Aplicar preferências (integração com analytics, etc)
    if (prefs.analytics) {
      // Habilitar analytics (Google Analytics, Plausible, etc)
      console.log("Analytics habilitado");
    }
    if (prefs.marketing) {
      // Habilitar marketing (Facebook Pixel, etc)
      console.log("Marketing habilitado");
    }
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: Date.now(),
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: Date.now(),
    });
  };

  const saveCustom = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <Card className="w-full max-w-2xl pointer-events-auto shadow-2xl border-2">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Cookie className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">
                Cookies e Privacidade
              </h3>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Conteúdo */}
          {!showDetails ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Usamos cookies para melhorar sua experiência, analisar o tráfego do site e personalizar conteúdo. 
                Você pode escolher quais cookies aceitar. Cookies necessários são sempre habilitados para o funcionamento do site.
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                Ao continuar navegando, você concorda com nossa{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>
                {" "}e{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Termos de Uso
                </Link>
                .
              </p>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={acceptAll}
                  className="flex-1"
                >
                  Aceitar Todos
                </Button>
                <Button
                  onClick={acceptNecessary}
                  variant="outline"
                  className="flex-1"
                >
                  Apenas Necessários
                </Button>
                <Button
                  onClick={() => setShowDetails(true)}
                  variant="ghost"
                  className="flex-1"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Escolha quais tipos de cookies você deseja aceitar:
              </p>

              {/* Opções de cookies */}
              <div className="space-y-4 mb-6">
                {/* Necessários */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Cookies Necessários</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Essenciais para o funcionamento do site. Incluem autenticação, segurança e preferências básicas.
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) =>
                      setPreferences({ ...preferences, analytics: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Cookies de Análise</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Nos ajudam a entender como você usa o site para melhorar a experiência. Dados anônimos e agregados.
                    </p>
                  </div>
                </div>

                {/* Marketing */}
                <div className="flex items-start gap-3 p-3 border rounded-lg">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) =>
                      setPreferences({ ...preferences, marketing: e.target.checked })
                    }
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">Cookies de Marketing</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Usados para personalizar anúncios e medir a eficácia de campanhas publicitárias.
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={saveCustom}
                  className="flex-1"
                >
                  Salvar Preferências
                </Button>
                <Button
                  onClick={() => setShowDetails(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Voltar
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>
    </div>
  );
}

// Hook para verificar se o usuário deu consentimento
export function useCookieConsent() {
  const [consent, setConsent] = useState<CookiePreferences | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConsent(parsed);
      } catch (e) {
        setConsent(null);
      }
    }
  }, []);

  return consent;
}
