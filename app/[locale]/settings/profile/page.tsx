import { ProfileHeader, ProfileInfo } from "@/components/profil";
import { auth } from "@/lib/auth";


async function ProfilePage() {
    const session = await auth();
    
    if (!session) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm text-center">
                    <h2 className="text-xl font-semibold">Authentication Required</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please sign in to view your profile settings.</p>
                </div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-6">
                    <ProfileHeader session={session} />
                    <div className="grid grid-cols-1 gap-6">
                        <ProfileInfo session={session} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;