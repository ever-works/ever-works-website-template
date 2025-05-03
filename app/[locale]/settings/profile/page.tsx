import { auth } from "@/lib/auth";
import Image from "next/image";
import { FiCalendar, FiEdit2, FiKey, FiMail, FiUser } from "react-icons/fi";

async function ProfilePage() {
    const session = await auth();
    const joinDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="space-y-6">
                    {/* En-tête du profil */}
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

                    {/* Informations détaillées */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 space-y-6">
                            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 dark:text-gray-200">Informations Personnelles</h2>
                            
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Nom complet</p>
                                        <p className="font-medium dark:text-gray-200 text-gray-900">{session?.user?.name || "Non renseigné"}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <FiMail className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Adresse email</p>
                                        <p className="font-medium dark:text-gray-200 text-gray-900">{session?.user?.email}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <FiKey className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">ID Utilisateur</p>
                                        <p className="font-mono text-sm dark:text-gray-200 text-gray-900 dark:text-gray-400/20">{session?.user?.id}</p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                        <FiCalendar className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Membre depuis</p>
                                        <p className="font-medium dark:text-gray-200 text-gray-900">{joinDate}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfilePage;