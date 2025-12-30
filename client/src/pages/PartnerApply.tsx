import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { formatCNPJInput, cleanCNPJ, validateCNPJ } from "@/lib/cnpj";
import { ArrowLeft, CheckCircle } from "lucide-react";

export default function PartnerApply() {
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  const [searchingCNPJ, setSearchingCNPJ] = useState(false);
  const [cnpjFetched, setCnpjFetched] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    legalName: "",
    razaoSocial: "",
    cnae: "",
    cnaeSecundario: "",
    uf: "",
    bitrix24Url: "",
    bitrix24Webhook: "",
    bitrix24LicenseExpiry: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    institutionalVideoUrl: "",
  });

  const createPartnerMutation = trpc.partner.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Cadastro enviado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao enviar cadastro");
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.contactName || !formData.contactEmail) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    await createPartnerMutation.mutateAsync(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const fetchCNPJMutation = trpc.partner.fetchCNPJ.useQuery(
    { cnpj: cleanCNPJ(formData.cnpj) },
    { enabled: false } // Só executa quando chamarmos refetch()
  );

  const handleCNPJBlur = async () => {
    const cnpj = cleanCNPJ(formData.cnpj);
    if (cnpj.length !== 14 || cnpjFetched) return;
    
    // Validar CNPJ antes de buscar
    if (!validateCNPJ(cnpj)) {
      toast.error('CNPJ inválido. Verifique os dígitos.');
      return;
    }
    
    setSearchingCNPJ(true);
    try {
      const { data } = await fetchCNPJMutation.refetch();
      
      if (!data) {
        throw new Error('CNPJ não encontrado');
      }
      
      // Preencher campos automaticamente
      setFormData(prev => ({
        ...prev,
        razaoSocial: data.razaoSocial || '',
        cnae: data.cnae || '',
        cnaeSecundario: JSON.stringify(data.cnaesSecundarios || []),
        uf: data.uf || '',
        companyName: data.nomeFantasia || data.razaoSocial || prev.companyName,
      }));
      
      setCnpjFetched(true);
      toast.success('Dados da empresa preenchidos automaticamente!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao buscar CNPJ. Verifique se está correto.');
    } finally {
      setSearchingCNPJ(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
          </Link>
        </div>
      </header>

        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="h-16 w-16 text-green-600 mx-auto" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Cadastro Enviado com Sucesso!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Seu cadastro foi recebido e está em análise. Nossa equipe entrará em contato
              em breve para dar continuidade ao processo de onboarding.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/">Voltar para Home</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/catalog">Explorar Catálogo</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <Link href="/">
            <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>

        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Torne-se um Parceiro</h1>
            <p className="text-muted-foreground">
              Preencha o formulário abaixo para iniciar seu cadastro como parceiro do ZOPUMarket.
              Nossa equipe analisará sua solicitação e entrará em contato.
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Informações da Empresa</CardTitle>
              <CardDescription>
                Dados cadastrais da sua empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">
                    Nome da Empresa <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="Ex: Empresa LTDA"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    name="cnpj"
                    value={formData.cnpj}
                    onChange={(e) => {
                      const formatted = formatCNPJInput(e.target.value);
                      setFormData({ ...formData, cnpj: formatted });
                    }}
                    onBlur={handleCNPJBlur}
                    placeholder="00.000.000/0000-00"
                    disabled={searchingCNPJ}
                    maxLength={18}
                  />
                  {searchingCNPJ && (
                    <p className="text-sm text-muted-foreground">Buscando dados da empresa...</p>
                  )}
                </div>

                {cnpjFetched && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="razaoSocial">Razão Social</Label>
                      <Input
                        id="razaoSocial"
                        name="razaoSocial"
                        value={formData.razaoSocial}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cnae">CNAE Principal</Label>
                        <Input
                          id="cnae"
                          name="cnae"
                          value={formData.cnae}
                          disabled
                          className="bg-muted"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="uf">UF</Label>
                        <Input
                          id="uf"
                          name="uf"
                          value={formData.uf}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Contato Principal</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">
                        Nome do Contato <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contactName"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleChange}
                        placeholder="Nome completo"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">
                        E-mail <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="contactEmail"
                        name="contactEmail"
                        type="email"
                        value={formData.contactEmail}
                        onChange={handleChange}
                        placeholder="contato@empresa.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">Telefone</Label>
                      <Input
                        id="contactPhone"
                        name="contactPhone"
                        type="tel"
                        value={formData.contactPhone}
                        onChange={handleChange}
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="institutionalVideoUrl">Vídeo Institucional (YouTube)</Label>
                      <Input
                        id="institutionalVideoUrl"
                        name="institutionalVideoUrl"
                        type="url"
                        value={formData.institutionalVideoUrl}
                        onChange={handleChange}
                        placeholder="https://www.youtube.com/watch?v=..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Cole a URL do vídeo institucional da sua empresa no YouTube (opcional)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-2">Integração Bitrix24 (Opcional)</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Esses dados nos ajudam a gerenciar sua licença e integrar com seu CRM no onboarding.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bitrix24Url">URL do Bitrix24</Label>
                      <Input
                        id="bitrix24Url"
                        name="bitrix24Url"
                        type="url"
                        value={formData.bitrix24Url}
                        onChange={handleChange}
                        placeholder="https://suaempresa.bitrix24.com.br"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bitrix24Webhook">Webhook do Bitrix24</Label>
                      <Input
                        id="bitrix24Webhook"
                        name="bitrix24Webhook"
                        type="url"
                        value={formData.bitrix24Webhook}
                        onChange={handleChange}
                        placeholder="https://suaempresa.bitrix24.com.br/rest/..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Webhook para integração automática (opcional)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bitrix24LicenseExpiry">Data de Vencimento da Licença</Label>
                      <Input
                        id="bitrix24LicenseExpiry"
                        name="bitrix24LicenseExpiry"
                        type="date"
                        value={formData.bitrix24LicenseExpiry}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={createPartnerMutation.isPending}
                  >
                    {createPartnerMutation.isPending ? "Enviando..." : "Enviar Cadastro"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/")}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
