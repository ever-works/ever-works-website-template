import { Category } from "./content";

export function getItemPath(slug: string) {
  return `/items/${slug}`;
}

export function getCategoryName(category: string | Category) {
  if (typeof category === "string") {
    return category;
  }

  return category.name;
}

export function getCategoriesName(
  categories: Category | Category[] | string | string[]
) {
  if (Array.isArray(categories)) {
    return categories.map(getCategoryName).join(", ");
  }

  return getCategoryName(categories);
}

export function maskEmail(email: string) {
  if (!email) return "";

  const parts = email.split("@");
  if (parts.length !== 2) return email; // Not a valid email format

  const [username, domain] = parts;

  const maskedUsername =
    username.length <= 2
      ? username
      : `${username.slice(0, 2)}${"*".repeat(
          Math.min(username.length - 2, 3)
        )}`;

  return `${maskedUsername}@${domain}`;
}
