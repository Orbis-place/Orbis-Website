import { toast as sonnerToast } from 'svelte-sonner';

/**
 * Toast utility functions
 * Wraps svelte-sonner for consistent toast notifications
 */
export const toast = {
    success: (message: string, description?: string) => {
        sonnerToast.success(message, { description });
    },
    error: (message: string, description?: string) => {
        sonnerToast.error(message, { description });
    },
    info: (message: string, description?: string) => {
        sonnerToast.info(message, { description });
    },
    warning: (message: string, description?: string) => {
        sonnerToast.warning(message, { description });
    },
    loading: (message: string, description?: string) => {
        return sonnerToast.loading(message, { description });
    },
    promise: <T>(
        promise: Promise<T>,
        options: {
            loading: string;
            success: string | ((data: T) => string);
            error: string | ((error: any) => string);
        }
    ) => {
        return sonnerToast.promise(promise, options);
    }
};
