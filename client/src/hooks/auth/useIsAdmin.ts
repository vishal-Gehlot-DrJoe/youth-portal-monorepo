import { useMutation } from '@tanstack/react-query';
import { validateAccess } from '../../api/auth.api';
import { ApiException } from '../../types/api';

interface UseIsAdminResult {
    checkAdmin: (email: string) => void;
    checkAdminAsync: (email: string) => Promise<boolean>;
    isAdmin: boolean;
    isLoading: boolean;
    isError: boolean;
    error: ApiException | null;
}

export function useIsAdmin(): UseIsAdminResult {
    const mutation = useMutation<boolean, ApiException, string>({
        mutationFn: async (email: string) => {
            const response = await validateAccess(email);
            return response.role === 'admin';
        },
    });

    return {
        checkAdmin: mutation.mutate,
        checkAdminAsync: mutation.mutateAsync,
        isAdmin: mutation.data ?? false,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error ?? null,
    };
}
