import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { University } from "@shared/schema";

interface ComparisonContextType {
  selectedUniversities: Set<string>;
  universityDetails: Map<string, University>;
  addToComparison: (university: University) => void;
  removeFromComparison: (universityId: string) => void;
  clearComparison: () => void;
  isSelected: (universityId: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [selectedUniversities, setSelectedUniversities] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("compare-list");
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [universityDetails, setUniversityDetails] = useState<Map<string, University>>(new Map());

  // Persist selectedUniversities to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("compare-list", JSON.stringify(Array.from(selectedUniversities)));
  }, [selectedUniversities]);

  const addToComparison = (university: University) => {
    if (selectedUniversities.size < 10) {
      setSelectedUniversities(prev => {
        const newSet = new Set([...prev, university.id]);
        return newSet;
      });
      setUniversityDetails(prev => new Map([...prev, [university.id, university]]));
    }
  };

  const removeFromComparison = (universityId: string) => {
    setSelectedUniversities(prev => {
      const newSet = new Set(prev);
      newSet.delete(universityId);
      return newSet;
    });
    setUniversityDetails(prev => {
      const newMap = new Map(prev);
      newMap.delete(universityId);
      return newMap;
    });
  };

  const clearComparison = () => {
    setSelectedUniversities(new Set());
    setUniversityDetails(new Map());
    localStorage.removeItem("compare-list");
  };

  const isSelected = (universityId: string) => {
    return selectedUniversities.has(universityId);
  };

  return (
    <ComparisonContext.Provider value={{
      selectedUniversities,
      universityDetails,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isSelected
    }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (context === undefined) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
