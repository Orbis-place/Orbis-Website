'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { getPublicCollections, type UserCollection, type Resource } from '@/lib/api/resources';
import { EntityAvatar } from '@/components/EntityAvatar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/contexts/UserContext';
// Reusing components from the dashboard collections page but read-only
export default function UserCollectionsPage() {
    const params = useParams();
    const username = params.username as string;
    const { user: currentUser } = useUser();

    // We need the user ID. Since we only have username from params, 
    // and the getPublicCollections API expects userId, we might need a way to get userId from username 
    // OR update the API to iterate by username.
    // For now assuming we can fetch the user profile first or the API supports username lookup?
    // Actually the backend `getPublicCollectionsByUser` takes userId.
    // The profile layout likely fetches the user data.
    // But since we are in a child page, we might not have easy access to the user object fetched in layout 
    // unless passed down or re-fetched.

    // Let's assume we need to fetch user by username first or use a hook if context is available.
    // But wait, the `getPublicCollections` uses `userId`.
    // I should probably update the backend to allow fetching by username OR fetch user here.
    // Let's fetch the user first.

    const [collections, setCollections] = useState<UserCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState<any>(null);

    useEffect(() => {
        const fetchUserAndCollections = async () => {
            try {
                // Fetch user profile to get ID
                // We can use the existing API for fetching user profile
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/username/${username}`);
                if (!response.ok) throw new Error('User not found');
                const userData = await response.json();
                setProfileUser(userData);

                // Now fetch collections
                const collectionsData = await getPublicCollections(userData.id);
                setCollections(collectionsData.collections);
            } catch (error) {
                console.error('Failed to load collections:', error);
            } finally {
                setLoading(false);
            }
        };

        if (username) {
            fetchUserAndCollections();
        }
    }, [username]);



    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Icon icon="mdi:loading" width="40" height="40" className="animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (collections.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <Icon icon="mdi:folder-open-outline" width="64" height="64" className="text-muted-foreground/50 mb-4" />
                <h3 className="font-hebden text-xl text-foreground mb-2">No Public Collections</h3>
                <p className="text-muted-foreground font-nunito max-w-md">
                    {username} hasn't created any public collections yet.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {collections.map((collection) => (
                <CollectionCard key={collection.id} collection={collection} username={username} />
            ))}
        </div>
    );
}

function CollectionCard({ collection, username }: { collection: UserCollection, username: string }) {
    return (
        <Link href={`/collections/${collection.id}`}>
            <div className="bg-secondary/30 border border-border rounded-lg p-5 hover:border-primary/50 transition-all cursor-pointer group hover:shadow-md h-full">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon icon="mdi:folder-star" width="24" height="24" className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-hebden text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {collection.name}
                        </h3>
                        <p className="text-xs text-muted-foreground font-nunito">
                            {collection.itemCount} {collection.itemCount === 1 ? 'item' : 'items'}
                        </p>
                    </div>
                </div>
                {collection.description && (
                    <p className="text-sm text-muted-foreground font-nunito line-clamp-2 mb-0">
                        {collection.description}
                    </p>
                )}
            </div>
        </Link>
    );
}
