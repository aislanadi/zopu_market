import { PublicHeader } from "@/components/PublicHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { 
  Search, 
  Building2, 
  TrendingUp, 
  Shield, 
  Star,
  ArrowRight,
  CheckCircle2,
  Users,
  Target,
  Sparkles
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <PublicHeader />

      {/* Hero Section com espaço para imagem humanizada */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
        
        <div className="container relative py-16 md:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Conteúdo à esquerda */}
            <div className="space-y-8">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="w-3 h-3 mr-1" />
                Marketplace B2B de Soluções Empresariais
              </Badge>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                  Conecte-se com as
                  <span className="text-primary block mt-2">
                    Melhores Soluções
                  </span>
                  do Mercado
                </h1>
                
                <p className="text-lg md:text-xl text-muted-foreground max-w-xl">
                  Descubra parceiros especializados, compare ofertas e encontre a solução perfeita para o seu negócio em um só lugar.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/catalog">
                  <Button size="lg" className="w-full sm:w-auto group">
                    Explorar Soluções
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              <Link href="/become-client">
                <Button size="lg" variant="outline" className="border-2">
                  Quero ser Cliente
                </Button>
              </Link>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-primary">150+</div>
                  <div className="text-sm text-muted-foreground">Parceiros Ativos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">500+</div>
                  <div className="text-sm text-muted-foreground">Soluções Disponíveis</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Satisfação</div>
                </div>
              </div>
            </div>

            {/* Imagem humanizada */}
            <div className="relative lg:block">
              <div className="relative aspect-square lg:aspect-auto lg:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
                <img 
                  src="/hero-business-meeting.jpg" 
                  alt="Profissionais em reunião de negócios" 
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </div>
              
              {/* Card de Avaliação - Canto esquerdo inferior */}
              <div className="absolute -bottom-6 -left-6 hidden lg:block group/rating">
                <div className="bg-background border rounded-2xl p-4 shadow-lg transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover/rating:bg-primary/20">
                      <Star className="w-6 h-6 text-primary transition-all duration-300 group-hover/rating:scale-110 group-hover/rating:drop-shadow-[0_0_8px_rgba(255,127,80,0.6)]" />
                    </div>
                    <div>
                      <div className="font-semibold">4.9/5.0</div>
                      <div className="text-xs text-muted-foreground">Avaliação Média</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Botão CTA - Canto direito inferior */}
              <div className="absolute -bottom-6 -right-6 hidden lg:block">
                <Link href="/catalog">
                  <Button 
                    size="lg" 
                    className="backdrop-blur-sm bg-background/90 hover:bg-background text-foreground border-2 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95 animate-fade-in-bounce animate-pulse-subtle"
                  >
                    Saiba Mais
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Busca por Ecossistema */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Explore por Ecossistema
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Encontre parceiros que fazem negócios no seu setor e podem criar sinergias com sua empresa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Indústria", icon: Building2, color: "bg-blue-500/10 text-blue-600", count: "45 parceiros" },
              { name: "Tecnologia", icon: Target, color: "bg-purple-500/10 text-purple-600", count: "78 parceiros" },
              { name: "Serviços", icon: Users, color: "bg-green-500/10 text-green-600", count: "62 parceiros" },
              { name: "Varejo", icon: TrendingUp, color: "bg-orange-500/10 text-orange-600", count: "34 parceiros" },
            ].map((ecosystem) => (
              <Card key={ecosystem.name} className="group hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary/50">
                <CardContent className="p-6">
                  <div className={`w-14 h-14 rounded-2xl ${ecosystem.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <ecosystem.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1">{ecosystem.name}</h3>
                  <p className="text-sm text-muted-foreground">{ecosystem.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Como Funciona */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como Funciona
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Processo simples e transparente para conectar sua empresa às melhores soluções
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Explore Soluções",
                description: "Navegue por centenas de ofertas de parceiros verificados, filtre por categoria e ecossistema",
                icon: Search,
              },
              {
                step: "02",
                title: "Compare e Avalie",
                description: "Veja avaliações reais, compare preços e benefícios, e escolha a melhor opção para seu negócio",
                icon: Star,
              },
              {
                step: "03",
                title: "Conecte-se",
                description: "Solicite proposta ou compre diretamente. Seu gerente de contas ZOPU acompanha todo o processo",
                icon: CheckCircle2,
              },
            ].map((item) => (
              <Card key={item.step} className="relative border-2 hover:border-primary/50 transition-all">
                <CardContent className="p-8">
                  <div className="absolute -top-4 left-8">
                    <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                      {item.step}
                    </div>
                  </div>
                  
                  <div className="mt-8 space-y-4">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    
                    <h3 className="text-xl font-semibold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge variant="secondary" className="mb-4">
                Por que escolher ZOPU Market?
              </Badge>
              
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Marketplace Curado com Garantia de Qualidade
              </h2>
              
              <div className="space-y-4">
                {[
                  "Parceiros verificados e aprovados pela equipe ZOPU",
                  "Sistema de avaliações e reputação transparente",
                  "Gerente de contas dedicado para cada indicação",
                  "Comissionamento justo e transparente",
                  "Integração automática com Bitrix24",
                ].map((benefit) => (
                  <div key={benefit} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {[
                { icon: Shield, title: "Parceiros Verificados", desc: "100% curados" },
                { icon: Star, title: "Avaliações Reais", desc: "Sistema transparente" },
                { icon: TrendingUp, title: "Crescimento", desc: "Escale seu negócio" },
                { icon: Users, title: "Suporte Dedicado", desc: "Gerente de contas" },
              ].map((item) => (
                <Card key={item.title} className="border-2">
                  <CardContent className="p-6 text-center">
                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pronto para Encontrar a Solução Ideal?
          </h2>
          <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já encontraram parceiros estratégicos no ZOPU Market
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto group">
                Explorar Agora
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/partner/apply">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent text-primary-foreground border-primary-foreground hover:bg-primary-foreground/10">
                Quero Ser Parceiro
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8 mb-4" />
              <p className="text-sm text-muted-foreground">
                Conectando empresas às melhores soluções do mercado B2B
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Plataforma</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/catalog" className="hover:text-primary transition-colors">Explorar Soluções</Link></li>
                <li><Link href="/partner/apply" className="hover:text-primary transition-colors">Seja Parceiro</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/about" className="hover:text-primary transition-colors">Sobre Nós</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contato</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/terms" className="hover:text-primary transition-colors">Termos de Uso</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacidade</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t mt-12 pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 ZOPU Market. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
