'use client';

import { serverClient, apiUtils } from '@/lib/api/server-api-client';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

interface ExtractionResult {
	name: string;
	description: string;
	category?: string;
	tags?: string[];
	brand?: string;
	brand_logo_url?: string;
	images?: string[];
}

interface ExtractItemDetailsResponse {
	data: ExtractionResult;
	success: boolean;
}

interface UseUrlExtractionReturn {
	isLoading: boolean;
	extractFromUrl: (url: string, existingCategories?: string[]) => Promise<ExtractionResult | null>;
}

interface ExtractionParams {
	url: string;
	existingCategories?: string[];
}

export function useUrlExtraction(): UseUrlExtractionReturn {
	const mutation = useMutation({
		mutationFn: async ({ url, existingCategories }: ExtractionParams) => {
			if (!url) throw new Error('No URL provided');

			console.debug('Extracting metadata for', url);
			const response = await serverClient.post<ExtractItemDetailsResponse>(
				'/extract-item-details',
				{
					source_url: url,
					existing_data: existingCategories && existingCategories.length > 0 ? existingCategories : undefined
				},
				{ isApiCall: true }
			);

			if (!apiUtils.isSuccess(response)) {
				console.error('HTTP request failed for URL extraction', response);
				throw new Error(apiUtils.getErrorMessage(response));
			}

			if (!response.data.success) {
				console.error('API-level error during extraction', response.data);
				throw new Error('Failed to extract data: API reported failure');
			}

			return response.data.data;
		},
		onError: (error) => {
			console.error('Extraction error:', error);
			toast.error(error instanceof Error ? error.message : 'Failed to extract data from URL');
		}
	});

	const extractFromUrl = async (url: string, existingCategories?: string[]): Promise<ExtractionResult | null> => {
		try {
			return await mutation.mutateAsync({ url, existingCategories });
		} catch {
			console.error('Failed to extract data from URL');
			toast.error('Failed to extract data from URL');
			return null;
		}
	};

	return {
		isLoading: mutation.isPending,
		extractFromUrl
	};
}
