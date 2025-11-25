import { cn } from "@/lib/utils";
import { Input } from "@heroui/react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  className?: string;
}

export const SearchInput = ({
  searchTerm,
  setSearchTerm,
  className,
}: SearchInputProps) => {
  return (
    <div className="relative">
      <div
        className={cn(
          "bg-gray-100 dark:bg-gray-900/90 backdrop-blur-md rounded-lg px-1 border border-gray-200 dark:border-gray-700/30 transition-all duration-300 hover:shadow-md",
          className
        )}
      >
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        </div>
        <Input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 w-full"
          style={{ background: "transparent" }}
          maxLength={20}
          classNames={{
            base: "bg-transparent!",
            input:
              "bg-transparent! text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm",
            inputWrapper:
              "bg-transparent! border-none shadow-none focus-within:ring-0 focus-within:shadow-none hover:bg-transparent dark:hover:bg-transparent",
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
