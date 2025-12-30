import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface ComparisonOffer {
  id: number;
  title: string;
  partnerId: number;
  partnerName: string;
  imageUrl: string | null;
  offerType: string;
  pricing: string | null;
}

interface ComparisonContextType {
  selectedOffers: ComparisonOffer[];
  addOffer: (offer: ComparisonOffer) => void;
  removeOffer: (offerId: number) => void;
  clearAll: () => void;
  isSelected: (offerId: number) => boolean;
  canAddMore: boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedOffers, setSelectedOffers] = useState<ComparisonOffer[]>(() => {
    const saved = localStorage.getItem('comparison_offers');
    return saved ? JSON.parse(saved) : [];
  });

  // Persist to localStorage whenever selectedOffers changes
  useEffect(() => {
    localStorage.setItem('comparison_offers', JSON.stringify(selectedOffers));
  }, [selectedOffers]);

  const addOffer = (offer: ComparisonOffer) => {
    if (selectedOffers.length < 3 && !selectedOffers.find(o => o.id === offer.id)) {
      setSelectedOffers([...selectedOffers, offer]);
    }
  };

  const removeOffer = (offerId: number) => {
    setSelectedOffers(selectedOffers.filter(o => o.id !== offerId));
  };

  const clearAll = () => {
    setSelectedOffers([]);
  };

  const isSelected = (offerId: number) => {
    return selectedOffers.some(o => o.id === offerId);
  };

  const canAddMore = selectedOffers.length < 3;

  return (
    <ComparisonContext.Provider
      value={{
        selectedOffers,
        addOffer,
        removeOffer,
        clearAll,
        isSelected,
        canAddMore,
      }}
    >
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison must be used within ComparisonProvider");
  }
  return context;
}
