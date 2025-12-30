import { useState, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Upload, X, Save } from "lucide-react";
import { Link, useLocation } from "wouter";
import { formatCNPJInput } from "@/lib/cnpj";

export default function EditPartnerProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    companyName: "",
    cnpj: "",
    legalName: "",
    razaoSocial: "",
    cnae: "",
    cnaeSecundario: "",
    uf: "",
    description: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    institutionalVideoUrl: "",
    bitrix24Url: "",
    bitrix24Webhook: "",
    bitrix24LicenseExpiry: "",
  });

  // Buscar dados do parceiro
  const { data: partner, isLoading } = trpc.partner.getById.useQuery(
    { id: user?.partnerId || 0 },
    { enabled: !!user?.partnerId }
  );

  // Carregar dados do parceiro no formulário
  useEffect(() => {
    if (partner) {
      setFormData({
        companyName: partner.companyName || "",
        cnpj: partner.cnpj || "",
        legalName: partner.legalName || "",
        razaoSocial: partner.razaoSocial || "",
        cnae: partner.cnae || "",
        cnaeSecundario: partner.cnaeSecundario || "",
        uf: partner.uf || "",
        description: partner.description || "",
        contactName: partner.contactName || "",
        contactEmail: partner.contactEmail || "",
        contactPhone: partner.contactPhone || "",
        institutionalVideoUrl: partner.institutionalVideoUrl || "",
        bitrix24Url: partner.bitrix24Url || "",
        bitrix24Webhook: partner.bitrix24Webhook || "",
        bitrix24LicenseExpiry: partner.bitrix24LicenseExpiry ? new Date(partner.bitrix24LicenseExpiry).toISOString().split('T')[0] : "",
      });
      if (partner.logoUrl) {
        setLogoPreview(partner.logoUrl);
      }
    }
  }, [partner]);

  const updateProfileMutation = trpc.partner.updateSelfProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado com sucesso!");
      setLocation("/partner/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar perfil");
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogoToS3 = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Erro ao fazer upload do logo");
    }

    const data = await response.json();
    return data.url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.partnerId) {
      toast.error("Usuário não está associado a um parceiro");
      return;
    }

    try {
      setIsUploading(true);
      let logoUrl = logoPreview;

      if (logoFile) {
        logoUrl = await uploadLogoToS3(logoFile);
      }

      await updateProfileMutation.mutateAsync({
        companyName: formData.companyName,
        cnpj: formData.cnpj || undefined,
        legalName: formData.legalName || undefined,
        razaoSocial: formData.razaoSocial || undefined,
        cnae: formData.cnae || undefined,
        cnaeSecundario: formData.cnaeSecundario || undefined,
        uf: formData.uf || undefined,
        description: formData.description || undefined,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone || undefined,
        institutionalVideoUrl: formData.institutionalVideoUrl || undefined,
        logoUrl: logoUrl || undefined,
        bitrix24Url: formData.bitrix24Url || undefined,
        bitrix24Webhook: formData.bitrix24Webhook || undefined,
        bitrix24LicenseExpiry: formData.bitrix24LicenseExpiry || undefined,
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Perfil do parceiro não encontrado</p>
              <Link href="/partner/dashboard">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container py-4">
          <Link href="/">
            <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
          </Link>
        </div>
      </header>

      <div className="container py-8">
        <Link href="/partner/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </Link>

        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Editar Perfil da Empresa</CardTitle>
              <CardDescription>
                Atualize as informações do seu perfil no marketplace
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Logo da Empresa</Label>
                  {logoPreview && (
                    <div className="relative w-32 h-32 border rounded-lg overflow-hidden bg-white">
                      <img
                        src={logoPreview}
                        alt="Preview"
                        className="w-full h-full object-contain p-2"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG ou SVG (recomendado: 200x200px, fundo transparente)
                    </p>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="companyName">
                      Nome da Empresa <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="companyName"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      placeholder="Nome fantasia da empresa"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cnpj">CNPJ</Label>
                      <Input
                        id="cnpj"
                        value={formData.cnpj}
                        onChange={(e) => {
                          const formatted = formatCNPJInput(e.target.value);
                          setFormData({ ...formData, cnpj: formatted });
                        }}
                        placeholder="00.000.000/0000-00"
                        maxLength={18}
                      />
                    </div>
                    <div>
                      <Label htmlFor="legalName">Razão Social</Label>
                      <Input
                        id="legalName"
                        value={formData.legalName}
                        onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                        placeholder="Razão social completa"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição da Empresa</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Conte sobre sua empresa, expertise e diferenciais..."
                      rows={4}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Esta descrição aparecerá no seu perfil público
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="institutionalVideoUrl">Vídeo Institucional (YouTube)</Label>
                    <Input
                      id="institutionalVideoUrl"
                      type="url"
                      value={formData.institutionalVideoUrl}
                      onChange={(e) => setFormData({ ...formData, institutionalVideoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Adicione um vídeo apresentando sua empresa (opcional)
                    </p>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Dados da Receita Federal</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Campos preenchidos automaticamente pela busca de CNPJ
                    </p>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="razaoSocial">Razão Social</Label>
                          <Input
                            id="razaoSocial"
                            value={formData.razaoSocial}
                            disabled
                            className="bg-muted"
                            placeholder="Preenchido automaticamente"
                          />
                        </div>
                        <div>
                          <Label htmlFor="uf">UF</Label>
                          <Input
                            id="uf"
                            value={formData.uf}
                            disabled
                            className="bg-muted"
                            placeholder="--"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="cnae">CNAE Principal</Label>
                          <Input
                            id="cnae"
                            value={formData.cnae}
                            disabled
                            className="bg-muted"
                            placeholder="Preenchido automaticamente"
                          />
                        </div>
                        <div>
                          <Label htmlFor="cnaeSecundario">CNAE Secundário</Label>
                          <Input
                            id="cnaeSecundario"
                            value={formData.cnaeSecundario ? JSON.parse(formData.cnaeSecundario).length + ' CNAEs' : 'Nenhum'}
                            disabled
                            className="bg-muted"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Integração Bitrix24 (Opcional)</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Campos privados para integração com Bitrix24
                    </p>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="bitrix24Url">URL do Bitrix24</Label>
                        <Input
                          id="bitrix24Url"
                          value={formData.bitrix24Url}
                          onChange={(e) => setFormData({ ...formData, bitrix24Url: e.target.value })}
                          placeholder="minhaempresa.bitrix24.com.br"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bitrix24Webhook">Webhook do Bitrix24</Label>
                        <Input
                          id="bitrix24Webhook"
                          value={formData.bitrix24Webhook}
                          onChange={(e) => setFormData({ ...formData, bitrix24Webhook: e.target.value })}
                          placeholder="https://minhaempresa.bitrix24.com.br/rest/..."
                        />
                      </div>

                      <div>
                        <Label htmlFor="bitrix24LicenseExpiry">Data de Vencimento da Licença</Label>
                        <Input
                          id="bitrix24LicenseExpiry"
                          type="date"
                          value={formData.bitrix24LicenseExpiry}
                          onChange={(e) => setFormData({ ...formData, bitrix24LicenseExpiry: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Informações de Contato</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="contactName">
                          Nome do Contato Principal <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="contactName"
                          value={formData.contactName}
                          onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                          placeholder="Nome completo"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="contactEmail">
                            Email <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id="contactEmail"
                            type="email"
                            value={formData.contactEmail}
                            onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                            placeholder="contato@empresa.com"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="contactPhone">Telefone</Label>
                          <Input
                            id="contactPhone"
                            type="tel"
                            value={formData.contactPhone}
                            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                            placeholder="(00) 00000-0000"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={isUploading || updateProfileMutation.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isUploading || updateProfileMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/partner/dashboard")}
                    disabled={isUploading || updateProfileMutation.isPending}
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
