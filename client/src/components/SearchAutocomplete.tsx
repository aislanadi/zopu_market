import { useState, useEffect, useRef } from "react";
import { Search, Building2, Tag, Package } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

interface SearchResult {
  type: "offer" | "partner" | "category";
  id: number;
  title: string;
  subtitle?: string;
}

export function SearchAutocomplete() {
  const [, setLocation] = useLocation();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Fetch search results
  const { data: searchResults, isLoading } = trpc.search.unified.useQuery(
    { query: debouncedQuery },
    { enabled: debouncedQuery.length >= 2 }
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show dropdown when there are results
  useEffect(() => {
    if (searchResults && searchResults.length > 0 && debouncedQuery.length >= 2) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [searchResults, debouncedQuery]);

  // Highlight matching text
  const highlightText = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    
    const regex = new RegExp(`(${highlight})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 font-semibold">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!searchResults || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && searchResults[selectedIndex]) {
          handleSelectResult(searchResults[selectedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleSelectResult = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    
    switch (result.type) {
      case "offer":
        setLocation(`/offer/${result.id}`);
        break;
      case "partner":
        setLocation(`/partner/${result.id}`);
        break;
      case "category":
        setLocation(`/catalog?category=${result.id}`);
        break;
    }
  };

  // Get icon by type
  const getIcon = (type: string) => {
    switch (type) {
      case "offer":
        return <Package className="w-4 h-4 text-primary" />;
      case "partner":
        return <Building2 className="w-4 h-4 text-blue-600" />;
      case "category":
        return <Tag className="w-4 h-4 text-green-600" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "offer":
        return "Oferta";
      case "partner":
        return "Parceiro";
      case "category":
        return "Categoria";
      default:
        return "";
    }
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchResults && searchResults.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder="Buscar por soluções, parceiros, categorias..."
          className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-primary transition-colors"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
          </div>
        )}
      </div>

      {/* Dropdown with results */}
      {isOpen && searchResults && searchResults.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto"
        >
          {searchResults.map((result: SearchResult, index: number) => (
            <button
              key={`${result.type}-${result.id}`}
              onClick={() => handleSelectResult(result)}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
                index === selectedIndex ? "bg-gray-100" : ""
              }`}
            >
              <div className="flex-shrink-0">{getIcon(result.type)}</div>
              <div className="flex-1 text-left">
                <div className="font-medium text-gray-900">
                  {highlightText(result.title, debouncedQuery)}
                </div>
                {result.subtitle && (
                  <div className="text-sm text-gray-600">
                    {highlightText(result.subtitle, debouncedQuery)}
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getTypeLabel(result.type)}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {isOpen && searchResults && searchResults.length === 0 && debouncedQuery.length >= 2 && !isLoading && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4"
        >
          <p className="text-gray-600 text-center">
            Nenhum resultado encontrado para "{debouncedQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
