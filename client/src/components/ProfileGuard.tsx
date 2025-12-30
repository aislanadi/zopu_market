import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

interface ProfileGuardProps {
  children: React.ReactNode;
}

/**
 * ProfileGuard - Redireciona compradores sem perfil completo para /buyer/complete-profile
 * 
 * Usado em rotas que requerem perfil completo (dashboard, checkout, etc.)
 */
export function ProfileGuard({ children }: ProfileGuardProps) {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [location, setLocation] = useLocation();
  
  const { data: profile, isLoading: profileLoading } = trpc.buyer.getProfile.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "cliente",
  });

  useEffect(() => {
    // Aguardar carregamento
    if (authLoading || profileLoading) return;

    // Não redirecionar se já estiver na página de completar perfil
    if (location === "/buyer/complete-profile") return;

    // Apenas redirecionar compradores autenticados
    if (!isAuthenticated || !user) return;

    // Apenas verificar compradores (role "cliente")
    if (user.role !== "cliente") return;

    // Redirecionar se perfil não está completo
    if (!profile?.profileComplete) {
      setLocation("/buyer/complete-profile");
    }
  }, [
    authLoading,
    profileLoading,
    isAuthenticated,
    user,
    profile,
    location,
    setLocation,
  ]);

  // Mostrar loading enquanto verifica
  if (authLoading || (profileLoading && user?.role === "cliente")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
