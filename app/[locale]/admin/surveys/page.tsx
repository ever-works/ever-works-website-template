import { Metadata } from 'next';
import { AdminSurveysClient } from '@/components/surveys/lists/admin-surveys-list';
import { cleanUrl } from '@/lib/utils/url-cleaner';

const appUrl = cleanUrl(
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://demo.ever.works")
);

export const metadata: Metadata = {
	metadataBase: new URL(appUrl),
	title: 'Surveys | Admin',
	description: 'Manage all surveys'
};

export default function AdminSurveysPage() {
	return <AdminSurveysClient />;
}
