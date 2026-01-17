"use client"

import * as React from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { XIcon } from "lucide-react"

interface OrbisDialogProps {
    open?: boolean
    onOpenChange?: (open: boolean) => void
    trigger?: React.ReactNode
    title?: string
    description?: string
    children: React.ReactNode
    footer?: React.ReactNode
    showCloseButton?: boolean
    className?: string
    size?: "sm" | "md" | "lg" | "xl" | "full"
    hideHeader?: boolean
}

/**
 * OrbisDialog - Composant dialog personnalisé pour Orbis
 * 
 * @example
 * ```tsx
 * <OrbisDialog
 *   trigger={<Button>Open Dialog</Button>}
 *   title="Dialog Title"
 *   description="Dialog description"
 *   footer={
 *     <>
 *       <Button variant="outline">Cancel</Button>
 *       <Button>Confirm</Button>
 *     </>
 *   }
 * >
 *   Content goes here
 * </OrbisDialog>
 * ```
 */
export function OrbisDialog({
    open,
    onOpenChange,
    trigger,
    title,
    description,
    children,
    footer,
    showCloseButton = true,
    className,
    size = "md",
    hideHeader = false,
}: OrbisDialogProps) {
    const sizeClasses = {
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-2xl",
        full: "sm:max-w-[90vw]",
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent
                className={cn(
                    // Base styles
                    "bg-[#06363D] border-2 border-[#084B54] rounded-[25px]",
                    // Shadow with Orbis colors
                    "shadow-2xl shadow-primary/10",
                    // Size
                    sizeClasses[size],
                    // Custom className
                    className
                )}
                showCloseButton={false}
            >
                {/* Custom close button matching Orbis style */}
                {showCloseButton && (
                    <DialogClose className="absolute right-6 top-6 rounded-full p-2 bg-secondary/50 hover:bg-secondary transition-colors border border-border/50 hover:border-border group">
                        <XIcon className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <span className="sr-only">Close</span>
                    </DialogClose>
                )}

                {/* Header with gradient accent */}
                {!hideHeader && (title || description) && (
                    <DialogHeader className="space-y-3 pb-4 border-b border-border/30">
                        {title && (
                            <DialogTitle className="font-hebden text-2xl font-bold text-foreground flex items-center gap-3">
                                <span className="w-1 h-6 bg-gradient-to-b from-primary to-primary/50 rounded-full" />
                                {title}
                            </DialogTitle>
                        )}
                        {description && (
                            <DialogDescription className="font-nunito text-sm text-muted-foreground/80 ml-4">
                                {description}
                            </DialogDescription>
                        )}
                    </DialogHeader>
                )}

                {/* Accessibility: Render hidden title if header is hidden */}
                {hideHeader && title && (
                    <DialogTitle className="sr-only">{title}</DialogTitle>
                )}

                {/* Content */}
                <div className="py-4 font-nunito text-foreground/90">
                    {children}
                </div>

                {/* Footer */}
                {footer && (
                    <DialogFooter className="pt-4 border-t border-border/30 gap-3">
                        {footer}
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
}

/* Variant: Confirmation Dialog */
interface OrbisConfirmDialogProps extends Omit<OrbisDialogProps, 'footer' | 'children'> {
    children?: React.ReactNode
    onConfirm: () => void
    onCancel?: () => void
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    confirmLoading?: boolean
}

export function OrbisConfirmDialog({
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'default',
    confirmLoading = false,
    children,
    ...props
}: OrbisConfirmDialogProps) {
    const handleCancel = () => {
        onCancel?.();
        props.onOpenChange?.(false);
    };

    return (
        <OrbisDialog
            {...props}
            children={children || <></>}
            footer={
                <>
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-border bg-secondary/30 hover:bg-secondary text-foreground transition-all"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={confirmLoading}
                        className={cn(
                            "px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 transition-all flex items-center gap-2",
                            variant === 'destructive'
                                ? "bg-destructive hover:bg-destructive/90 border-destructive text-destructive-foreground"
                                : "bg-primary hover:bg-primary/90 border-primary text-primary-foreground",
                            confirmLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {confirmLoading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {confirmText}
                    </button>
                </>
            }
        />
    )
}

/* Variant: Form Dialog */
interface OrbisFormDialogProps extends Omit<OrbisDialogProps, 'footer'> {
    onSubmit: (e: React.FormEvent) => void
    submitText?: string
    submitLoading?: boolean
    showCancelButton?: boolean
    onCancel?: () => void
}

export function OrbisFormDialog({
    onSubmit,
    submitText = "Submit",
    submitLoading = false,
    showCancelButton = true,
    onCancel,
    children,
    ...props
}: OrbisFormDialogProps) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSubmit(e)
    }

    const handleCancel = () => {
        onCancel?.();
        props.onOpenChange?.(false);
    };

    return (
        <OrbisDialog
            {...props}
            footer={
                <form onSubmit={handleSubmit} className="w-full flex justify-end gap-3">
                    {showCancelButton && (
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-border bg-secondary/30 hover:bg-secondary text-foreground transition-all"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={submitLoading}
                        className={cn(
                            "px-4 py-2 rounded-full font-hebden font-semibold text-sm border-2 border-primary bg-primary hover:bg-primary/90 text-primary-foreground transition-all flex items-center gap-2",
                            submitLoading && "opacity-50 cursor-not-allowed"
                        )}
                    >
                        {submitLoading && (
                            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {submitText}
                    </button>
                </form>
            }
        >
            {children}
        </OrbisDialog>
    )
}
