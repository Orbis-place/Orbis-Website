'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface EntityAvatarProps {
    /** Entity image/icon URL */
    src?: string | null;
    /** Entity name for alt text and fallback initials */
    name: string;
    /** Additional className for the Avatar container */
    className?: string;
    /** className for the AvatarImage */
    imageClassName?: string;
    /** className for the AvatarFallback */
    fallbackClassName?: string;
    /** Fallback variant style */
    variant?: 'user' | 'team' | 'resource' | 'server' | 'default';
}

/**
 * Get initials from a name (first letter of each word, max 2 characters)
 */
function getInitials(name: string): string {
    if (!name) return '??';
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

const variantStyles = {
    user: 'bg-gradient-to-br from-primary to-primary/70 text-white',
    team: 'bg-gradient-to-br from-primary/20 to-secondary/20 text-foreground',
    resource: 'bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1] text-[#C7F4FA]',
    server: 'bg-gradient-to-br from-[#06363D] via-[#084B54] to-[#109EB1] text-[#C7F4FA]',
    default: 'bg-gradient-to-br from-primary to-primary/70 text-white',
};

/**
 * EntityAvatar - A universal avatar component for users, teams, resources, etc.
 * Automatically falls back to initials if no image is provided.
 * 
 * @example
 * ```tsx
 * // User avatar
 * <EntityAvatar 
 *   src={user.image} 
 *   name={user.displayName || user.username}
 *   variant="user"
 *   className="h-12 w-12"
 * />
 * 
 * // Team avatar
 * <EntityAvatar 
 *   src={team.logo} 
 *   name={team.name}
 *   variant="team"
 *   className="h-12 w-12"
 * />
 * 
 * // Resource icon
 * <EntityAvatar 
 *   src={resource.iconUrl} 
 *   name={resource.name}
 *   variant="resource"
 *   className="h-32 w-32 rounded-[25px]"
 * />
 * ```
 */
export function EntityAvatar({
    src,
    name,
    className,
    imageClassName,
    fallbackClassName,
    variant = 'default',
}: EntityAvatarProps) {
    return (
        <Avatar className={className}>
            <AvatarImage
                src={src || undefined}
                alt={name}
                className={imageClassName}
            />
            <AvatarFallback
                className={cn(
                    variantStyles[variant],
                    "font-hebden",
                    fallbackClassName
                )}
            >
                {getInitials(name)}
            </AvatarFallback>
        </Avatar>
    );
}
