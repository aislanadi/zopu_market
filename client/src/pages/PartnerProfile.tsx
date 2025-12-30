import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { YouTubeEmbed } from "@/components/YouTubeEmbed";
import { PartnerBadges } from "@/components/PartnerBadges";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Star, Mail, Phone, Building2, CheckCircle, Package, MapPin } from "lucide-react";
import { Link, useParams } from "wouter";
import { useEffect } from "react";

export default function PartnerProfile() {
  const { id } = useParams<{ id: string }>();
  const partnerId = parseInt(id || "0");
  const isValidId = !isNaN(partnerId) && partnerId > 0;

  const { data, isLoading } = trpc.partner.getPublicProfile.useQuery(
    { id: partnerId },
    { enabled: isValidId }
  );

  const { data: cases } = trpc.partnerCase.listByPartner.useQuery(
    { partnerId },
    { enabled: isValidId }
  );

  // Tracking de visualização de perfil
  const trackMutation = trpc.analytics.track.useMutation();

  useEffect(() => {
    if (isValidId && partnerId) {
      trackMutation.mutate({
        partnerId,
        eventType: "profile_view",
      });
    }
  }, [partnerId, isValidId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container py-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Parceiro não encontrado</p>
              <Link href="/catalog">
                <Button variant="outline" className="mt-4">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Catálogo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const { partner, offers, reviews, stats } = data;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/catalog" className="text-sm hover:text-primary transition-colors">
                Catálogo
              </Link>
              <Link href="/admin" className="text-sm hover:text-primary transition-colors">
                Painel Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="container py-8">
        <Link href="/catalog">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Catálogo
          </Button>
        </Link>

        {/* Partner Header */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                {partner.logoUrl ? (
                  <img 
                    src={partner.logoUrl} 
                    alt={partner.companyName}
                    className="w-32 h-32 object-contain rounded-lg border"
                  />
                ) : (
                  <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center">
                    <Building2 className="w-16 h-16 text-primary/40" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold">{partner.companyName}</h1>
                      {partner.tier === "PREMIUM" && (
                        <Badge className="text-sm px-3 py-1 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                          ⭐ Premium
                        </Badge>
                      )}
                    </div>
                    {partner.legalName && partner.legalName !== partner.companyName && (
                      <p className="text-muted-foreground">{partner.legalName}</p>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <PartnerBadges badges={partner.badges} className="mb-4" />

                {/* Stats */}
                <div className="flex flex-wrap gap-6 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold">{stats.avgRating.toFixed(1)}</span>
                    <span className="text-muted-foreground text-sm">
                      ({stats.totalReviews} {stats.totalReviews === 1 ? 'avaliação' : 'avaliações'})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    <span className="font-semibold">{stats.totalOffers}</span>
                    <span className="text-muted-foreground text-sm">
                      {stats.totalOffers === 1 ? 'oferta' : 'ofertas'}
                    </span>
                  </div>
                </div>

                {/* Description */}
                {partner.description && (
                  <p className="text-muted-foreground mb-4">{partner.description}</p>
                )}

                {/* Contact Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  {partner.contactEmail && (
                    <a 
                      href={`mailto:${partner.contactEmail}`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Mail className="w-4 h-4" />
                      {partner.contactEmail}
                    </a>
                  )}
                  {partner.contactPhone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="w-4 h-4" />
                      {partner.contactPhone}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Institutional Video */}
            {partner.institutionalVideoUrl && (
              <Card>
                <CardHeader>
                  <CardTitle>Vídeo Institucional</CardTitle>
                  <CardDescription>
                    Conheça mais sobre {partner.companyName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <YouTubeEmbed url={partner.institutionalVideoUrl} title={`Vídeo institucional - ${partner.companyName}`} />
                </CardContent>
              </Card>
            )}
            {/* Offers */}
            <Card>
              <CardHeader>
                <CardTitle>Ofertas do Parceiro</CardTitle>
                <CardDescription>
                  {offers.length} {offers.length === 1 ? 'oferta disponível' : 'ofertas disponíveis'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {offers.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhuma oferta disponível no momento
                  </p>
                ) : (
                  <div className="grid gap-4">
                    {offers.map((offer) => (
                      <Link key={offer.id} href={`/offer/${offer.id}`}>
                        <Card className="hover:shadow-md transition-shadow cursor-pointer">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                <h3 className="font-semibold mb-2">{offer.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {offer.description}
                                </p>
                              </div>
                              {offer.price && (
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">A partir de</p>
                                  <p className="text-xl font-bold text-primary">
                                    R$ {(offer.price / 100).toFixed(2)}
                                  </p>
                                </div>
                              )}
                              {!offer.price && (
                                <Badge variant="outline">Sob consulta</Badge>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cases de Sucesso */}
            {cases && cases.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Cases de Sucesso</CardTitle>
                  <CardDescription>
                    Projetos realizados e depoimentos de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    {cases.map((caseItem: any) => (
                      <Card key={caseItem.id} className="overflow-hidden">
                        {caseItem.imageUrl && (
                          <div className="aspect-video bg-muted">
                            <img
                              src={caseItem.imageUrl}
                              alt={caseItem.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <CardContent className="p-6">
                          <h3 className="text-lg font-semibold mb-2">{caseItem.title}</h3>
                          <div className="text-sm text-muted-foreground mb-3">
                            <span className="font-medium">{caseItem.clientName}</span>
                            {caseItem.clientCompany && (
                              <span> • {caseItem.clientCompany}</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            {caseItem.description}
                          </p>
                          {caseItem.results && (
                            <div className="mb-4">
                              <p className="text-sm font-medium mb-1">Resultados:</p>
                              <p className="text-sm text-muted-foreground">{caseItem.results}</p>
                            </div>
                          )}
                          {caseItem.testimonial && (
                            <div className="border-l-4 border-primary pl-4 py-2 bg-muted/30 rounded-r">
                              <p className="text-sm italic text-muted-foreground">
                                "{caseItem.testimonial}"
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Reviews */}
            {reviews.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-primary" />
                      <CardTitle>Avaliações</CardTitle>
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
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Sobre o Parceiro</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {partner.cnpj && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">CNPJ</p>
                    <p className="font-medium">{partner.cnpj}</p>
                  </div>
                )}
                
                {partner.contactName && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Contato</p>
                    <p className="font-medium">{partner.contactName}</p>
                  </div>
                )}
                
                {(partner.city || partner.state) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      Localização
                    </p>
                    <p className="font-medium">
                      {partner.city}{partner.city && partner.state && ', '}{partner.state}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">Estatísticas</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Rating médio</span>
                      <span className="font-semibold">{stats.avgRating.toFixed(1)} ⭐</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Total de avaliações</span>
                      <span className="font-semibold">{stats.totalReviews}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ofertas ativas</span>
                      <span className="font-semibold">{stats.totalOffers}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground">
                    • Atendimento especializado<br/>
                    • Suporte do parceiro<br/>
                    • Curadoria ZOPU
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
