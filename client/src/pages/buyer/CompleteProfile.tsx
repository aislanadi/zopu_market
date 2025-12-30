import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { formatCNPJInput, cleanCNPJ, validateCNPJ } from "@/lib/cnpj";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Building2, User, Target, Check } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";

export default function CompleteProfile() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [cnpjData, setCnpjData] = useState<any>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    cnpj: "",
    cargo: "",
    departamento: "",
    telefone: "",
    whatsapp: "",
    interessesTexto: "",
    categoriasInteresse: [] as number[],
    bitrixUrl: "",
    bitrixLicenseType: "",
    bitrixLicenseExpiry: "",
  });

  const { data: categories } = trpc.category.list.useQuery();
  const { data: existingProfile } = trpc.buyer.getProfile.useQuery();
  const utils = trpc.useUtils();
  
  const completeProfileMutation = trpc.buyer.completeProfile.useMutation();

  // Redirecionar se perfil já está completo
  useEffect(() => {
    if (existingProfile?.profileComplete) {
      setLocation("/");
    }
  }, [existingProfile, setLocation]);

  const handleCNPJSearch = async () => {
    const cnpj = cleanCNPJ(formData.cnpj);
    
    if (!cnpj || cnpj.length !== 14) {
      toast.error("CNPJ inválido. Digite 14 dígitos.");
      return;
    }
    
    if (!validateCNPJ(cnpj)) {
      toast.error("CNPJ inválido. Verifique os dígitos.");
      return;
    }

    setIsLoading(true);
    try {
      const data = await utils.buyer.searchCNPJ.fetch({ cnpj: formData.cnpj });
      setCnpjData(data);
      toast.success("Dados da empresa encontrados!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.message || "Erro ao buscar CNPJ");
    } finally {
      setIsLoading(false);
    }
  };





  const handleSubmit = async () => {
    if (!cnpjData) {
      toast.error("Busque o CNPJ primeiro");
      return;
    }

    setIsLoading(true);
    try {


      // Preparar dados para envio
      const profileData = {
        cnpj: formData.cnpj.replace(/\D/g, ""),
        razaoSocial: cnpjData.nome,
        nomeFantasia: cnpjData.fantasia,
        porte: cnpjData.porte,
        cnaePrincipal: cnpjData.atividade_principal?.[0]?.code,
        cnaePrincipalDescricao: cnpjData.atividade_principal?.[0]?.text,
        cnaesSecundarios: JSON.stringify(cnpjData.atividades_secundarias || []),
        regimeTributario: cnpjData.efr || "Não informado",
        dataAbertura: cnpjData.abertura,
        situacaoCadastral: cnpjData.situacao,
        logradouro: cnpjData.logradouro,
        numero: cnpjData.numero,
        complemento: cnpjData.complemento,
        bairro: cnpjData.bairro,
        municipio: cnpjData.municipio,
        uf: cnpjData.uf,
        cep: cnpjData.cep,
        photoUrl: photoUrl || undefined,
        cargo: formData.cargo,
        departamento: formData.departamento,
        telefone: formData.telefone,
        whatsapp: formData.whatsapp,
        interessesTexto: formData.interessesTexto,
        categoriasInteresse: JSON.stringify(formData.categoriasInteresse),
        bitrixUrl: formData.bitrixUrl || undefined,
        bitrixLicenseType: formData.bitrixLicenseType || undefined,
        bitrixLicenseExpiry: formData.bitrixLicenseExpiry || undefined,
      };

      await completeProfileMutation.mutateAsync(profileData);
      
      toast.success("Perfil completado com sucesso!");
      setLocation("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao completar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId: number) => {
    setFormData(prev => ({
      ...prev,
      categoriasInteresse: prev.categoriasInteresse.includes(categoryId)
        ? prev.categoriasInteresse.filter(id => id !== categoryId)
        : [...prev.categoriasInteresse, categoryId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Complete seu Perfil</CardTitle>
          <CardDescription>
            Precisamos de algumas informações para personalizar sua experiência
          </CardDescription>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2 mt-6">
            <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span className="text-sm font-medium">Empresa</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                {step > 2 ? <Check className="h-4 w-4" /> : "2"}
              </div>
              <span className="text-sm font-medium">Contato</span>
            </div>
            <div className="flex-1 h-0.5 bg-border" />
            <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                3
              </div>
              <span className="text-sm font-medium">Interesses</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Dados da Empresa */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Building2 className="h-5 w-5" />
                Dados da Empresa
              </div>
              
              <div>
                <Label htmlFor="cnpj">CNPJ da Empresa</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    maxLength={18}
                    disabled={!!cnpjData}
                  />
                  <Button onClick={handleCNPJSearch} disabled={isLoading || !!cnpjData}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Vamos buscar os dados da sua empresa automaticamente
                </p>
              </div>

              {cnpjData && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="razaoSocial">Razão Social</Label>
                    <Input
                      id="razaoSocial"
                      value={cnpjData.nome}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeFantasia">Nome Fantasia</Label>
                    <Input
                      id="nomeFantasia"
                      value={cnpjData.fantasia || 'Não informado'}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="porte">Porte</Label>
                      <Input
                        id="porte"
                        value={cnpjData.porte}
                        disabled
                        className="bg-muted"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uf">UF</Label>
                      <Input
                        id="uf"
                        value={cnpjData.uf}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cnaePrincipal">CNAE Principal</Label>
                    <Input
                      id="cnaePrincipal"
                      value={`${cnpjData.atividade_principal?.[0]?.code} - ${cnpjData.atividade_principal?.[0]?.text}`}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="situacao">Situação Cadastral</Label>
                    <Input
                      id="situacao"
                      value={cnpjData.situacao}
                      disabled
                      className="bg-muted"
                    />
                  </div>

                  <Button onClick={() => setStep(2)} className="w-full mt-4">
                    Continuar
                  </Button>
                </>
              )}
            </div>
          )}

          {/* Step 2: Dados do Contato */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <User className="h-5 w-5" />
                Seus Dados de Contato
              </div>

              {/* Upload de Foto */}
              <div className="flex flex-col items-center gap-4">
                <PhotoUpload
                  currentPhotoUrl={photoUrl}
                  onUploadSuccess={(url) => setPhotoUrl(url)}
                  size="lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cargo">Cargo</Label>
                  <Input
                    id="cargo"
                    placeholder="Ex: Gerente de TI"
                    value={formData.cargo}
                    onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="departamento">Departamento</Label>
                  <Input
                    id="departamento"
                    placeholder="Ex: Tecnologia"
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="telefone">Telefone</Label>
                  <Input
                    id="telefone"
                    placeholder="(00) 0000-0000"
                    value={formData.telefone}
                    onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="(00) 00000-0000"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  />
                </div>
              </div>

              {/* Licença Bitrix24 */}
              <div className="space-y-4 pt-4 border-t">
                <div className="text-sm font-semibold text-muted-foreground">
                  Informações da Licença Bitrix24 (Opcional)
                </div>
                <div>
                  <Label htmlFor="bitrixUrl">URL da Instância Bitrix24</Label>
                  <Input
                    id="bitrixUrl"
                    placeholder="Ex: minhaempresa.bitrix24.com.br"
                    value={formData.bitrixUrl}
                    onChange={(e) => setFormData({ ...formData, bitrixUrl: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bitrixLicenseType">Versão da Licença</Label>
                    <Input
                      id="bitrixLicenseType"
                      placeholder="Ex: Professional"
                      value={formData.bitrixLicenseType}
                      onChange={(e) => setFormData({ ...formData, bitrixLicenseType: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bitrixLicenseExpiry">Data de Vencimento</Label>
                    <Input
                      id="bitrixLicenseExpiry"
                      type="date"
                      value={formData.bitrixLicenseExpiry}
                      onChange={(e) => setFormData({ ...formData, bitrixLicenseExpiry: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={() => setStep(3)} className="flex-1">
                  Continuar
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Interesses */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <Target className="h-5 w-5" />
                O que você busca na plataforma?
              </div>

              <div>
                <Label htmlFor="interessesTexto">Descreva suas necessidades</Label>
                <Textarea
                  id="interessesTexto"
                  placeholder="Ex: Preciso de um CRM, automação de marketing e sistema de gestão financeira..."
                  value={formData.interessesTexto}
                  onChange={(e) => setFormData({ ...formData, interessesTexto: e.target.value })}
                  rows={4}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Categorias de Interesse</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {categories?.map((category: any) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        formData.categoriasInteresse.includes(category.id)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {category.icon && <span>{category.icon}</span>}
                        <span className="text-sm font-medium">{category.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Finalizar Cadastro
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
