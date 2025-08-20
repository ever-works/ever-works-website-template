import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ExtendedUser } from "@/types/profile-button.types";
import { getProfilePath, getDisplayRole, getOnlineStatus } from "@/utils/profile-button.utils";

export function useUserUtils() {
  const { user, isLoading } = useCurrentUser();

  // Memoize user data processing
  const userData = useMemo(() => {
    if (!user) return null;

    const extendedUser = user as ExtendedUser;
    const profilePath = getProfilePath(extendedUser);
    const isAdmin = user.isAdmin === true;
    const displayRole = getDisplayRole(isAdmin);
    const onlineStatus = getOnlineStatus();

    return {
      user: extendedUser,
      profilePath,
      isAdmin,
      displayRole,
      onlineStatus,
    };
  }, [user]);

  return {
    user: userData?.user || null,
    profilePath: userData?.profilePath || "",
    isAdmin: userData?.isAdmin || false,
    displayRole: userData?.displayRole || "User",
    onlineStatus: userData?.onlineStatus || "Online",
    isLoading,
  };
}
