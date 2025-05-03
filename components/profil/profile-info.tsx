import { FiUser, FiMail, FiKey, FiCalendar } from "react-icons/fi";
import { Session } from "next-auth";

interface ProfileInfoProps {
    session: Session | null;
}

export function ProfileInfo({ session }: ProfileInfoProps) {
    const joinDate = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-6 space-y-6">
            <h2 className="text-xl font-semibold text-gray-800 border-b pb-3 dark:text-gray-200">
                Informations Personnelles
            </h2>
            
            <div className="space-y-4">
                <InfoItem
                    icon={<FiUser className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    label="Nom complet"
                    value={session?.user?.name || "Non renseigné"}
                />

                <InfoItem
                    icon={<FiMail className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    label="Adresse email"
                    value={session?.user?.email || ""}
                />

                <InfoItem
                    icon={<FiKey className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    label="ID Utilisateur"
                    value={session?.user?.id || ""}
                    isMonospace
                />

                <InfoItem
                    icon={<FiCalendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                    label="Membre depuis"
                    value={joinDate}
                />
            </div>
        </div>
    );
}

interface InfoItemProps {
    icon: React.ReactNode;
    label: string;
    value: string;
    isMonospace?: boolean;
}

function InfoItem({ icon, label, value, isMonospace = false }: InfoItemProps) {
    return (
        <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                {icon}
            </div>
            <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                <p className={`font-medium dark:text-gray-200 text-gray-900 ${isMonospace ? 'font-mono text-sm' : ''}`}>
                    {value}
                </p>
            </div>
        </div>
    );
}
