import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getYouthEmails,
    addYouthEmail,
    bulkUploadYouthEmails,
    updateYouthEmailStatus,
    deleteYouthEmails,
    GetYouthEmailsParams
} from '../../api/youth.api';

export const YOUTH_EMAILS_QUERY_KEY = ['youth-emails'];

export const useYouthEmails = (params: GetYouthEmailsParams) => {
    return useQuery({
        queryKey: [...YOUTH_EMAILS_QUERY_KEY, params],
        queryFn: () => getYouthEmails(params),
        staleTime: 1000 * 60 * 5, 
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
    });
};

export const useAddYouthEmail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: addYouthEmail,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: YOUTH_EMAILS_QUERY_KEY });
        },
    });
};

export const useBulkUploadYouthEmails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: bulkUploadYouthEmails,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: YOUTH_EMAILS_QUERY_KEY });
        },
    });
};

export const useUpdateYouthEmailStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ids, isActive }: { ids: string[], isActive: boolean }) =>
            updateYouthEmailStatus(ids, isActive),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: YOUTH_EMAILS_QUERY_KEY });
        },
    });
};

export const useDeleteYouthEmails = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteYouthEmails,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: YOUTH_EMAILS_QUERY_KEY });
        },
    });
};
