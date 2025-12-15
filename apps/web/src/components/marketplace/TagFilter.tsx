'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { fetchTags, getPopularTagsForType, type Tag, ResourceType } from '@/lib/api/resources';
import { useDebounce } from '@/hooks/useDebounce';

interface TagFilterProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    resourceType?: ResourceType;
}

export function TagFilter({ selectedTags, onTagsChange, resourceType }: TagFilterProps) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Debounce search query
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        const loadTags = async () => {
            setIsLoading(true);
            setError(null);

            try {
                let tagsData: Tag[];

                // If there's a search query, use the search endpoint
                // Otherwise, use the popular tags for the specific resource type
                if (debouncedSearchQuery) {
                    tagsData = await fetchTags(debouncedSearchQuery, 50);
                } else if (resourceType) {
                    tagsData = await getPopularTagsForType(resourceType, 50);
                } else {
                    tagsData = await fetchTags(undefined, 50);
                }

                setTags(tagsData);
            } catch (err) {
                console.error('Failed to fetch tags:', err);
                setError(err instanceof Error ? err.message : 'Failed to load tags');
                setTags([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadTags();
    }, [debouncedSearchQuery, resourceType]);

    const toggleTag = (tagId: string) => {
        if (selectedTags.includes(tagId)) {
            onTagsChange(selectedTags.filter((id) => id !== tagId));
        } else {
            onTagsChange([...selectedTags, tagId]);
        }
    };

    return (
        <div className="space-y-2.5">
            {/* Search Input */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C7F4FA]/40" />
                <input
                    type="text"
                    placeholder="Search tags..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#032125] border border-[#084B54] rounded-full text-sm text-[#C7F4FA] placeholder:text-[#C7F4FA]/40 focus:outline-none focus:ring-2 focus:ring-[#109EB1]/50 focus:border-transparent font-abeezee"
                />
            </div>

            {/* Tags List */}
            <div className="max-h-64 overflow-y-auto flex flex-col gap-2.5 custom-scrollbar">
                {isLoading ? (
                    <div className="text-sm text-[#C7F4FA]/40 py-2 font-abeezee">Loading tags...</div>
                ) : error ? (
                    <div className="text-sm text-red-400 py-2 font-abeezee">{error}</div>
                ) : !tags || tags.length === 0 ? (
                    <div className="text-sm text-[#C7F4FA]/40 py-2 font-abeezee">No tags found</div>
                ) : (
                    tags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => toggleTag(tag.id)}
                            className={`flex items-center px-[15px] py-2.5 rounded-full transition-all ${selectedTags.includes(tag.id)
                                ? 'bg-[#032125] text-[#109EB1]'
                                : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                {tag.color && (
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: tag.color }}
                                    />
                                )}
                                <span className="font-abeezee text-[15.16px] leading-[18px]">{tag.name}</span>
                            </div>
                            {(tag.usageCountForType !== undefined || tag.usageCount !== undefined) && (
                                <span className="ml-auto text-xs text-[#C7F4FA]/40 font-abeezee">
                                    {tag.usageCountForType ?? tag.usageCount}
                                </span>
                            )}
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
