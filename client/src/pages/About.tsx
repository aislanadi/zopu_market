import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Target, 
  Users, 
  Award, 
  TrendingUp,
  CheckCircle2,
  ArrowRight
} from "lucide-react";

export default function About() {
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
            <Link href="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/catalog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/about" className="text-sm font-medium text-primary">
              Sobre Nós
            </Link>
            <Link href="/contact" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              Contato
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre o ZOPUMarket
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Conectamos empresas a soluções B2B de qualidade, com curadoria especializada e parceiros verificados
          </p>
        </div>
      </section>

      {/* Missão, Visão, Valores */}
      <section className="py-16">
        <div className="container">
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Nossa Missão</h3>
                  <p className="text-muted-foreground">
                    Facilitar a conexão entre empresas e as melhores soluções B2B do mercado, 
                    garantindo qualidade, confiança e resultados através de uma curadoria especializada.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <TrendingUp className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Nossa Visão</h3>
                  <p className="text-muted-foreground">
                    Ser a principal plataforma de marketplace B2B do Brasil, reconhecida pela 
                    excelência na curadoria de parceiros e pela transformação digital das empresas.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Nossos Valores</h3>
                  <p className="text-muted-foreground">
                    Transparência, qualidade, inovação e compromisso com o sucesso dos nossos 
                    clientes e parceiros. Acreditamos em relacionamentos de longo prazo.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quem Somos */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Quem Somos</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-muted-foreground mb-6">
              O <strong>ZOPUMarket</strong> nasceu da expertise da ZOPU, empresa referência em soluções 
              Bitrix24 e automação de processos empresariais. Com anos de experiência no mercado B2B, 
              identificamos a necessidade de um marketplace que conectasse empresas a fornecedores 
              de qualidade de forma transparente e eficiente.
            </p>

            <p className="text-lg text-muted-foreground mb-6">
              Nossa plataforma foi desenvolvida para resolver um problema comum no mercado: a dificuldade 
              de encontrar parceiros confiáveis e soluções adequadas para cada necessidade empresarial. 
              Através de um rigoroso processo de curadoria, garantimos que apenas os melhores parceiros 
              façam parte do nosso ecossistema.
            </p>

            <p className="text-lg text-muted-foreground">
              Hoje, o ZOPUMarket é mais do que uma plataforma de compra e venda. Somos um ecossistema 
              completo que promove a transformação digital das empresas brasileiras, conectando demandas 
              a soluções de forma inteligente e estratégica.
            </p>
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-16">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Nossos Diferenciais</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                title: "Curadoria Especializada",
                description: "Todos os parceiros passam por um rigoroso processo de validação antes de serem aprovados na plataforma."
              },
              {
                title: "Parceiros Verificados",
                description: "Trabalhamos apenas com empresas comprovadamente qualificadas e com histórico de sucesso."
              },
              {
                title: "Atendimento Personalizado",
                description: "Nossa equipe de especialistas está pronta para ajudar você a encontrar a solução ideal."
              },
              {
                title: "Transparência Total",
                description: "Avaliações reais de clientes e informações detalhadas sobre cada oferta e parceiro."
              },
              {
                title: "Segurança e Confiança",
                description: "Processos seguros de contratação e suporte contínuo durante toda a jornada."
              },
              {
                title: "Ecossistema Completo",
                description: "Soluções para diversos segmentos e necessidades empresariais em um só lugar."
              }
            ].map((item, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary/5 via-primary/10 to-background">
        <div className="container text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para encontrar a solução ideal?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore nosso catálogo de soluções B2B ou entre em contato com nossa equipe
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/catalog">
              <Button size="lg">
                Explorar Soluções
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline">
                Falar com Especialista
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted/50 border-t py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <img 
                src="/logo-zopu.png" 
                alt="ZOPUMarket" 
                className="h-8 mb-4"
              />
              <p className="text-sm text-muted-foreground">
                Marketplace B2B de Soluções Empresariais
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
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 ZOPUMarket. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
