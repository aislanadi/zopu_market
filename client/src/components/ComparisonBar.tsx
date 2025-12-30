import { useComparison } from "@/contexts/ComparisonContext";
import { Button } from "@/components/ui/button";
import { X, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export function ComparisonBar() {
  const { selectedOffers, removeOffer, clearAll } = useComparison();

  if (selectedOffers.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50 p-4 animate-in slide-in-from-bottom duration-300">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <span className="font-semibold text-gray-700">
            Comparar ({selectedOffers.length}/3)
          </span>
          
          <div className="flex gap-2 flex-1 overflow-x-auto">
            {selectedOffers.map((offer, index) => (
              <div
                key={offer.id}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 min-w-[200px] animate-in fade-in slide-in-from-left duration-300"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium truncate">{offer.title}</p>
                  <p className="text-xs text-gray-600 truncate">{offer.partnerName}</p>
                </div>
                <button
                  onClick={() => removeOffer(offer.id)}
                  className="text-gray-500 hover:text-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={clearAll}
            size="sm"
          >
            Limpar
          </Button>
          
          {selectedOffers.length >= 2 && (
            <Link href="/compare">
              <Button size="sm" className="gap-2">
                Comparar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
