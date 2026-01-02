import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import * as Select from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link, useLocation } from "wouter";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ComparisonBar } from "@/components/ComparisonBar";
import { useComparison } from "@/contexts/ComparisonContext";
import { SearchAutocomplete } from "@/components/SearchAutocomplete";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { 
  Search, 
  Star,
  Building2,
  Filter,
  SlidersHorizontal,
  ArrowRight,
  MapPin,
  TrendingUp,
  Award
} from "lucide-react";

export default function Catalog() {
  const { user, isAuthenticated } = useAuth();
  const { addOffer, removeOffer, isSelected, canAddMore } = useComparison();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [selectedPartner, setSelectedPartner] = useState<number | null>(null);
  
  // Ler query params da URL para filtros iniciais
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const partnerParam = params.get('partner');
    const categoryParam = params.get('category');
    
    if (partnerParam) {
      setSelectedPartner(parseInt(partnerParam));
    }
    if (categoryParam) {
      setSelectedCategory(parseInt(categoryParam));
    }
  }, []);
  const [selectedEcosystem, setSelectedEcosystem] = useState<string | null>(null);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<"relevance" | "price_asc" | "price_desc" | "rating" | "recent">("relevance");
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedBadges, setSelectedBadges] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const { data: offers, isLoading } = trpc.offer.list.useQuery({ status: "PUBLISHED" });
  const { data: categories } = trpc.category.list.useQuery();
  const { data: partners } = trpc.partner.list.useQuery();
  const { data: allReviews } = trpc.review.listAll.useQuery();

  // Mock data para ecossistemas (depois vamos adicionar no banco)
  const ecosystems = [
    { id: "industria", name: "Indústria", count: 45 },
    { id: "tecnologia", name: "Tecnologia", count: 78 },
    { id: "servicos", name: "Serviços", count: 62 },
    { id: "varejo", name: "Varejo", count: 34 },
    { id: "saude", name: "Saúde", count: 28 },
    { id: "educacao", name: "Educação", count: 19 },
  ];

  // Pre-calculate all partner ratings once (performance optimization)
  const partnerRatingsMap = useMemo(() => {
    if (!allReviews) return new Map<number, { avg: number; count: number }>();

    const ratingsData = new Map<number, { sum: number; count: number }>();
    allReviews.forEach(r => {
      const current = ratingsData.get(r.partnerId) || { sum: 0, count: 0 };
      ratingsData.set(r.partnerId, {
        sum: current.sum + r.rating,
        count: current.count + 1
      });
    });

    const result = new Map<number, { avg: number; count: number }>();
    ratingsData.forEach((value, key) => {
      result.set(key, { avg: value.sum / value.count, count: value.count });
    });
    return result;
  }, [allReviews]);

  // Get partner rating from pre-calculated map (O(1) lookup instead of O(n) filter)
  const getPartnerRating = useCallback((partnerId: number | null): number => {
    if (!partnerId) return 0;
    return partnerRatingsMap.get(partnerId)?.avg || 0;
  }, [partnerRatingsMap]);

  // Get review count for a partner
  const getPartnerReviewCount = useCallback((partnerId: number | null): number => {
    if (!partnerId) return 0;
    return partnerRatingsMap.get(partnerId)?.count || 0;
  }, [partnerRatingsMap]);

  // Pre-calculate partner lookup map for O(1) access
  const partnersMap = useMemo(() => {
    if (!partners) return new Map();
    return new Map(partners.map(p => [p.id, p]));
  }, [partners]);

  // Memoized partner lookup function
  const getPartnerForOffer = useCallback((partnerId: number | null) => {
    if (!partnerId) return null;
    return partnersMap.get(partnerId) || null;
  }, [partnersMap]);

  // Pre-parse partner badges for efficient filtering
  const partnerBadgesMap = useMemo(() => {
    if (!partners) return new Map<number, string[]>();
    const map = new Map<number, string[]>();
    partners.forEach(p => {
      if (p.badges) {
        try {
          map.set(p.id, JSON.parse(p.badges));
        } catch {
          map.set(p.id, []);
        }
      }
    });
    return map;
  }, [partners]);

  // Memoized filtered offers (prevents recalculation on every render)
  const filteredOffers = useMemo(() => {
    if (!offers) return [];

    return offers.filter((offer) => {
      const matchesSearch = !searchQuery ||
        offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        offer.description?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = !selectedCategory || offer.categoryId === selectedCategory;
      const matchesPartner = !selectedPartner || offer.partnerId === selectedPartner;

      const partnerRating = getPartnerRating(offer.partnerId);
      const matchesRating = !minRating || partnerRating >= minRating;

      // Filtro de preço
      const price = offer.price;
      const matchesPrice = (!minPrice || !price || price >= minPrice) &&
                           (!maxPrice || !price || price <= maxPrice);

      // Get partner from map (O(1) instead of O(n))
      const partner = offer.partnerId ? partnersMap.get(offer.partnerId) : null;

      // Filtro de ecossistema
      const matchesEcosystem = !selectedEcosystem ||
        (partner?.ecosystems && partner.ecosystems.toLowerCase().includes(selectedEcosystem.toLowerCase()));

      // Filtro de localização
      const matchesState = !selectedState || partner?.state === selectedState;
      const matchesCity = !selectedCity || partner?.city === selectedCity;

      // Filtro de badges (use pre-parsed badges map)
      const matchesBadges = selectedBadges.length === 0 || (() => {
        if (!offer.partnerId) return false;
        const badges = partnerBadgesMap.get(offer.partnerId) || [];
        return selectedBadges.every(badge => badges.includes(badge));
      })();

      return matchesSearch && matchesCategory && matchesPartner && matchesRating && matchesPrice &&
             matchesEcosystem && matchesState && matchesCity && matchesBadges;
    });
  }, [offers, searchQuery, selectedCategory, selectedPartner, minRating, minPrice, maxPrice,
      selectedEcosystem, selectedState, selectedCity, selectedBadges, partnersMap, partnerBadgesMap, getPartnerRating]);

  // Memoized sorted offers (prevents re-sorting on every render)
  const sortedOffers = useMemo(() => {
    if (!filteredOffers || filteredOffers.length === 0) return [];

    return [...filteredOffers].sort((a, b) => {
      switch (sortBy) {
        case "price_asc":
          if (!a.price) return 1;
          if (!b.price) return -1;
          return a.price - b.price;

        case "price_desc":
          if (!a.price) return 1;
          if (!b.price) return -1;
          return b.price - a.price;

        case "rating": {
          const ratingA = getPartnerRating(a.partnerId);
          const ratingB = getPartnerRating(b.partnerId);
          return ratingB - ratingA;
        }

        case "recent":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

        case "relevance":
        default: {
          const rA = getPartnerRating(a.partnerId);
          const rB = getPartnerRating(b.partnerId);
          if (rB !== rA) return rB - rA;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      }
    });
  }, [filteredOffers, sortBy, getPartnerRating]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <img 
              src="/logo-zopu.png" 
              alt="ZOPUMarket" 
              className="h-8 cursor-pointer"
            />
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/catalog" className="text-sm font-medium text-primary">
              Explorar Soluções
            </Link>
            <Link href="/partner/apply" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Seja Parceiro
            </Link>
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">Olá, {user?.name?.split(' ')[0]}</span>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard">
                    <Button variant="default" size="sm">Painel Admin</Button>
                  </Link>
                )}
                {user?.role === 'parceiro' && (
                  <Link href="/partner/dashboard">
                    <Button variant="default" size="sm">Meu Painel</Button>
                  </Link>
                )}
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm">Entrar</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero do Catálogo */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-12">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Explore Soluções B2B
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Descubra parceiros verificados, compare ofertas e encontre a solução perfeita para o seu negócio
            </p>

            {/* Barra de busca com autocomplete */}
            <SearchAutocomplete />
          </div>
        </div>
      </section>

      <div className="container py-8">
        {/* Botão de Filtros Mobile */}
        <div className="lg:hidden mb-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {showFilters ? "Ocultar Filtros" : "Mostrar Filtros"}
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar de Filtros */}
          <aside className={`lg:col-span-1 space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Categorias */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Categorias</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedCategory === null 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      Todas
                    </button>
                    {categories?.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id ?? null)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedCategory === category.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Badges */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Qualificações</h3>
                  <div className="space-y-2">
                    {[
                      { id: "verified", label: "Parceiro Verificado" },
                      { id: "top_rated", label: "Top Rated 2024" },
                      { id: "fast_response", label: "Resposta em 24h" },
                      { id: "community_favorite", label: "Preferido da Comunidade" },
                      { id: "premium", label: "Parceiro Premium" },
                      { id: "trusted", label: "Confiável" },
                    ].map((badge) => (
                      <label key={badge.id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedBadges.includes(badge.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedBadges([...selectedBadges, badge.id]);
                            } else {
                              setSelectedBadges(selectedBadges.filter(b => b !== badge.id));
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                        <span className="text-sm">{badge.label}</span>
                      </label>
                    ))}
                    {selectedBadges.length > 0 && (
                      <button
                        onClick={() => setSelectedBadges([])}
                        className="text-xs text-primary hover:underline"
                      >
                        Limpar badges
                      </button>
                    )}
                  </div>
                </div>

                {/* Localização */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Localização</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setMinRating(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        minRating === null 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      Todas
                    </button>
                    {[5, 4, 3].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setMinRating(rating)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          minRating === rating 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <span className="flex items-center gap-1">
                          {[...Array(rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                          <span className="ml-1">+</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Faixa de Preço */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Faixa de Preço</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Preço Mínimo</label>
                      <input
                        type="number"
                        placeholder="R$ 0"
                        value={minPrice || ""}
                        onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Preço Máximo</label>
                      <input
                        type="number"
                        placeholder="R$ 100.000"
                        value={maxPrice || ""}
                        onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : null)}
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                    {(minPrice || maxPrice) && (
                      <button
                        onClick={() => {
                          setMinPrice(null);
                          setMaxPrice(null);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Limpar filtro de preço
                      </button>
                    )}
                  </div>
                </div>

                {/* Ecossistemas */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm">Ecossistema</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedEcosystem(null)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        selectedEcosystem === null 
                          ? "bg-primary text-primary-foreground" 
                          : "hover:bg-muted"
                      }`}
                    >
                      Todos
                    </button>
                    {ecosystems.map((eco) => (
                      <button
                        key={eco.id}
                        onClick={() => setSelectedEcosystem(eco.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                          selectedEcosystem === eco.id 
                            ? "bg-primary text-primary-foreground" 
                            : "hover:bg-muted"
                        }`}
                      >
                        <span>{eco.name}</span>
                        <span className="text-xs opacity-70">{eco.count}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Localização */}
                <div>
                  <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Localização
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Estado (UF)</label>
                      <select
                        value={selectedState || ""}
                        onChange={(e) => {
                          setSelectedState(e.target.value || null);
                          setSelectedCity(null); // Limpar cidade ao mudar estado
                        }}
                        className="w-full px-3 py-2 border rounded-lg text-sm bg-background"
                      >
                        <option value="">Todos os estados</option>
                        <option value="AC">Acre</option>
                        <option value="AL">Alagoas</option>
                        <option value="AP">Amapá</option>
                        <option value="AM">Amazonas</option>
                        <option value="BA">Bahia</option>
                        <option value="CE">Ceará</option>
                        <option value="DF">Distrito Federal</option>
                        <option value="ES">Espírito Santo</option>
                        <option value="GO">Goiás</option>
                        <option value="MA">Maranhão</option>
                        <option value="MT">Mato Grosso</option>
                        <option value="MS">Mato Grosso do Sul</option>
                        <option value="MG">Minas Gerais</option>
                        <option value="PA">Pará</option>
                        <option value="PB">Paraíba</option>
                        <option value="PR">Paraná</option>
                        <option value="PE">Pernambuco</option>
                        <option value="PI">Piauí</option>
                        <option value="RJ">Rio de Janeiro</option>
                        <option value="RN">Rio Grande do Norte</option>
                        <option value="RS">Rio Grande do Sul</option>
                        <option value="RO">Rondônia</option>
                        <option value="RR">Roraima</option>
                        <option value="SC">Santa Catarina</option>
                        <option value="SP">São Paulo</option>
                        <option value="SE">Sergipe</option>
                        <option value="TO">Tocantins</option>
                      </select>
                    </div>
                    {selectedState && (
                      <div>
                        <label className="text-xs text-muted-foreground mb-1 block">Cidade</label>
                        <input
                          type="text"
                          placeholder="Digite a cidade"
                          value={selectedCity || ""}
                          onChange={(e) => setSelectedCity(e.target.value || null)}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                      </div>
                    )}
                    {(selectedState || selectedCity) && (
                      <button
                        onClick={() => {
                          setSelectedState(null);
                          setSelectedCity(null);
                        }}
                        className="text-xs text-primary hover:underline"
                      >
                        Limpar filtro de localização
                      </button>
                    )}
                  </div>
                </div>

                {/* Limpar filtros */}
                {(selectedCategory || selectedEcosystem || searchQuery || minRating || selectedState || selectedCity || selectedBadges.length > 0) && (
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedEcosystem(null);
                      setSearchQuery("");
                      setMinRating(null);
                      setSelectedState(null);
                      setSelectedCity(null);
                      setMinPrice(null);
                      setMaxPrice(null);
                      setSelectedBadges([]);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </CardContent>
            </Card>
          </aside>

          {/* Grid de Ofertas */}
          <div className="lg:col-span-3">
            {/* Header com contagem */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">
                  {sortedOffers?.length || 0} Soluções Encontradas
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Parceiros verificados e aprovados pela ZOPU
                </p>
              </div>
              
              <Select.Root value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <Select.Trigger className="inline-flex items-center justify-between gap-2 px-4 py-2 text-sm font-medium border rounded-lg hover:bg-muted transition-colors min-w-[180px]">
                  <SlidersHorizontal className="h-4 w-4" />
                  <Select.Value />
                  <ChevronDown className="h-4 w-4" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="bg-popover border rounded-lg shadow-lg p-1 z-50">
                    <Select.Viewport>
                      <Select.Item value="relevance" className="relative flex items-center px-8 py-2 text-sm rounded hover:bg-muted cursor-pointer outline-none">
                        <Select.ItemIndicator className="absolute left-2">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Relevância</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="rating" className="relative flex items-center px-8 py-2 text-sm rounded hover:bg-muted cursor-pointer outline-none">
                        <Select.ItemIndicator className="absolute left-2">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Melhor Avaliado</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="price_asc" className="relative flex items-center px-8 py-2 text-sm rounded hover:bg-muted cursor-pointer outline-none">
                        <Select.ItemIndicator className="absolute left-2">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Menor Preço</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="price_desc" className="relative flex items-center px-8 py-2 text-sm rounded hover:bg-muted cursor-pointer outline-none">
                        <Select.ItemIndicator className="absolute left-2">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Maior Preço</Select.ItemText>
                      </Select.Item>
                      <Select.Item value="recent" className="relative flex items-center px-8 py-2 text-sm rounded hover:bg-muted cursor-pointer outline-none">
                        <Select.ItemIndicator className="absolute left-2">
                          <Check className="h-4 w-4" />
                        </Select.ItemIndicator>
                        <Select.ItemText>Mais Recentes</Select.ItemText>
                      </Select.Item>
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}

            {/* Grid de Cards */}
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
              {sortedOffers?.map((offer) => {
                const partner = getPartnerForOffer(offer.partnerId);
                const rating = getPartnerRating(offer.partnerId);
                
                return (
                  <div key={offer.id} className="relative">
                    <div className="absolute top-3 right-3 z-10 flex gap-2">
                      <FavoriteButton offerId={offer.id} type="offer" />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (isSelected(offer.id)) {
                            removeOffer(offer.id);
                          } else if (canAddMore) {
                            if (offer.partnerId) {
                              addOffer({
                                id: offer.id,
                                title: offer.title,
                                partnerId: offer.partnerId,
                                partnerName: partner?.companyName || "Parceiro",
                                imageUrl: offer.imageUrl,
                                offerType: offer.offerType,
                                pricing: offer.price ? `R$ ${(offer.price / 100).toFixed(2)}` : "Sob consulta",
                              });
                              toast.success("✅ Oferta adicionada ao comparador!", {
                                description: `${offer.title} foi adicionada para comparação.`,
                                duration: 2000,
                              });
                            }
                          }
                        }}
                        className={`p-2 rounded-full backdrop-blur-sm transition-all transform hover:scale-110 active:scale-95 ${
                          isSelected(offer.id)
                            ? "bg-primary text-white animate-pulse"
                            : "bg-white/90 hover:bg-white text-gray-700 hover:text-primary"
                        } shadow-lg`}
                        title={isSelected(offer.id) ? "Remover da comparação" : "Adicionar à comparação"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M18 20V10" />
                          <path d="M12 20V4" />
                          <path d="M6 20v-6" />
                        </svg>
                      </button>
                    </div>
                    <Link href={`/offer/${offer.id}`}>
                      <Card className="group hover:shadow-xl transition-all cursor-pointer border-2 hover:border-primary/50 h-full flex flex-col">
                      {/* Imagem da oferta */}
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
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-sm truncate">
                                  {partner.companyName}
                                </div>
                                {partner.tier === "PREMIUM" && (
                                  <Badge variant="default" className="text-xs px-2 py-0 bg-gradient-to-r from-amber-500 to-orange-500 border-0">
                                    ⭐ Premium
                                  </Badge>
                                )}
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

                        {/* Título e descrição */}
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                            {offer.title}
                          </h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                            {offer.description}
                          </p>
                        </div>

                        {/* Tags de ecossistema (mock) */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <Badge variant="secondary" className="text-xs">
                            Tecnologia
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            SaaS
                          </Badge>
                        </div>

                        {/* Footer com preço e botão */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          {!isAuthenticated ? (
                            <div className="text-sm font-medium text-muted-foreground">
                              🔒 Faça login para ver preços
                            </div>
                          ) : offer.price ? (
                            <div>
                              <div className="text-xs text-muted-foreground">A partir de</div>
                              <div className="text-xl font-bold text-primary">
                                R$ {(offer.price / 100).toFixed(2)}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm font-medium text-muted-foreground">
                              Sob consulta
                            </div>
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

            {/* Empty state */}
            {!isLoading && sortedOffers?.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search className="h-10 w-10 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Nenhuma solução encontrada</h3>
                <p className="text-muted-foreground mb-6">
                  Tente ajustar os filtros ou buscar por outros termos
                </p>
                {(selectedCategory || selectedEcosystem || searchQuery || selectedBadges.length > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedCategory(null);
                      setSelectedEcosystem(null);
                      setSearchQuery("");
                      setSelectedBadges([]);
                    }}
                  >
                    Limpar Filtros
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-16 bg-muted/30 mt-12">
        <div className="container text-center">
          <div className="max-w-2xl mx-auto">
            <Award className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">
              Não encontrou o que procura?
            </h2>
            <p className="text-lg text-muted-foreground mb-6">
              Nossa equipe pode te ajudar a encontrar a solução ideal para o seu negócio
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://wa.me/554733079280?text=Ol%C3%A1%21%20Vim%20do%20ZOPUMarket%20e%20gostaria%20de%20falar%20com%20um%20especialista%20sobre%20solu%C3%A7%C3%B5es%20B2B."
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  // Track WhatsApp click
                  fetch('/api/trpc/analytics.track', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ eventType: 'whatsapp_click' })
                  }).catch(() => {});
                }}
              >
                <Button size="lg">
                  Falar com Especialista
                </Button>
              </a>
              <Link href="/partner/apply">
                <Button size="lg" variant="outline">
                  Tornar-se Parceiro
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2024 ZOPU Market. Todos os direitos reservados.</p>
        </div>
      </footer>

      {/* Barra de comparação flutuante */}
      <ComparisonBar />
    </div>
  );
}
