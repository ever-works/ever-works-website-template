"use client";

import { useState } from "react";
import { DetailsForm } from "@/components/directory/details-form";



function SubmitPage() {

  const [formData, setFormData] = useState({
    link: "",
    name: "",
    category: "",
    tags: [] as string[],
    description: "",
    introduction: "",
  });


  const handleFormSubmit = (data: typeof formData) => {
    setFormData(data);
  };


  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300">
              <DetailsForm
                initialData={formData}
                onSubmit={handleFormSubmit}
                onBack={() => {}}
              />
    </div>
  );
}

export default SubmitPage;
