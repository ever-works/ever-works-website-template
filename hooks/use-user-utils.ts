import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getProfilePath, getDisplayRole, getOnlineStatus } from "@/utils/profile-button.utils";
import type { ExtendedUser } from "@/types/profile-button.types";

export type UseUserUtilsResult = {
  user: ExtendedUser | null;
  profilePath: string;
  isAdmin: boolean;
  displayRole: string;
  onlineStatus: string;
  isLoading: boolean;
};

export function useUserUtils(): UseUserUtilsResult {
  const { user, isLoading } = useCurrentUser();

  // Memoize user data processing
  const userData = useMemo(() => {
    if (!user) return null;

    const profilePath = getProfilePath(user);
    const isAdmin = user.isAdmin === true;
    const displayRole = getDisplayRole(isAdmin);
    const onlineStatus = getOnlineStatus();

    return {
      user,
      profilePath,
      isAdmin,
      displayRole,
      onlineStatus,
    };
  }, [user]);

  return {
    user: userData?.user || null,
    profilePath: userData?.profilePath || "/client/profile/profile",
    isAdmin: userData?.isAdmin || false,
    displayRole: userData?.displayRole || "User",
    onlineStatus: userData?.onlineStatus || "Online",
    isLoading,
  };
}
