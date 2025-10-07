export interface FormData {
  email: string;
  displayName: string;
  username: string;
  bio: string;
  jobTitle: string;
  company: string;
  industry: string;
  phone: string;
  website: string;
  location: string;
  accountType: 'individual' | 'business' | 'enterprise';
  timezone: string;
  language: string;
}

export interface StepProps {
  formData: FormData;
  errors: Record<string, string>;
  onInputChange: (field: keyof FormData, value: string) => void;
  mode: 'create' | 'edit';
}

export const inputBaseClasses = "w-full px-3 py-2 border rounded-md text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
export const inputErrorClasses = "border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700";
export const inputNormalClasses = "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white";
