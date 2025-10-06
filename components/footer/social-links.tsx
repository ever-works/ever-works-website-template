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

export const footerNavigation = (t: any) => {
  return {
    product: [
      { label: t("common.CATEGORY"), href: "/categories" },
      { label: t("common.TAG"), href: "/tags" },
      { label: t("footer.PRICING"), href: "/pricing" },
      { label: t("footer.HELP"), href: "/help" },
    ],
    company: [
      { label: t("footer.ABOUT_US"), href: "/about" },
      { label: t("footer.PRIVACY_POLICY"), href: "/privacy-policy" },
      { label: t("footer.TERMS_OF_SERVICE"), href: "/terms-of-service" },
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

export const categoryLabels = (t: any) => ({
  product: t("footer.PRODUCT"),
  company: t("footer.COMPANY"),
  resources: t("footer.RESOURCES"),
});
