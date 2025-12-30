import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Heart, ArrowLeft, Building2, Star, ArrowRight } from "lucide-react";

export default function Favorites() {
  const { user, isAuthenticated } = useAuth();
  
  const { data: favorites, isLoading } = trpc.favorite.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: offers } = trpc.offer.list.useQuery({ status: "PUBLISHED" });
  const { data: partners } = trpc.partner.list.useQuery();
  const { data: allReviews } = trpc.review.listAll.useQuery();
  
  // Separar favoritos por tipo
  const favoriteOffers = favorites?.filter(f => f.type === "offer") || [];
  const favoritePartners = favorites?.filter(f => f.type === "partner") || [];
  
  // Helper para pegar oferta pelo ID
  const getOfferById = (id: number | null) => {
    if (!id) return null;
    return offers?.find(o => o.id === id);
  };
  
  // Helper para pegar parceiro pelo ID
  const getPartnerById = (id: number | null) => {
    if (!id) return null;
    return partners?.find(p => p.id === id);
  };
  
  // Calcular rating de um parceiro
  const getPartnerRating = (partnerId: number | null): number => {
    if (!partnerId || !allReviews) return 0;
    const partnerReviews = allReviews.filter(r => r.partnerId === partnerId);
    if (partnerReviews.length === 0) return 0;
    const sum = partnerReviews.reduce((acc, r) => acc + r.rating, 0);
    return sum / partnerReviews.length;
  };
  
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-20">
          <div className="max-w-md mx-auto text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Faça login para ver seus favoritos</h1>
            <p className="text-muted-foreground mb-6">
              Salve suas ofertas e parceiros favoritos para acessá-los facilmente depois.
            </p>
            <Button asChild>
              <a href="/api/oauth/login">Fazer Login</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/catalog">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Catálogo
              </Button>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <div>
              <h1 className="text-3xl font-bold">Meus Favoritos</h1>
              <p className="text-muted-foreground">
                {favoriteOffers.length + favoritePartners.length} itens salvos
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container py-8">
        {/* Ofertas Favoritas */}
        {favoriteOffers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Ofertas Favoritas ({favoriteOffers.length})</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favoriteOffers.map((fav) => {
                const offer = getOfferById(fav.offerId);
                if (!offer) return null;
                
                const partner = getPartnerById(offer.partnerId);
                const rating = getPartnerRating(offer.partnerId);
                
                return (
                  <div key={fav.id} className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      <FavoriteButton offerId={offer.id} type="offer" />
                    </div>
                    <Link href={`/offer/${offer.id}`}>
                      <Card className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50 h-full flex flex-col">
                        {/* Imagem */}
                        {offer.imageUrl ? (
                          <div className="aspect-video bg-muted overflow-hidden rounded-t-lg">
                            <img
                              src={offer.imageUrl}
                              alt={offer.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center rounded-t-lg">
                            <Building2 className="h-16 w-16 text-primary/40" />
                          </div>
                        )}
                        
                        <CardContent className="p-5 flex-1 flex flex-col">
                          {/* Info do Parceiro */}
                          {partner && (
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                {partner.logoUrl ? (
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
                                  {partner.companyName}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  {rating > 0 ? (
                                    <>
                                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                      <span className="font-medium">{rating.toFixed(1)}</span>
                                      <span className="opacity-60">({allReviews?.filter(r => r.partnerId === offer.partnerId).length || 0})</span>
                                    </>
                                  ) : (
                                    <span className="opacity-60">Sem avaliações</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {/* Título e Descrição */}
                          <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {offer.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                            {offer.description}
                          </p>
                          
                          {/* Footer */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            {offer.price ? (
                              <div className="font-bold text-lg text-primary">
                                {new Intl.NumberFormat("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                }).format(offer.price)}
                              </div>
                            ) : (
                              <Badge variant="secondary">Sob consulta</Badge>
                            )}
                            
                            <Button size="sm" variant="ghost" className="group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                              Ver Detalhes
                              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Parceiros Favoritos */}
        {favoritePartners.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Parceiros Favoritos ({favoritePartners.length})</h2>
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {favoritePartners.map((fav) => {
                const partner = getPartnerById(fav.partnerId);
                if (!partner) return null;
                
                const rating = getPartnerRating(partner.id);
                const reviewCount = allReviews?.filter(r => r.partnerId === partner.id).length || 0;
                
                return (
                  <div key={fav.id} className="relative">
                    <div className="absolute top-3 right-3 z-10">
                      <FavoriteButton partnerId={partner.id} type="partner" />
                    </div>
                    <Link href={`/partner/${partner.id}`}>
                      <Card className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50 h-full">
                        <CardContent className="p-6">
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              {partner.logoUrl ? (
                                <img 
                                  src={partner.logoUrl} 
                                  alt={partner.companyName}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <Building2 className="h-8 w-8 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg mb-1 truncate group-hover:text-primary transition-colors">
                                {partner.companyName}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                {rating > 0 ? (
                                  <>
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span className="font-medium">{rating.toFixed(1)}</span>
                                    <span className="opacity-60">({reviewCount} avaliações)</span>
                                  </>
                                ) : (
                                  <span className="opacity-60">Sem avaliações</span>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {partner.description && (
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                              {partner.description}
                            </p>
                          )}
                          
                          <Button size="sm" variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
                            Ver Perfil
                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Empty state */}
        {!isLoading && favoriteOffers.length === 0 && favoritePartners.length === 0 && (
          <div className="text-center py-20">
            <Heart className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Nenhum favorito ainda</h2>
            <p className="text-muted-foreground mb-6">
              Comece a explorar ofertas e parceiros para salvá-los aqui.
            </p>
            <Link href="/catalog">
              <Button>
                Explorar Catálogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
