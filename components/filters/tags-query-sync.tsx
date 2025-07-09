"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useFilters } from "@/hooks/use-filters";

export default function TagsQuerySync() {
  const { setSelectedTags } = useFilters();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tagsParam = searchParams.get("tags");
    if (tagsParam) {
      setSelectedTags(tagsParam.split(",").map(tag => decodeURIComponent(tag)));
    } else {
      setSelectedTags([]);
    }
  }, [searchParams, setSelectedTags]);

  return null;
} 