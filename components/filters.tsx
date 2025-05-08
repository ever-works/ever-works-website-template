"use client";

import { Category, Tag } from "@/lib/content";
import {
  Accordion,
  AccordionItem,
  Button,
  cn,
  Pagination,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { PropsWithChildren } from "react";
import Image from "next/image";

function BlockLink({
  href,
  isActive,
  children,
}: PropsWithChildren<{ href: string; isActive: boolean }>) {
  return (
    <Button
      className={cn(
        "text-black dark:text-white font-medium text-left justify-start items-center",
        { "bg-primary-50 data-[hover]:bg-primary-100": isActive }
      )}
      radius="sm"
      variant="light"
      as={Link}
      href={href}
    >
      {children}
    </Button>
  );
}

export function CategoriesList({
  categories,
  total,
}: {
  total: number;
  categories: Category[];
}) {
  const t = useTranslations("listing");
  const pathname = usePathname();

  return (
    <>
      <BlockLink
        isActive={pathname === "/" || pathname.startsWith("/discover")}
        href="/"
      >
        {t("ALL")} ({total})
      </BlockLink>
      {categories.map((category) => {
        if (!category.count) return null;

        const href = `/categories/${category.id}`;
        return (
          <BlockLink
            isActive={pathname.startsWith(encodeURI(href))}
            key={category.id}
            href={href}
          >
            {category.icon_url && (
              <Image
                src={category.icon_url}
                width={20}
                height={20}
                className="w-5 h-5"
                alt={category.name}
              />
            )}
            {category.name} ({category.count || 0})
          </BlockLink>
        );
      })}
    </>
  );
}

export function Categories(props: { total: number; categories: Category[] }) {
  const t = useTranslations("listing");

  return (
    <>
      <div className="md:hidden">
        <Accordion variant="bordered">
          <AccordionItem key="1" aria-label="Category" title="Categories">
            <div className="flex flex-col gap-2">
              <CategoriesList {...props} />
            </div>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="hidden md:flex flex-col w-full max-w-56 gap-2">
        <h2 className="font-bold mb-2">{t("CATEGORIES")}</h2>
        <CategoriesList {...props} />
      </div>
    </>
  );
}

export function Paginate({
  basePath,
  initialPage,
  total,
}: {
  basePath: string;
  initialPage: number;
  total: number;
}) {
  const router = useRouter();

  function redirect(page: number) {
    const path = basePath + (page === 1 ? "" : `/${page}`);
    router.push(path);
  }

  return (
    <Pagination
      isCompact
      showControls
      initialPage={initialPage}
      total={total}
      onChange={redirect}
    />
  );
}

export function Tags(props: { tags: Tag[] }) {
  const pathname = usePathname();

  return (
    <div className="w-fill flex gap-2 flex-wrap">
      {props.tags.map((tag) => (
        <Button
          key={tag.id}
          variant={
            pathname.startsWith(encodeURI(`/tags/${tag.id}`))
              ? "solid"
              : "bordered"
          }
          color="default"
          size="sm"
          as={Link}
          href={`/tags/${tag.id}`}
        >
          {tag.icon_url && (
            <Image
              src={tag.icon_url}
              width={20}
              height={20}
              className="w-4 h-4"
              alt={tag.name}
            />
          )}
          {tag.name}
        </Button>
      ))}
    </div>
  );
}
