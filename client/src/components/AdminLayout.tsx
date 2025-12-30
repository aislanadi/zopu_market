import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  Package,
  Users,
  FolderTree,
  FileText,
  LogOut,
  Menu,
  X,
  Clock,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Settings,
  Shield,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Restrito</h1>
          <p className="text-muted-foreground mb-6">
            Você precisa fazer login para acessar esta área.
          </p>
          <Button asChild>
            <a href={getLoginUrl()}>Fazer Login</a>
          </Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "admin" && user?.role !== "gerente_contas") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground mb-6">
            Você não tem permissão para acessar esta área.
          </p>
          <Button asChild>
            <Link href="/">Voltar para Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = "/";
  };

  const navigation = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Gestão de Usuários", href: "/admin/users", icon: Users },
    { name: "Categorias", href: "/admin/categories", icon: FolderTree },
    { name: "Parceiros", href: "/admin/partners", icon: Users },
    { name: "Ofertas", href: "/admin/offers", icon: Package },
    { name: "Ofertas Pendentes", href: "/admin/pending-offers", icon: Clock },
    { name: "Licenças Bitrix24", href: "/admin/licenses", icon: Calendar },
    { name: "Indicações", href: "/admin/referrals", icon: FileText },
    { name: "Dashboard Financeiro", href: "/admin/financial", icon: DollarSign },
    { name: "Comissões por Parceiro", href: "/admin/partner-commissions", icon: TrendingUp },
    { name: "Analytics e Relatórios", href: "/admin/analytics", icon: TrendingUp },
    { name: "Ranking de Conversão", href: "/admin/conversion-ranking", icon: BarChart3 },
    { name: "Configuração de Fees", href: "/admin/fees-config", icon: Settings },
    { name: "Auditoria e Logs", href: "/admin/audit-logs", icon: Shield },
    { name: "Cupons de Desconto", href: "/admin/coupons", icon: Tag },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-8" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-muted-foreground hover:text-foreground"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role?.replace("_", " ")}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card border-b border-border">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>
            <img src="/logo-zopu.png" alt="ZOPUMarket" className="h-6" />
            <div className="w-6" /> {/* Spacer for centering */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
