import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { Loader2, Mail, Lock, User, ArrowLeft, Building2, ShoppingCart } from "lucide-react";


export default function Register() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"cliente" | "parceiro">("cliente");
  
  const registerMutation = trpc.localAuth.register.useMutation({
    onSuccess: (data) => {
      toast.success("Conta criada com sucesso!");
      
      // Redirect based on role
      if (role === "parceiro") {
        setLocation("/partner-apply");
      } else {
        setLocation("/buyer/complete-profile");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar conta");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !name) {
      toast.error("Preencha todos os campos");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (password.length < 8) {
      toast.error("A senha deve ter no mínimo 8 caracteres");
      return;
    }
    
    registerMutation.mutate({ email, password, name, role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold">Criar sua conta</CardTitle>
          <CardDescription>
            Preencha os dados abaixo para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-3">
              <Label>Tipo de Conta</Label>
              <RadioGroup value={role} onValueChange={(v) => setRole(v as "cliente" | "parceiro")}>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="cliente" id="cliente" />
                  <Label htmlFor="cliente" className="flex items-center gap-2 cursor-pointer flex-1">
                    <ShoppingCart className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Comprador</div>
                      <div className="text-xs text-muted-foreground">Busco soluções para minha empresa</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-accent">
                  <RadioGroupItem value="parceiro" id="parceiro" />
                  <Label htmlFor="parceiro" className="flex items-center gap-2 cursor-pointer flex-1">
                    <Building2 className="h-4 w-4" />
                    <div>
                      <div className="font-medium">Parceiro</div>
                      <div className="text-xs text-muted-foreground">Ofereço soluções para empresas</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10"
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10"
                  disabled={registerMutation.isPending}
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando conta...
                </>
              ) : (
                "Criar Conta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Já tem uma conta? </span>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => setLocation("/login")}
            >
              Fazer login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
