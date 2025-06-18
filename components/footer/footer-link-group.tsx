import Link from "next/link";

export function FooterLinkGroup({
  links,
  categoryLabel,
  animationDelay,
}: {
  links: Array<{
    label: string;
    href: string;
    target?: string;
    isExternal?: boolean;
  }>;
  categoryLabel: string;
  animationDelay: number;
  target?: string;
}) {
  return (
    <div
      className="space-y-4 sm:space-y-6 animate-fade-in-up"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
        {categoryLabel}
      </h4>
      <ul className="space-y-2 sm:space-y-3">
        {links.map((link, index) =>
          link.isExternal ? (
            <li key={index}>
              <Link
                target={link.target || "_blank"}
                href={link.href}
                className="group inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-all duration-300 hover:translate-x-2"
              >
                <span className="text-sm font-medium">{link.label}</span>
                <div className="w-0 h-px bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 group-hover:w-4 ml-0 group-hover:ml-2 transition-all duration-300" />
              </Link>
            </li>
          ) : (
            <li key={index}>
              <Link
                href={link.href}
                className="group inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-theme-primary-600 dark:hover:text-theme-primary-400 transition-all duration-300 hover:translate-x-2"
              >
                <span className="text-sm font-medium">{link.label}</span>
                <div className="w-0 h-px bg-gradient-to-r from-theme-primary-500 to-theme-primary-600 group-hover:w-4 ml-0 group-hover:ml-2 transition-all duration-300" />
              </Link>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
