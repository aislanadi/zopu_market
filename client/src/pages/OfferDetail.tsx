import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import ReviewForm from "@/components/ReviewForm";
import { ContractDeclarationModal } from "@/components/ContractDeclarationModal";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import * as Select from "@radix-ui/react-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, ShoppingCart, FileText, CheckCircle, Building2, Target, Package, MessageSquare, Star, Check, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Link, useParams, useLocation } from "wouter";
import { toast } from "sonner";

export default function OfferDetail() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [selectedBillingPeriod, setSelectedBillingPeriod] = useState<"MONTHLY" | "QUARTERLY" | "ANNUAL">("ANNUAL");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    companyName: "",
    message: "",
  });

  // Preencher automaticamente com dados do usuário logado
  const getCustomerName = () => isAuthenticated && user?.name ? user.name : formData.customerName;
  const getCustomerEmail = () => isAuthenticated && user?.email ? user.email : formData.customerEmail;
  const getCompanyName = () => {
    // Se for parceiro, pegar nome da empresa do parceiro
    // Senão, usar o que foi preenchido no formulário
    return formData.companyName;
  };

  const offerId = parseInt(id || "0");
  const isValidId = !isNaN(offerId) && offerId > 0;
  
  const { data: offer, isLoading } = trpc.offer.getById.useQuery(
    { id: offerId },
    { enabled: isValidId }
  );

  const { data: reviews = [] } = trpc.review.listByPartner.useQuery(
    { partnerId: offer?.partnerId || 0 },
    { enabled: !!offer?.partnerId && offer.partnerId > 0 }
  );

  const { data: eligibility } = trpc.contract.checkEligibility.useQuery(
    { offerId },
    { enabled: isAuthenticated && isValidId }
  );

  const trackMutation = trpc.analytics.track.useMutation();

  const createLeadMutation = trpc.leadRequest.submit.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso! O parceiro entrará em contato em breve.");
      
      // Track lead generation
      if (offer) {
        trackMutation.mutate({
          partnerId: offer.partnerId || undefined,
          offerId: offer.id,
          eventType: "lead_generated",
        });
      }
      
      setIsDialogOpen(false);
      setFormData({
        customerName: "",
        customerEmail: "",
        customerPhone: "",
        companyName: "",
        message: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar solicitação");
    },
  });

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const customerName = getCustomerName();
    const customerEmail = getCustomerEmail();
    const companyName = getCompanyName();

    if (!customerName || !customerEmail || !companyName) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    if (!offer) return;

    await createLeadMutation.mutateAsync({
      offerId: offer.id,
      clientName: customerName,
      clientEmail: customerEmail,
      clientPhone: formData.customerPhone || undefined,
      companyName: companyName,
      painPoint: formData.message || undefined,
      lgpdConsent: 1,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckout = () => {
    toast.info("Funcionalidade de checkout em desenvolvimento");
    // TODO: Implementar integração com gateway de pagamento
  };

  if (!isValidId) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">ID de oferta inválido</h1>
          <p className="text-muted-foreground mb-6">O ID fornecido não é válido.</p>
          <Button asChild>
            <Link href="/catalog">Voltar ao Catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando oferta...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link href="/">
              <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
            </Link>
          </div>
        </header>
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Oferta não encontrada</h1>
          <Button asChild>
            <Link href="/catalog">Voltar ao Catálogo</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/catalog" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Catálogo
              </Link>
              {isAuthenticated ? (
                <>
                  {user?.role === "admin" || user?.role === "gerente_contas" ? (
                    <Link href="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                      Painel Admin
                    </Link>
                  ) : null}
                  <span className="text-sm text-muted-foreground">
                    Olá, {user?.name}
                  </span>
                </>
              ) : (
                <Button asChild size="sm">
                  <Link href="/login">Entrar</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/catalog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Catálogo
          </Link>
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {offer.imageUrl && (
              <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Video */}
            {offer.videoUrl && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Vídeo de Review/Demonstração</h2>
                <YouTubeEmbed url={offer.videoUrl} title={offer.title} />
              </div>
            )}

            {/* Title and Description */}
            <div>
              <h1 className="text-3xl font-bold mb-4">{offer.title}</h1>
              <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                {offer.description}
              </p>
            </div>

            {/* ICP */}
            {offer.icp && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    <CardTitle>Perfil Ideal de Cliente (ICP)</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{offer.icp}</p>
                </CardContent>
              </Card>
            )}

            {/* Promise */}
            {offer.promessa && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <CardTitle>Promessa de Valor</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground whitespace-pre-wrap">{offer.promessa}</p>
                </CardContent>
              </Card>
            )}

            {/* Deliverables */}
            {offer.entregaveis && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-primary" />
                    <CardTitle>O que está incluído</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {(() => {
                      try {
                        const items = JSON.parse(offer.entregaveis);
                        return items.map((item: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                            <span className="text-muted-foreground">{item}</span>
                          </li>
                        ));
                      } catch {
                        return <p className="text-muted-foreground">{offer.entregaveis}</p>;
                      }
                    })()}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Cases */}
            {offer.cases && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle>Cases de Sucesso</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {(() => {
                      try {
                        const casesList = JSON.parse(offer.cases);
                        return casesList.map((caseItem: { title: string; description: string } | string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                            <div className="text-muted-foreground">
                              {typeof caseItem === 'string' ? (
                                <span>{caseItem}</span>
                              ) : (
                                <div>
                                  <div className="font-semibold text-foreground mb-1">{caseItem.title}</div>
                                  <div>{caseItem.description}</div>
                                </div>
                              )}
                            </div>
                          </li>
                        ));
                      } catch {
                        return <p className="text-muted-foreground">{offer.cases}</p>;
                      }
                    })()}
                  </ul>
                </CardContent>
              </Card>
            )}
            {isAuthenticated && offer?.partnerId && (
              <>
                {/* Botão "Eu Contratei" apenas para ofertas complexas/sob consulta */}
                {(offer.offerType === 'SERVICE_COMPLEX' || offer.saleMode === 'LEAD_FORM') && !eligibility?.canReview && !eligibility?.hasPendingContract && (
                  <Card className="border-amber-200 bg-amber-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-amber-900 mb-2">Já contratou este serviço?</h3>
                          <p className="text-sm text-amber-800 mb-4">
                            Registre sua contratação para poder avaliar este parceiro e ajudar outros clientes.
                          </p>
                          <Button
                            onClick={() => setIsContractModalOpen(true)}
                            variant="default"
                            className="bg-amber-600 hover:bg-amber-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Eu Contratei este Serviço
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Aviso de contrato pendente */}
                {eligibility?.hasPendingContract && (
                  <Card className="border-blue-200 bg-blue-50">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-blue-900 mb-2">⏳ Contrato em verificação</h3>
                          <p className="text-sm text-blue-800">
                            Sua declaração de contratação está sendo verificada pela equipe ZOPU. Você poderá avaliar assim que for aprovada.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Formulário de review - apenas se elegível */}
                {eligibility?.canReview && (
                  <ReviewForm 
                    partnerId={offer.partnerId}
                    partnerName={offer.title}
                    onSuccess={() => {
                      // Reviews will be reloaded automatically
                    }}
                  />
                )}
              </>
            )}

            {/* Avaliações do Parceiro */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <CardTitle>Avaliações do Parceiro</CardTitle>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <div key={review.id} className="border-b last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <div className="font-semibold">{review.reviewerName}</div>
                            {review.reviewerCompany && (
                              <div className="text-sm text-muted-foreground">{review.reviewerCompany}</div>
                            )}
                          </div>
                          {review.isVerified === 1 && (
                            <div className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                              <CheckCircle className="h-3 w-3" />
                              Verificado
                            </div>
                          )}
                        </div>
                        
                        {/* Estrelas */}
                        <div className="flex gap-1 mb-3">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        
                        {review.comment && (
                          <p className="text-muted-foreground">{review.comment}</p>
                        )}
                        
                        <div className="text-xs text-muted-foreground mt-2">
                          {new Date(review.createdAt).toLocaleDateString('pt-BR', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* FAQ */}
            {offer.faq && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <CardTitle>Perguntas Frequentes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(() => {
                      try {
                        const faqList = JSON.parse(offer.faq);
                        return faqList.map((item: { question: string; answer: string }, index: number) => (
                          <div key={index} className="border-b last:border-0 pb-4 last:pb-0">
                            <h4 className="font-semibold mb-2">{item.question}</h4>
                            <p className="text-muted-foreground">{item.answer}</p>
                          </div>
                        ));
                      } catch {
                        return <p className="text-muted-foreground">{offer.faq}</p>;
                      }
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Detalhes da Oferta</CardTitle>
                <CardDescription>
                  {offer.offerType === "DIGITAL" ? "Digital" : 
                   offer.offerType === "SERVICE_STANDARD" ? "Serviço Padrão" : 
                   offer.offerType === "SERVICE_COMPLEX" ? "Serviço Complexo" : "Licença"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offer.partnerId && (
                  <Link href={`/partner/${offer.partnerId}`}>
                    <Button variant="outline" className="w-full mb-4">
                      <Building2 className="mr-2 h-4 w-4" />
                      Ver Perfil do Parceiro
                    </Button>
                  </Link>
                )}
              </CardContent>
              <CardContent className="space-y-6">
                {/* Price with Billing Period & Variant Selectors */}
                {!isAuthenticated ? (
                  <div className="p-4 border border-dashed rounded-lg bg-muted/30">
                    <p className="text-sm font-medium mb-2">🔒 Preços disponíveis apenas para clientes</p>
                    <p className="text-xs text-muted-foreground mb-3">Faça login para visualizar preços e contratar soluções</p>
                    <a href={getLoginUrl()}>
                      <Button size="sm" className="w-full">Fazer Login</Button>
                    </a>
                  </div>
                ) : (() => {
                  // Parse billing periods and variants
                  const billingPeriods = offer.billingPeriods ? JSON.parse(offer.billingPeriods) : [];
                  const variants = offer.variants ? JSON.parse(offer.variants) : null;
                  const hasVariants = variants && variants.length > 0;
                  
                  // Initialize selected variant if needed
                  if (hasVariants && !selectedVariant) {
                    setSelectedVariant(variants[0]);
                  }
                  
                  // Calculate price based on selection
                  const getPrice = () => {
                    if (hasVariants && selectedVariant) {
                      if (selectedBillingPeriod === "MONTHLY") return selectedVariant.priceMonthly;
                      if (selectedBillingPeriod === "QUARTERLY") return selectedVariant.priceQuarterly;
                      return selectedVariant.priceAnnual;
                    }
                    if (selectedBillingPeriod === "MONTHLY") return offer.priceMonthly;
                    if (selectedBillingPeriod === "QUARTERLY") return offer.priceQuarterly;
                    return offer.priceAnnual || offer.price;
                  };
                  
                  const currentPrice = getPrice();
                  const showPricing = billingPeriods.length > 0 || offer.price;
                  
                  return showPricing ? (
                    <div className="space-y-4">
                      {/* Variant Selector (Enterprise only) */}
                      {hasVariants && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Número de Usuários</Label>
                          <Select.Root
                            value={selectedVariant?.name || ""}
                            onValueChange={(value) => {
                              const variant = variants.find((v: any) => v.name === value);
                              setSelectedVariant(variant);
                            }}
                          >
                            <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                              <Select.Value />
                              <Select.Icon>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="overflow-hidden bg-popover text-popover-foreground rounded-md border shadow-md z-50">
                                <Select.Viewport className="p-1">
                                  {variants.map((variant: any) => (
                                    <Select.Item
                                      key={variant.name}
                                      value={variant.name}
                                      className="relative flex cursor-pointer select-none items-center rounded-sm px-8 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                      <Select.ItemText>{variant.name} ({variant.userLimit} usuários)</Select.ItemText>
                                      <Select.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  ))}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </div>
                      )}
                      
                      {/* Billing Period Selector */}
                      {billingPeriods.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-sm text-muted-foreground">Periodicidade</Label>
                          <Select.Root
                            value={selectedBillingPeriod}
                            onValueChange={(value: any) => setSelectedBillingPeriod(value)}
                          >
                            <Select.Trigger className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                              <Select.Value />
                              <Select.Icon>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                              </Select.Icon>
                            </Select.Trigger>
                            <Select.Portal>
                              <Select.Content className="overflow-hidden bg-popover text-popover-foreground rounded-md border shadow-md z-50">
                                <Select.Viewport className="p-1">
                                  {billingPeriods.includes("MONTHLY") && (
                                    <Select.Item
                                      value="MONTHLY"
                                      className="relative flex cursor-pointer select-none items-center rounded-sm px-8 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                      <Select.ItemText>Mensal</Select.ItemText>
                                      <Select.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  )}
                                  {billingPeriods.includes("QUARTERLY") && (
                                    <Select.Item
                                      value="QUARTERLY"
                                      className="relative flex cursor-pointer select-none items-center rounded-sm px-8 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                      <Select.ItemText>Trimestral (10% desconto)</Select.ItemText>
                                      <Select.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  )}
                                  {billingPeriods.includes("ANNUAL") && (
                                    <Select.Item
                                      value="ANNUAL"
                                      className="relative flex cursor-pointer select-none items-center rounded-sm px-8 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                                    >
                                      <Select.ItemText>Anual (15% desconto)</Select.ItemText>
                                      <Select.ItemIndicator className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                        <Check className="h-4 w-4" />
                                      </Select.ItemIndicator>
                                    </Select.Item>
                                  )}
                                </Select.Viewport>
                              </Select.Content>
                            </Select.Portal>
                          </Select.Root>
                        </div>
                      )}
                      
                      {/* Price Display */}
                      {currentPrice && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Preço</p>
                          <p className="text-3xl font-bold text-primary">
                            R$ {(currentPrice / 100).toFixed(2)}
                          </p>
                          {selectedBillingPeriod === "QUARTERLY" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              R$ {((currentPrice / 3) / 100).toFixed(2)}/mês
                            </p>
                          )}
                          {selectedBillingPeriod === "ANNUAL" && (
                            <p className="text-xs text-muted-foreground mt-1">
                              R$ {((currentPrice / 12) / 100).toFixed(2)}/mês
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ) : null;
                })()}

                {/* Exclusive ZOPU */}
                {offer.exclusiveBenefitText && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-primary font-medium">
                      <CheckCircle className="h-4 w-4" />
                      Condi\u00e7\u00e3o Exclusiva ZOPU
                    </div>
                    <p className="text-sm text-muted-foreground">{offer.exclusiveBenefitText}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {offer.saleMode === "CHECKOUT" ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Comprar Agora
                    </Button>
                  ) : (
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full" size="lg">
                          <FileText className="mr-2 h-5 w-5" />
                          Solicitar Proposta
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>Solicitar Proposta</DialogTitle>
                          <DialogDescription>
                            Preencha o formulário abaixo e o parceiro entrará em contato com você.
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleLeadSubmit} className="space-y-4">
                          {isAuthenticated ? (
                            <>
                              {/* Mostrar dados do usuário logado */}
                              <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
                                <p className="text-sm text-muted-foreground">Seus dados:</p>
                                <p className="text-sm"><strong>Nome:</strong> {user?.name}</p>
                                <p className="text-sm"><strong>Email:</strong> {user?.email}</p>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="companyName">
                                  Empresa <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="companyName"
                                  name="companyName"
                                  value={formData.companyName}
                                  onChange={handleChange}
                                  placeholder="Nome da sua empresa"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customerPhone">Telefone (opcional)</Label>
                                <Input
                                  id="customerPhone"
                                  name="customerPhone"
                                  type="tel"
                                  value={formData.customerPhone}
                                  onChange={handleChange}
                                  placeholder="(00) 00000-0000"
                                />
                              </div>
                            </>
                          ) : (
                            <>
                              {/* Formulário completo para usuários não logados */}
                              <div className="space-y-2">
                                <Label htmlFor="customerName">
                                  Nome Completo <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="customerName"
                                  name="customerName"
                                  value={formData.customerName}
                                  onChange={handleChange}
                                  placeholder="Seu nome"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customerEmail">
                                  E-mail <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="customerEmail"
                                  name="customerEmail"
                                  type="email"
                                  value={formData.customerEmail}
                                  onChange={handleChange}
                                  placeholder="seu@email.com"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="customerPhone">Telefone</Label>
                                <Input
                                  id="customerPhone"
                                  name="customerPhone"
                                  type="tel"
                                  value={formData.customerPhone}
                                  onChange={handleChange}
                                  placeholder="(00) 00000-0000"
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="companyName">
                                  Empresa <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                  id="companyName"
                                  name="companyName"
                                  value={formData.companyName}
                                  onChange={handleChange}
                                  placeholder="Nome da sua empresa"
                                  required
                                />
                              </div>
                            </>
                          )}

                          <div className="space-y-2">
                            <Label htmlFor="message">Mensagem</Label>
                            <Textarea
                              id="message"
                              name="message"
                              value={formData.message}
                              onChange={handleChange}
                              placeholder="Conte-nos sobre sua necessidade..."
                              rows={4}
                            />
                          </div>

                          {/* Aceite de Termos - LGPD */}
                          <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                            <input
                              type="checkbox"
                              id="termsAccepted"
                              name="termsAccepted"
                              required
                              className="mt-1"
                            />
                            <label htmlFor="termsAccepted" className="text-sm text-muted-foreground">
                              Li e aceito os{" "}
                              <a href="/terms" target="_blank" className="text-primary hover:underline">
                                Termos de Uso
                              </a>
                              {" "}e a{" "}
                              <a href="/privacy" target="_blank" className="text-primary hover:underline">
                                Política de Privacidade
                              </a>
                              . Autorizo o compartilhamento dos meus dados com o parceiro para fins de contato comercial.
                              <span className="text-destructive ml-1">*</span>
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4">
                            <Button
                              type="submit"
                              className="flex-1"
                              disabled={createLeadMutation.isPending}
                            >
                              {createLeadMutation.isPending ? "Enviando..." : "Enviar Solicitação"}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsDialogOpen(false)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}

                  <Button
                    variant="outline"
                    className="w-full"
                    asChild
                  >
                    <Link href="/catalog">Ver Mais Ofertas</Link>
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="pt-4 border-t space-y-2 text-sm text-muted-foreground">
                  <p>• Atendimento especializado</p>
                  <p>• Suporte do parceiro</p>
                  <p>• Curadoria ZOPU</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Declaração de Contrato */}
      {offer && offer.partnerId && (
        <ContractDeclarationModal
          open={isContractModalOpen}
          onOpenChange={setIsContractModalOpen}
          offerId={offer.id}
          partnerId={offer.partnerId}
          onSuccess={() => {
            // Recarregar eligibility
            window.location.reload();
          }}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2024 ZOPUMarket. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
