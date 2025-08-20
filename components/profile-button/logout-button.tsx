import { LogOut, Zap } from "lucide-react";

interface LogoutButtonProps {
  onLogout: () => void;
  logoutText: string;
}

export function LogoutButton({ onLogout, logoutText }: LogoutButtonProps) {
  return (
    <button
      onClick={onLogout}
      className="group flex w-full items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-900/10 dark:hover:to-pink-900/10 transition-all duration-200"
      role="menuitem"
    >
      <div className="flex items-center justify-center w-10 h-10 mr-3 rounded-xl bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-900/30 dark:to-pink-900/30 group-hover:from-red-200 group-hover:to-pink-200 dark:group-hover:from-red-900/40 dark:group-hover:to-pink-900/40 transition-all duration-200">
        <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
      </div>
      <div className="flex-1">
        <span className="font-semibold">{logoutText}</span>
        <p className="text-xs text-gray-500 dark:text-gray-400">Sign out of your account</p>
      </div>
      <Zap className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
    </button>
  );
}
