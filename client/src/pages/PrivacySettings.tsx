import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Download, Trash2, Cookie, Eye, EyeOff } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const COOKIE_CONSENT_KEY = "zopu_cookie_consent";

export default function PrivacySettings() {
  const { user, isAuthenticated } = useAuth();
  const [cookiePrefs, setCookiePrefs] = useState({
    necessary: true,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Carregar preferências salvas
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCookiePrefs({
          necessary: true,
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false,
        });
      } catch (e) {
        console.error("Erro ao carregar preferências");
      }
    }
  }, []);

  const saveCookiePreferences = () => {
    const toSave = {
      ...cookiePrefs,
      version: "1.0",
      timestamp: Date.now(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(toSave));
    toast.success("Preferências de cookies atualizadas!");
  };

  const exportUserData = () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para exportar seus dados");
      return;
    }

    // Simular exportação de dados
    const userData = {
      user: {
        id: user?.id,
        name: user?.name,
        email: user?.email,
        role: user?.role,
      },
      exportDate: new Date().toISOString(),
      notice: "Esta é uma exportação simulada. Em produção, incluiria todos os dados pessoais armazenados.",
    };

    const blob = new Blob([JSON.stringify(userData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `meus-dados-zopu-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Dados exportados com sucesso!");
  };

  const requestDataDeletion = () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para solicitar exclusão de dados");
      return;
    }

    // Em produção, isso criaria uma solicitação de exclusão
    if (confirm("Tem certeza que deseja solicitar a exclusão de todos os seus dados? Esta ação é irreversível.")) {
      toast.success("Solicitação de exclusão registrada. Nossa equipe entrará em contato em até 30 dias.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src="/logo-zopu.png" alt="ZOPU" className="h-8" />
              <span className="font-bold text-xl">market</span>
            </div>
          </Link>
          {isAuthenticated && (
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Olá, {user?.name}</span>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo */}
      <div className="container py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Título */}
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Shield className="h-8 w-8 text-primary" />
              Configurações de Privacidade
            </h1>
            <p className="text-muted-foreground">
              Gerencie suas preferências de privacidade e dados pessoais de acordo com a LGPD
            </p>
          </div>

          {/* Preferências de Cookies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cookie className="h-5 w-5" />
                Preferências de Cookies
              </CardTitle>
              <CardDescription>
                Escolha quais cookies você permite que sejam armazenados no seu navegador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Necessários */}
              <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Cookies Necessários</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Essenciais para o funcionamento do site. Não podem ser desabilitados.
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={cookiePrefs.analytics}
                  onChange={(e) =>
                    setCookiePrefs({ ...cookiePrefs, analytics: e.target.checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Cookies de Análise</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Nos ajudam a entender como você usa o site. Dados anônimos e agregados.
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <input
                  type="checkbox"
                  checked={cookiePrefs.marketing}
                  onChange={(e) =>
                    setCookiePrefs({ ...cookiePrefs, marketing: e.target.checked })
                  }
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium">Cookies de Marketing</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Usados para personalizar anúncios e medir eficácia de campanhas.
                  </p>
                </div>
              </div>

              <Button onClick={saveCookiePreferences} className="w-full">
                Salvar Preferências de Cookies
              </Button>
            </CardContent>
          </Card>

          {/* Direitos LGPD */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Seus Direitos (LGPD)
              </CardTitle>
              <CardDescription>
                De acordo com a Lei Geral de Proteção de Dados, você tem os seguintes direitos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Exportar Dados */}
              <div className="flex items-start justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Exportar Meus Dados
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Baixe uma cópia de todos os seus dados pessoais armazenados em nosso sistema
                  </p>
                </div>
                <Button
                  onClick={exportUserData}
                  variant="outline"
                  disabled={!isAuthenticated}
                >
                  Exportar
                </Button>
              </div>

              {/* Solicitar Exclusão */}
              <div className="flex items-start justify-between gap-4 p-4 border rounded-lg border-destructive/50">
                <div className="flex-1">
                  <div className="font-medium flex items-center gap-2 text-destructive">
                    <Trash2 className="h-4 w-4" />
                    Solicitar Exclusão de Dados
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Solicite a exclusão permanente de todos os seus dados pessoais. Esta ação é irreversível.
                  </p>
                </div>
                <Button
                  onClick={requestDataDeletion}
                  variant="destructive"
                  disabled={!isAuthenticated}
                >
                  Solicitar
                </Button>
              </div>

              {!isAuthenticated && (
                <div className="p-4 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  Você precisa estar logado para exercer seus direitos de exportação e exclusão de dados.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Links Úteis */}
          <Card>
            <CardHeader>
              <CardTitle>Documentos e Políticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/privacy">
                <Button variant="link" className="p-0 h-auto">
                  Política de Privacidade
                </Button>
              </Link>
              <br />
              <Link href="/terms">
                <Button variant="link" className="p-0 h-auto">
                  Termos de Uso
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
