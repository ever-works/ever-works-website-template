"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/hooks/use-filters";

export default function CategoriesQuerySync() {
  const { setSelectedCategories } = useFilters();
  const searchParams = useSearchParams();

  useEffect(() => {
    const categoriesParam = searchParams.get("category");
    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split(",").map(category => decodeURIComponent(category)));
    } else {
      setSelectedCategories([]);
    }
  }, [searchParams, setSelectedCategories]);

  return null;
} 