import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LicenseExpiryAlert } from "@/components/LicenseExpiryAlert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { 
  Building2, 
  Heart, 
  FileText, 
  TrendingUp, 
  Star,
  ArrowRight,
  Sparkles,
  Package,
  Users
} from "lucide-react";

export default function BuyerDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: profile, isLoading: profileLoading } = trpc.buyer.getProfile.useQuery();
  const { data: favorites } = trpc.favorite.list.useQuery();
  // TODO: Implementar listagem de lead requests
  const leadRequests: any[] = [];
  const { data: recommendations } = trpc.buyer.getRecommendations.useQuery(undefined, {
    enabled: !!profile?.profileComplete,
  });

  // Calcular status da licença e dias até vencimento
  const calculateLicenseStatus = (expiryDate?: Date | null) => {
    if (!expiryDate) return "NAO_INFORMADA";
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil < 0) return "VENCIDA";
    if (daysUntil <= 90) return "VENCENDO";
    return "ATIVA";
  };

  const getDaysUntilExpiry = (expiryDate?: Date | null) => {
    if (!expiryDate) return undefined;
    const expiry = new Date(expiryDate);
    const now = new Date();
    return Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  };

  const licenseStatus = profile?.bitrixLicenseExpiry ? calculateLicenseStatus(profile.bitrixLicenseExpiry) : "NAO_INFORMADA";
  const daysUntilExpiry = getDaysUntilExpiry(profile?.bitrixLicenseExpiry);

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

  if (!profile?.profileComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Complete seu Perfil</CardTitle>
            <CardDescription>
              Para acessar o dashboard e receber recomendações personalizadas, complete seu cadastro primeiro.
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
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Olá, {user?.name?.split(' ')[0]}! 👋</h1>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  {profile.nomeFantasia || profile.razaoSocial}
                </div>
                <Badge variant="secondary">{profile.ecossistema}</Badge>
                <Badge variant="outline">Score: {profile.leadScore}</Badge>
              </div>
            </div>
            <Button variant="outline" onClick={() => setLocation("/buyer/edit-profile")}>
              Editar Perfil
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-8 space-y-8">
        {/* License Expiry Alert */}
        <LicenseExpiryAlert
          licenseType={profile?.bitrixLicenseType || "Bitrix24"}
          expiryDate={profile?.bitrixLicenseExpiry ? new Date(profile.bitrixLicenseExpiry) : undefined}
          daysUntilExpiry={daysUntilExpiry}
          licenseStatus={licenseStatus}
        />
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Solicitações</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leadRequests?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Orçamentos solicitados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Favoritos</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{favorites?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ofertas salvas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Recomendações</CardTitle>
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recommendations?.partners?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Parceiros sugeridos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recomendações Personalizadas */}
        {recommendations && (recommendations.partners.length > 0 || recommendations.offers.length > 0) && (
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle>Recomendações para Você</CardTitle>
              </div>
              <CardDescription>
                Baseado no seu ecossistema ({profile.ecossistema}) e interesses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Parceiros Recomendados */}
              {recommendations.partners.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="h-4 w-4" />
                    <h3 className="font-semibold">Parceiros Recomendados</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.partners.slice(0, 4).map((partner: any) => (
                      <div
                        key={partner.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/partner/${partner.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          {partner.logoUrl ? (
                            <img src={partner.logoUrl} alt={partner.companyName} className="w-12 h-12 rounded object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{partner.companyName}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{partner.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              {partner.tier === "PREMIUM" && (
                                <Badge variant="default" className="text-xs">⭐ Premium</Badge>
                              )}
                              {partner.rating && (
                                <div className="flex items-center gap-1 text-xs">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  {partner.rating.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ofertas Recomendadas */}
              {recommendations.offers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-4 w-4" />
                    <h3 className="font-semibold">Ofertas Recomendadas</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {recommendations.offers.slice(0, 4).map((offer: any) => (
                      <div
                        key={offer.id}
                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => setLocation(`/offer/${offer.id}`)}
                      >
                        <div className="flex items-start gap-3">
                          {offer.imageUrl ? (
                            <img src={offer.imageUrl} alt={offer.title} className="w-16 h-16 rounded object-cover" />
                          ) : (
                            <div className="w-16 h-16 rounded bg-muted flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold truncate">{offer.title}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{offer.description}</p>
                            {offer.price && (
                              <p className="text-sm font-semibold text-primary mt-2">
                                R$ {(offer.price / 100).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full" onClick={() => setLocation("/catalog")}>
                Ver Todas as Soluções
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Solicitações Recentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Solicitações de Orçamento</CardTitle>
                <CardDescription>Suas últimas solicitações</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/catalog")}>
                Nova Solicitação
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {leadRequests && leadRequests.length > 0 ? (
              <div className="space-y-4">
                {leadRequests.slice(0, 5).map((request: any) => (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold">{request.offerTitle || "Oferta"}</h4>
                      <p className="text-sm text-muted-foreground">
                        Solicitado em {new Date(request.createdAt).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <Badge variant={
                      request.status === "PENDING" ? "secondary" :
                      request.status === "CONTACTED" ? "default" :
                      request.status === "CONVERTED" ? "default" : "secondary"
                    }>
                      {request.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não fez nenhuma solicitação</p>
                <Button variant="link" onClick={() => setLocation("/catalog")} className="mt-2">
                  Explorar Soluções
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Favoritos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Ofertas Favoritas</CardTitle>
                <CardDescription>Soluções que você salvou</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setLocation("/favorites")}>
                Ver Todos
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.slice(0, 4).map((fav: any) => (
                  <div
                    key={fav.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setLocation(`/offer/${fav.offerId}`)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      <h4 className="font-semibold">Oferta #{fav.offerId}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Salvo em {new Date(fav.createdAt).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Você ainda não tem favoritos</p>
                <Button variant="link" onClick={() => setLocation("/catalog")} className="mt-2">
                  Explorar Soluções
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
