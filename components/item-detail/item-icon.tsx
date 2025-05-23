import Image from "next/image";

interface ItemIconProps {
  iconUrl?: string;
  name: string;
}

export function ItemIcon({ iconUrl, name }: ItemIconProps) {
  const iconContainerStyles =
    "absolute inset-0 bg-white/5 backdrop-blur-xl rounded-xl overflow-hidden flex items-center justify-center p-4 shadow-lg border border-white/10 group transition-all duration-300 hover:bg-white/10 dark:bg-dark-800/20 dark:border-white/5 dark:hover:bg-dark-800/30 dark:shadow-dark-950/50 hover:scale-105 dark:hover-glow dark:glassmorphism dark:border-glow";

  return (
    <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 relative">
      <div className={iconContainerStyles}>
        {iconUrl ? (
          <Image
            src={iconUrl}
            alt={`${name} icon`}
            width={100}
            height={100}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-md dark:drop-shadow-lg dark:filter-brightness-110"
          />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-12 h-12 text-white/70 group-hover:text-white transition-all duration-300 drop-shadow-sm group-hover:drop-shadow-md dark:text-white/80 dark:group-hover:text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
