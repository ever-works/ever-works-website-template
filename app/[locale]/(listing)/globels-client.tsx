"use client";
import { useLayoutTheme } from "@/components/context";
import { Categories, Paginate, Tags } from "@/components/filters";
import { Tag } from "@/lib/content";
import { Category } from "@/lib/content";
import { ItemData } from "@/lib/content";
import { totalPages } from "@/lib/paginate";
import { ListingClient } from "./listing-client";
import { HomeTwoLayout, useHomeTwoLogic } from "@/components/home-two";

type ListingProps = {
  total: number;
  start: number;
  page: number;
  basePath: string;
  categories: Category[];
  tags: Tag[];
  items: ItemData[];
};

export default function GlobelsClient(props: ListingProps) {
  const { layoutHome } = useLayoutTheme();
  const homeTwoLogic = useHomeTwoLogic({
    ...props,
  });
  return layoutHome === "Home_1" ? (
    <div className="container mx-auto px-6 pb-12">
      <div className="flex flex-col md:flex-row w-full gap-5">
        <Categories total={props.total} categories={props.categories} />
        <div className="w-full">
          <Tags tags={props.tags} />
          <ListingClient {...props} />
          <div className="flex items-center justify-center">
            <Paginate
              basePath={props.basePath}
              initialPage={props.page}
              total={totalPages(props.items.length)}
            />
          </div>
        </div>
      </div>
    </div>
  ) : layoutHome === "Home_2" ? (
    <HomeTwoLayout
      {...props}
      filteredAndSortedItems={homeTwoLogic.items}
      paginatedItems={homeTwoLogic.paginatedItems}
    />
  ) : (
    <div>
      <HomeTwoLayout
        {...props}
        filteredAndSortedItems={homeTwoLogic.items}
        paginatedItems={homeTwoLogic.paginatedItems}
      />
    </div>
  );
}
