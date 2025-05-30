import { ItemData, Tag } from "@/lib/content";
import { PER_PAGE } from "@/lib/paginate";

export function getTagId(tag: string | Tag): string {
  return typeof tag === "string" ? tag : tag.id;
}

type UseHome2LogicProps = {
  items: ItemData[];
  start: number;
};

export function useHomeTwoLogic({ items, start }: UseHome2LogicProps) {
  const paginatedItems = items.slice(start, start + PER_PAGE);

  return {
    items,
    paginatedItems,
  };
}
