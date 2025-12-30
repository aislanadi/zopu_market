import { useState } from "react";
import { Heart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";

interface FavoriteButtonProps {
  offerId?: number;
  partnerId?: number;
  type: "offer" | "partner";
  size?: "sm" | "default" | "lg";
  className?: string;
}

export function FavoriteButton({ offerId, partnerId, type, size = "sm", className = "" }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  // Check if item is favorited
  const { data: checkData } = trpc.favorite.check.useQuery(
    { offerId, partnerId },
    { enabled: isAuthenticated }
  );
  
  const isFavorite = checkData?.isFavorite || false;
  
  // Mutations
  const addMutation = trpc.favorite.add.useMutation({
    onSuccess: () => {
      utils.favorite.check.invalidate({ offerId, partnerId });
      utils.favorite.list.invalidate();
    },
  });
  
  const removeMutation = trpc.favorite.remove.useMutation({
    onSuccess: () => {
      utils.favorite.check.invalidate({ offerId, partnerId });
      utils.favorite.list.invalidate();
    },
  });
  
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      // Redirecionar para login ou mostrar toast
      window.location.href = "/api/oauth/login";
      return;
    }
    
    if (isFavorite) {
      removeMutation.mutate({ offerId, partnerId });
    } else {
      addMutation.mutate({ offerId, partnerId, type });
    }
  };
  
  const isLoading = addMutation.isPending || removeMutation.isPending;
  
  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleToggle}
      disabled={isLoading}
      className={`${className} ${isFavorite ? "text-red-500 hover:text-red-600" : "text-muted-foreground hover:text-red-500"} transition-colors`}
    >
      <Heart 
        className={`h-5 w-5 ${isFavorite ? "fill-current" : ""} transition-all`} 
      />
    </Button>
  );
}
