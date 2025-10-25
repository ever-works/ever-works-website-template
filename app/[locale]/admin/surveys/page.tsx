import { Metadata } from 'next';
import { AdminSurveysClient } from '@/components/surveys/lists/admin-surveys-list';

export const metadata: Metadata = {
	title: 'Surveys | Admin',
	description: 'Manage all surveys'
};

export default function AdminSurveysPage() {
	return <AdminSurveysClient />;
}

