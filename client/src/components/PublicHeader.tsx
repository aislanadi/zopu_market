import { useAuth } from "@/_core/hooks/useAuth";
import { NotificationBell } from "@/components/NotificationBell";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { Menu, X, LogOut } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function PublicHeader() {
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("Logout realizado com sucesso!");
      window.location.href = "/";
    },
    onError: () => {
      toast.error("Erro ao fazer logout");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/">
          <img 
            src="/logo-zopu.png" 
            alt="ZOPUMarket" 
            className="h-8 cursor-pointer"
          />
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/catalog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Explorar Soluções
          </Link>
          <Link href="/partner/apply" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
            Seja Parceiro
          </Link>
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <span className="text-sm text-muted-foreground">Olá, {user?.name?.split(' ')[0]}</span>
              {user?.role === 'admin' && (
                <Link href="/admin/dashboard">
                  <Button variant="default" size="sm">
                    Painel Admin
                  </Button>
                </Link>
              )}
              {user?.role === 'gerente_contas' && (
                <Link href="/gerente/dashboard">
                  <Button variant="default" size="sm">
                    Painel Gerente
                  </Button>
                </Link>
              )}
              {user?.role === 'parceiro' && (
                <Link href="/partner/dashboard">
                  <Button variant="default" size="sm">
                    Meu Painel
                  </Button>
                </Link>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Saindo..." : "Sair"}
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="default" size="sm">
                Entrar
              </Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 hover:bg-muted rounded-md transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <Link 
              href="/catalog" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Explorar Soluções
            </Link>
            <Link 
              href="/partner/apply" 
              className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Seja Parceiro
            </Link>
            
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 py-2">
                  <NotificationBell />
                  <span className="text-sm text-muted-foreground">Olá, {user?.name?.split(' ')[0]}</span>
                </div>
                {user?.role === 'admin' && (
                  <Link href="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      Painel Admin
                    </Button>
                  </Link>
                )}
                {user?.role === 'gerente_contas' && (
                  <Link href="/gerente/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      Painel Gerente
                    </Button>
                  </Link>
                )}
                {user?.role === 'parceiro' && (
                  <Link href="/partner/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" size="sm" className="w-full">
                      Meu Painel
                    </Button>
                  </Link>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Saindo..." : "Sair"}
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button variant="default" size="sm" className="w-full">
                  Entrar
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
