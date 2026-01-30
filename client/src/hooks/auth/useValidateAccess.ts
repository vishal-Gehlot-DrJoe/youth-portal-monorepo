import { useMutation } from '@tanstack/react-query';
import { validateAccess, getUserRole, ValidateAccessResponse, GetUserRoleResponse } from '../../api/auth.api';
import { ApiException } from '../../types/api';

export function useValidateAccess() {
    const mutation = useMutation<ValidateAccessResponse, ApiException, string>({
        mutationFn: validateAccess,
    });

    return {
        validate: mutation.mutate,
        validateAsync: mutation.mutateAsync,
        data: mutation.data,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}


export function useGetUserRole() {
    const mutation = useMutation<GetUserRoleResponse, ApiException>({
        mutationFn: getUserRole,
    });

    return {
        fetchRole: mutation.mutate,
        fetchRoleAsync: mutation.mutateAsync,
        data: mutation.data,
        isLoading: mutation.isPending,
        isError: mutation.isError,
        error: mutation.error,
        reset: mutation.reset,
    };
}
