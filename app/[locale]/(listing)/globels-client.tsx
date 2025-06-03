"use client";
import { useLayoutTheme } from "@/components/context";
import { Categories, Paginate, Tags } from "@/components/filters";
import { Tag, Category, ItemData } from "@/lib/content";
import { sortByNumericProperty } from "@/lib/utils";
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
  const sortedTags = sortByNumericProperty(props.tags);

  return layoutHome === "Home_1" ? (
    <div className=" px-4 pb-12">
      <div className="flex flex-col md:flex-row w-full gap-5">
        <div className="md:sticky md:top-4 md:self-start">
          <Categories total={props.total} categories={props.categories} />
        </div>
        <div className="w-full">
          <Tags tags={sortedTags} />
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
