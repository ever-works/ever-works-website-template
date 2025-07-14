"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/hooks/use-filters";

export default function CategoriesQuerySync() {
  const { setSelectedCategories } = useFilters();
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoriesParam = searchParams.get("categories");
    if (categoriesParam) {
      try {
        setSelectedCategories(categoriesParam.split(",").map(category => decodeURIComponent(category)));
      } catch (error) {
        console.error('Error decoding category parameters:', error);
        setSelectedCategories([]);
      }
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams, setSelectedCategories]);

  return null;
} 