import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function BecomeClient() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    message: "",
  });

  const createLead = trpc.lead.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("Solicitação enviada com sucesso!");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao enviar solicitação");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLead.mutate(formData);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-16 items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="/logo-zopu.png" alt="ZOPU" className="h-8" />
                <span className="font-bold text-xl">market</span>
              </div>
            </Link>
          </div>
        </header>

        <div className="container max-w-2xl py-16">
          <Card className="text-center">
            <CardHeader>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Solicitação Enviada!</CardTitle>
              <CardDescription>
                Recebemos sua solicitação para se tornar cliente ZOPU. Nossa equipe comercial entrará em contato em breve.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <img src="/logo-zopu.png" alt="ZOPU" className="h-8" />
              <span className="font-bold text-xl">market</span>
            </div>
          </Link>
        </div>
      </header>

      <div className="container max-w-2xl py-16">
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Quero ser Cliente ZOPU</CardTitle>
            <CardDescription>
              Preencha o formulário abaixo e nossa equipe comercial entrará em contato para apresentar as melhores soluções para o seu negócio.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Seu nome"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail corporativo *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="seu.email@empresa.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(11) 99999-9999"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da empresa *</Label>
                <Input
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="Nome da sua empresa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Mensagem (opcional)</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Conte-nos sobre suas necessidades..."
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
                  . Autorizo a ZOPU a entrar em contato para apresentar soluções e serviços.
                  <span className="text-destructive ml-1">*</span>
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={createLead.isPending}>
                {createLead.isPending ? "Enviando..." : "Enviar Solicitação"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
