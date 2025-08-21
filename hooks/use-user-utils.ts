import { useMemo } from "react";
import { useCurrentUser } from "@/hooks/use-current-user";
import { getProfilePath, getDisplayRole, getOnlineStatus } from "@/utils/profile-button.utils";

export function useUserUtils() {
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
    profilePath: userData?.profilePath || "",
    isAdmin: userData?.isAdmin || false,
    displayRole: userData?.displayRole || "User",
    onlineStatus: userData?.onlineStatus || "Online",
    isLoading,
  };
}
