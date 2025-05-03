import { ProfileHeader, ProfileInfo } from "@/components/profil";
import { auth } from "@/lib/auth";


async function ProfilePage() {
    const session = await auth();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-6">
                    <ProfileHeader session={session} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ProfileInfo session={session} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;