import { useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { apiClient } from '@/lib/api/api-client';

// Endpoint for the Ever-Works API
const EXTRACTION_API_ENDPOINT = 'http://localhost:3100/api/extract-item-details';

interface ExtractionResult {
	name: string;
	description: string;
	category?: string;
	tags?: string[];
	brand?: string;
	brand_logo_url?: string;
	images?: string[];
}

interface UseUrlExtractionReturn {
	isLoading: boolean;
	extractFromUrl: (url: string, existingCategories?: string[], token?: string) => Promise<ExtractionResult | null>;
}

interface ExtractionParams {
	url: string;
	existingCategories?: string[];
	token?: string;
}

export function useUrlExtraction(): UseUrlExtractionReturn {
	const queryClient = useQueryClient();

	const mutation = useMutation({
		mutationFn: async ({ url, existingCategories, token }: ExtractionParams) => {
			if (!url) throw new Error('No URL provided');

			const headers: Record<string, string> = {};

			if (token) {
				headers['Authorization'] = `Bearer ${token}`;
			}
			return queryClient.fetchQuery({
				queryKey: ['extract-metadata', url],
				queryFn: async () => {
					const response = await apiClient.post<{ success: boolean; data: ExtractionResult }>(
						EXTRACTION_API_ENDPOINT,
						{
							source_url: url,
							existing_data:
								existingCategories && existingCategories.length > 0 ? existingCategories : undefined
						},
						{ headers }
					);

					if (!response.success) {
						throw new Error('Failed to extract data');
					}

					return response.data;
				},
				staleTime: 1000 * 60 * 60 // Cache for 1 hour
			});
		},
		onError: (error) => {
			console.error('Extraction error:', error);
			toast.error('Failed to extract data from URL');
		}
	});

	const extractFromUrl = async (
		url: string,
		existingCategories?: string[],
		token?: string
	): Promise<ExtractionResult | null> => {
		try {
			return await mutation.mutateAsync({ url, existingCategories, token });
		} catch {
			return null;
		}
	};

	return {
		isLoading: mutation.isPending,
		extractFromUrl
	};
}
