import { isServer, QueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';


export function createQueryClientInstance(): QueryClient {
	return new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 1000 * 60 * 5, 
				gcTime: 1000 * 60 * 60 * 24, 
				refetchOnWindowFocus: false,
				retry: 1 
			},
			mutations: {
				onError: (error) => {
					const message = error.message;
					toast.error(`Mutation Error: ${message}`);
					console.error('Global Mutation Error:', error);
				}
			}
		}
	});
}

let browserQueryClient: QueryClient | undefined = undefined;

export const getQueryClient = () => {
	if (isServer) {
		return createQueryClientInstance();
	} else {
		if (!browserQueryClient) browserQueryClient = createQueryClientInstance();
		return browserQueryClient;
	}
};
