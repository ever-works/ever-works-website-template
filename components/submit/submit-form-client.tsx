'use client';

import { DetailsForm } from "@/components/directory/details-form";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface SubmitFormClientProps {
  initialData: {
    items: any[];
    categories: any[];
    tags: any[];
  };
  locale: string;
}

export function SubmitFormClient({ initialData, locale }: SubmitFormClientProps) {
  const router = useRouter();

  const handleFormSubmit = async (data: any) => {
    try {
      console.log('Form submitted with data:', data);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Error submitting form. Please try again.');
    }
  };

  const handleBack = () => {
    router.push(`/${locale}/submit`);
  };

  return (
<>
  <DetailsForm
      onSubmit={handleFormSubmit}
      onBack={handleBack}
      listingProps={initialData}
    />


</>
  );
}
