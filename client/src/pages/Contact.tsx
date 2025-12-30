import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { 
  Mail, 
  Phone, 
  MapPin, 
  MessageSquare,
  Send,
  Building2
} from "lucide-react";
import { toast } from "sonner";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simular envio (depois integrar com backend)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      message: "",
    });
    setIsSubmitting(false);
  };

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
            <Link href="/contact" className="text-sm font-medium text-primary">
              Contato
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/5 via-primary/10 to-background py-16">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Entre em contato com a ZOPU
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nossos especialistas estão prontos para atender a sua empresa
          </p>
        </div>
      </section>

      {/* Informações de Contato */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Nosso Endereço</h3>
                  <p className="text-sm text-muted-foreground">
                    Rua Rio Grande do Sul, 385<br />
                    Joinville – Santa Catarina<br />
                    Brasil
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">E-mail</h3>
                  <a 
                    href="mailto:contato@zopu.com.br" 
                    className="text-sm text-primary hover:underline"
                  >
                    contato@zopu.com.br
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Suporte e Vendas</h3>
                  <a 
                    href="tel:08000429000" 
                    className="text-sm text-primary hover:underline mb-1"
                  >
                    0800 042 9000
                  </a>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">WhatsApp</h3>
                  <a 
                    href="https://wa.me/554733079280" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline"
                  >
                    +55 47 3307-9280
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Formulário de Contato */}
      <section className="py-16">
        <div className="container max-w-3xl">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                Quer a ajuda da nossa equipe de especialistas?
              </CardTitle>
              <CardDescription>
                Deixe suas informações e te ajudaremos a encontrar a solução ideal para o seu negócio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome *</Label>
                    <Input
                      id="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Seu nome"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail *</Label>
                    <Input
                      id="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="seu@email.com"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Nome da Empresa</Label>
                    <Input
                      id="company"
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      placeholder="Sua empresa"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mensagem *</Label>
                  <Textarea
                    id="message"
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Como podemos ajudar?"
                    rows={5}
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Enviando..."
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Ao enviar este formulário, você concorda com nossa{" "}
                  <Link href="/privacy" className="text-primary hover:underline">
                    Política de Privacidade
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
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
