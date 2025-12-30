import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PartnerBadges } from "@/components/PartnerBadges";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { ArrowLeft, X, Star, Building2, Check } from "lucide-react";

export default function Compare() {
  const { selectedOffers, removeOffer, clearAll } = useComparison();
  const [, setLocation] = useLocation();

  // Buscar detalhes completos das ofertas
  const offerDetails = trpc.offer.list.useQuery({ status: "PUBLISHED" });
  const partners = trpc.partner.list.useQuery();
  const reviews = trpc.review.listAll.useQuery();

  const getOfferDetails = (offerId: number) => {
    return offerDetails.data?.find(o => o.id === offerId);
  };

  const getPartnerDetails = (partnerId: number) => {
    return partners.data?.find(p => p.id === partnerId);
  };

  const getPartnerRating = (partnerId: number) => {
    const partnerReviews = reviews.data?.filter(r => r.partnerId === partnerId) || [];
    if (partnerReviews.length === 0) return 0;
    const sum = partnerReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / partnerReviews.length;
  };

  if (selectedOffers.length < 2) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Comparar Ofertas</h1>
          <p className="text-gray-600 mb-8">
            Selecione pelo menos 2 ofertas para comparar
          </p>
          <Link href="/catalog">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/catalog">
                <Button variant="ghost" size="sm" className="mb-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao Catálogo
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Comparar Ofertas</h1>
              <p className="text-gray-600 mt-1">
                Comparando {selectedOffers.length} {selectedOffers.length === 1 ? 'oferta' : 'ofertas'}
              </p>
            </div>
            <Button variant="outline" onClick={clearAll}>
              Limpar Todas
            </Button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="container py-8">
        <div className="overflow-x-auto">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedOffers.length}, minmax(300px, 1fr))` }}>
            {selectedOffers.map((offer) => {
              const details = getOfferDetails(offer.id);
              const partner = getPartnerDetails(offer.partnerId);
              const rating = getPartnerRating(offer.partnerId);
              const reviewCount = reviews.data?.filter(r => r.partnerId === offer.partnerId).length || 0;

              return (
                <Card key={offer.id} className="relative">
                  <button
                    onClick={() => removeOffer(offer.id)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors shadow-md"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <CardContent className="p-6 space-y-6">
                    {/* Imagem */}
                    {offer.imageUrl ? (
                      <div className="aspect-video bg-muted overflow-hidden rounded-lg">
                        <img
                          src={offer.imageUrl}
                          alt={offer.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-lg">
                        <Building2 className="h-16 w-16 text-primary/40" />
                      </div>
                    )}

                    {/* Título */}
                    <div>
                      <h3 className="font-bold text-lg mb-2">{offer.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {details?.description || "Sem descrição"}
                      </p>
                    </div>

                    {/* Parceiro */}
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500 mb-2">Parceiro</div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          {partner?.logoUrl ? (
                            <img 
                              src={partner.logoUrl} 
                              alt={partner.companyName}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {offer.partnerName}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            {rating > 0 ? (
                              <>
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium">{rating.toFixed(1)}</span>
                                <span className="opacity-60">({reviewCount})</span>
                              </>
                            ) : (
                              <span className="opacity-60">Sem avaliações</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Badges do Parceiro */}
                    {partner?.badges && (
                      <div className="border-t pt-4">
                        <div className="text-xs text-gray-500 mb-2">Qualificações</div>
                        <PartnerBadges badges={JSON.parse(partner.badges)} />
                      </div>
                    )}

                    {/* Tipo de Oferta */}
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500 mb-2">Tipo</div>
                      <Badge variant="secondary">
                        {offer.offerType === "SIMPLE" ? "Oferta Simples" : 
                         offer.offerType === "COMPLEX" ? "Oferta Complexa" : 
                         "Sob Consulta"}
                      </Badge>
                    </div>

                    {/* Preço */}
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500 mb-2">Preço</div>
                      <div className="text-2xl font-bold text-primary">
                        {offer.pricing}
                      </div>
                    </div>

                    {/* Features (mock - depois podemos adicionar no banco) */}
                    <div className="border-t pt-4">
                      <div className="text-xs text-gray-500 mb-3">Recursos Inclusos</div>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Suporte técnico incluído</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Atualizações gratuitas</span>
                        </li>
                        <li className="flex items-start gap-2 text-sm">
                          <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>Documentação completa</span>
                        </li>
                      </ul>
                    </div>

                    {/* Botão Ver Detalhes */}
                    <div className="border-t pt-4">
                      <Link href={`/offer/${offer.id}`}>
                        <Button className="w-full">
                          Ver Detalhes Completos
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
