import { FiBookOpen, FiFacebook, FiLinkedin, FiMail } from "react-icons/fi";
import { IconGithub, IconX } from "../icons/Icons";
import { siteConfig } from "@/lib/config";

export const socialLinks = [
  {
    icon: IconGithub,
    href: siteConfig.social.github,
    label: "GitHub",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: IconX,
    href: siteConfig.social.x,
    label: "X",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiLinkedin,
    href: siteConfig.social.linkedin,
    label: "LinkedIn",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiFacebook,
    href: siteConfig.social.facebook,
    label: "Facebook",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiBookOpen,
    href: siteConfig.social.blog,
    label: "Blog",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiMail,
    href: `mailto:${siteConfig.social.email}`,
    label: "Email",
    isMailto: true,
  },
].filter(link => link.href && link.href !== '');

export function footerNavigation(t: (key: string) => string, categoriesEnabled = true, tagsEnabled = true) {
  const productLinks = [
    { label: t("common.COLLECTION"), href: "/collections" },
    { label: t("common.CATEGORY"), href: "/categories" },
    { label: t("common.TAG"), href: "/tags" },
    { label: t("common.PRICING"), href: "/pricing" },
    { label: t("footer.HELP"), href: "/help" },
  ];

  const filteredProductLinks = productLinks.filter(link => {
    if (link.href === "/categories" && !categoriesEnabled) return false;
    if (link.href === "/tags" && !tagsEnabled) return false;
    return true;
  });

  return {
    product: filteredProductLinks,
    clients: [
      { label: t("auth.SIGN_IN"), href: "/auth/signin" },
      { label: t("footer.REGISTER"), href: "/auth/register" },
      { label: t("auth.FORGOT_PASSWORD"), href: "/auth/forgot-password" },
    ],
    company: [
      { label: t("footer.ABOUT_US"), href: "/about" },
      { label: t("footer.ADMIN"), href: "/admin" },
      {
        label: t("footer.SITEMAP"),
        href: "/sitemap.xml",
        target: "_blank",
        rel: "noopener noreferrer",
        isExternal: true
      },
    ],
    resources: [
      { label: t("footer.BLOG"), href: siteConfig.social.blog, isExternal: true },
      { label: t("common.SUBMIT"), href: "/submit?step=details&plan=free" },
      { label: t('help.DOCS_PAGE_TITLE'), href: "/docs" },
    ],
  };
};

export function categoryLabels(t: (key: string) => string) {
  return {
    product: t("footer.PRODUCT"),
    clients: t("footer.CLIENTS"),
    company: t("footer.COMPANY"),
    resources: t("footer.RESOURCES"),
  };
}
