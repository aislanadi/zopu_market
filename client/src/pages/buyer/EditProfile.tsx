import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PhotoUpload } from "@/components/PhotoUpload";

export default function BuyerEditProfile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  // Toast já importado do sonner

  const { data: profile, isLoading: profileLoading } = trpc.buyer.getProfile.useQuery();
  const updateMutation = trpc.buyer.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("Perfil atualizado!", {
        description: "Suas informações foram atualizadas com sucesso.",
      });
      setLocation("/buyer/dashboard");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar perfil", {
        description: error.message,
      });
    },
  });

  const [formData, setFormData] = useState({
    // Dados pessoais
    contactName: "",
    position: "",
    email: "",
    phone: "",
    department: "",
    
    // Dados da empresa
    cnpj: "",
    companyName: "",
    tradeName: "",
    
    // Licença Bitrix24
    bitrixUrl: "",
    bitrixLicenseType: "",
    bitrixLicenseExpiry: "",
    
    // Interesses
    interests: "",
    categories: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        contactName: user?.name || "",
        position: profile.cargo || "",
        email: user?.email || "",
        phone: profile.telefone || "",
        department: profile.departamento || "",
        cnpj: profile.cnpj || "",
        companyName: profile.razaoSocial || "",
        tradeName: profile.nomeFantasia || "",
        bitrixUrl: profile.bitrixUrl || "",
        bitrixLicenseType: profile.bitrixLicenseType || "",
        bitrixLicenseExpiry: profile.bitrixLicenseExpiry 
          ? new Date(profile.bitrixLicenseExpiry).toISOString().split('T')[0]
          : "",
        interests: profile.interessesTexto || "",
        categories: profile.categoriasInteresse ? JSON.parse(profile.categoriasInteresse) : [],
      });
    }
  }, [profile]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    updateMutation.mutate({
      ...formData,
      bitrixLicenseExpiry: formData.bitrixLicenseExpiry || undefined,
    });
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Perfil não encontrado</CardTitle>
            <CardDescription>
              Complete seu cadastro primeiro para poder editar seu perfil.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/buyer/complete-profile")} className="w-full">
              Completar Cadastro
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/buyer/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Editar Perfil</h1>
              <p className="text-muted-foreground mt-1">
                Atualize suas informações pessoais e da empresa
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container py-8">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
          {/* Dados Pessoais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais</CardTitle>
              <CardDescription>
                Informações de contato principal
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Upload de Foto */}
              <div className="flex justify-center py-4">
                <PhotoUpload
                  currentPhotoUrl={profile?.photoUrl}
                  onUploadSuccess={(url) => {
                    toast.success("Foto atualizada!");
                  }}
                  size="lg"
                />
              </div>
              
              <div className="border-t pt-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactName">Nome Completo</Label>
                  <Input
                    id="contactName"
                    value={formData.contactName}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Nome do usuário OAuth (não editável)
                  </p>
                </div>
                <div>
                  <Label htmlFor="position">Cargo *</Label>
                  <Input
                    id="position"
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Corporativo</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email do usuário OAuth (não editável)
                  </p>
                </div>
                <div>
                  <Label htmlFor="phone">Telefone/WhatsApp *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Ex: TI, Comercial, Financeiro"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dados da Empresa */}
          <Card>
            <CardHeader>
              <CardTitle>Dados da Empresa</CardTitle>
              <CardDescription>
                Informações cadastrais (CNPJ não pode ser alterado)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  value={formData.cnpj}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  O CNPJ não pode ser alterado após o cadastro
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="companyName">Razão Social</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    disabled
                    className="bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="tradeName">Nome Fantasia</Label>
                  <Input
                    id="tradeName"
                    value={formData.tradeName}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Licença Bitrix24 */}
          <Card>
            <CardHeader>
              <CardTitle>Licença Bitrix24</CardTitle>
              <CardDescription>
                Informações sobre sua licença Bitrix24
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bitrixUrl">URL da Instância Bitrix24</Label>
                  <Input
                    id="bitrixUrl"
                    value={formData.bitrixUrl}
                    onChange={(e) => setFormData({ ...formData, bitrixUrl: e.target.value })}
                    placeholder="empresa.bitrix24.com.br"
                  />
                </div>
                <div>
                  <Label htmlFor="bitrixLicenseType">Versão da Licença</Label>
                  <Input
                    id="bitrixLicenseType"
                    value={formData.bitrixLicenseType}
                    onChange={(e) => setFormData({ ...formData, bitrixLicenseType: e.target.value })}
                    placeholder="Professional, Enterprise, etc."
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="bitrixLicenseExpiry">Data de Vencimento da Licença</Label>
                <Input
                  id="bitrixLicenseExpiry"
                  type="date"
                  value={formData.bitrixLicenseExpiry}
                  onChange={(e) => setFormData({ ...formData, bitrixLicenseExpiry: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Interesses */}
          <Card>
            <CardHeader>
              <CardTitle>Interesses na Plataforma</CardTitle>
              <CardDescription>
                O que você busca no marketplace?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Label htmlFor="interests">Descreva suas necessidades</Label>
              <Textarea
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="Ex: Preciso de CRM, automação de marketing e ERP"
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/buyer/dashboard")}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex-1"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
