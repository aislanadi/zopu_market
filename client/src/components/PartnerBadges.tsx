import { Badge } from "@/components/ui/badge";
import { CheckCircle, Star, Clock, Award, Shield } from "lucide-react";

interface PartnerBadgesProps {
  badges: string | null;
  className?: string;
}

const BADGE_CONFIG: Record<string, { label: string; icon: any; variant: "default" | "secondary" | "outline" | "destructive"; color: string }> = {
  verified: {
    label: "Parceiro Verificado",
    icon: CheckCircle,
    variant: "default",
    color: "bg-green-100 text-green-700 border-green-200",
  },
  top_rated: {
    label: "Top Rated 2024",
    icon: Star,
    variant: "default",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
  },
  fast_response: {
    label: "Resposta em 24h",
    icon: Clock,
    variant: "default",
    color: "bg-blue-100 text-blue-700 border-blue-200",
  },
  premium: {
    label: "Parceiro Premium",
    icon: Award,
    variant: "default",
    color: "bg-purple-100 text-purple-700 border-purple-200",
  },
  trusted: {
    label: "Confiável",
    icon: Shield,
    variant: "default",
    color: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  community_favorite: {
    label: "Preferido da Comunidade",
    icon: Star,
    variant: "default",
    color: "bg-pink-100 text-pink-700 border-pink-200",
  },
};

export function PartnerBadges({ badges, className = "" }: PartnerBadgesProps) {
  if (!badges) return null;

  let badgeList: string[] = [];
  try {
    badgeList = JSON.parse(badges);
  } catch {
    return null;
  }

  if (badgeList.length === 0) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {badgeList.map((badgeKey) => {
        const config = BADGE_CONFIG[badgeKey];
        if (!config) return null;

        const Icon = config.icon;

        return (
          <Badge
            key={badgeKey}
            variant="outline"
            className={`${config.color} flex items-center gap-1.5 px-3 py-1`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">{config.label}</span>
          </Badge>
        );
      })}
    </div>
  );
}
