import Image from "next/image";
import { FiEdit2 } from "react-icons/fi";
import { Session } from "next-auth";

interface ProfileHeaderProps {
    session: Session | null;
}

export function ProfileHeader({ session }: ProfileHeaderProps) {
    return (
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-600 dark:from-indigo-800 dark:bg-indigo-800 rounded-xl p-8 text-white">
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-8">
                <div className="relative w-32 h-32">
                    {session?.user?.image ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden ring-4 ring-white/50 dark:ring-white/10">
                            <Image
                                src={session.user.image}
                                alt="Photo de profil"
                                fill
                                className="object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full rounded-full bg-white/10 ring-4 ring-white/50 flex items-center justify-center">
                            <span className="text-4xl font-semibold">
                                {session?.user?.name?.[0] || "U"}
                            </span>
                        </div>
                    )}
                    <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors">
                        <FiEdit2 className="w-4 h-4 text-blue-600" />
                    </button>
                </div>
                <div className="text-center md:text-left">
                    <h1 className="text-3xl font-bold">{session?.user?.name || "Utilisateur"}</h1>
                    <p className="text-blue-100 mt-1">Membre Premium</p>
                </div>
            </div>
        </div>
    );
}
