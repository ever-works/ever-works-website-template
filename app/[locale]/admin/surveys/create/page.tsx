import { CreateEditSurveyClient } from '@/components/surveys/admin/create-edit-survey-client';

interface CreateSurveyPageProps {
	searchParams: {
		itemId?: string;
	};
}

export default async function CreateSurveyPage({ searchParams }: CreateSurveyPageProps) {
	const params = searchParams;

	return (
		<CreateEditSurveyClient
			defaultItemId={params.itemId}
		/>
	);
}

