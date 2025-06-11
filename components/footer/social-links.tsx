import { FiBookOpen, FiFacebook, FiLinkedin, FiMail } from "react-icons/fi";
import { IconGithub, IconX } from "../icons/Icons";

export const socialLinks = [
  {
    icon: IconGithub,
    href: "https://github.com/ever-works",
    label: "GitHub",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: IconX,
    href: "https://x.com/everplatform",
    label: "X",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiLinkedin,
    href: "https://www.linkedin.com/company/everhq",
    label: "LinkedIn",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiFacebook,
    href: "https://www.facebook.com/everplatform",
    label: "Facebook",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiBookOpen,
    href: "https://blog.ever.works",
    label: "Blog",
    target: "_blank",
    rel: "noopener noreferrer",
    isExternal: true,
  },
  {
    icon: FiMail,
    href: "mailto:ever@ever.works",
    label: "Email",
    isMailto: true,
  },
];

export const categoryLabels = (t: any) => ({
  product: t("footer.PRODUCT"),
  resources: t("footer.RESOURCES"),
  pages: t("footer.PAGES"),
  company: t("footer.COMPANY"),
});

export const footerNavigation = (t: any) => {
  return {
    product: [
      { label: t("common.CATEGORY"), href: "/categorie" },
      { label: t("common.TAG"), href: "/tag" },
    ],
    resources: [
      { label: t("footer.BLOG"), href: "https://blog.ever.works" },
      { label: t("footer.PRICING"), href: "/pricing" },
      { label: t("common.SUBMIT"), href: "/submit?step=details&plan=free" },

    ],
    pages: [
      { label: t("common.HOME"), href: "/" },
      { label: t("common.DISCOVER"), href: "/discover" },
    ],
    company: [
      { label: t("footer.ABOUT_US"), href: "/about" },
      { label: t("footer.PRIVACY_POLICY"), href: "/privacy-policy" },
      { label: t("footer.TERMS_OF_SERVICE"), href: "/terms-of-service" },
      { label: t("footer.SITEMAP"), href: "/sitemap" },
    ],
  };
};
