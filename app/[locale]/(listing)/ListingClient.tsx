"use client";

import { useLayoutTheme } from "@/components/context/LayoutThemeContext";
import { Listing } from "./listing";

export default function ListingClient(
  props: React.ComponentProps<typeof Listing>
) {
  const { layoutKey } = useLayoutTheme();
  return <Listing {...props} layoutKey={layoutKey} />;
}
