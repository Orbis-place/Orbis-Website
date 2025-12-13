'use client';

import { useState, useEffect, useRef } from 'react';
import { Icon } from '@iconify/react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ResourceTag {
    id: string;
    name: string;
    slug: string;
    usageCount: number;
    category?: {
        id: string;
        name: string;
        slug: string;
    };
}

interface TagSearchInputProps {
    selectedTags: string[];
    onTagsChange: (tags: string[]) => void;
    resourceType: string;
}

export function TagSearchInput({ selectedTags, onTagsChange, resourceType }: TagSearchInputProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<ResourceTag[]>([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [allTags, setAllTags] = useState<ResourceTag[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch all tags for lookup
    useEffect(() => {
        fetchAllTags();
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.length > 0) {
                searchTags(searchQuery);
            } else {
                // Show popular tags when no search
                setSuggestions(allTags.slice(0, 10));
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, allTags]);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchAllTags = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resource-tags?limit=100`);
            if (response.ok) {
                const tags = await response.json();
                setAllTags(tags);
                setSuggestions(tags.slice(0, 10));
            }
        } catch (error) {
            console.error('Failed to fetch tags:', error);
        }
    };

    const searchTags = async (query: string) => {
        if (!query.trim()) {
            setSuggestions(allTags.slice(0, 10));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/resource-tags/search?q=${encodeURIComponent(query)}&limit=10`
            );
            if (response.ok) {
                const tags = await response.json();
                setSuggestions(tags);
            }
        } catch (error) {
            console.error('Failed to search tags:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTagSelect = (tag: ResourceTag) => {
        if (!selectedTags.includes(tag.id)) {
            onTagsChange([...selectedTags, tag.id]);
            // Update allTags if this tag wasn't in the list
            if (!allTags.find(t => t.id === tag.id)) {
                setAllTags([...allTags, tag]);
            }
        }
        setSearchQuery('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    const handleCreateTag = async (name: string) => {
        // Normalize the tag name (capitalize first letter of each word)
        const normalizedName = name.trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

        // Create a temporary tag object
        // Use a special format: temp-{timestamp}-{slug}
        const slug = normalizedName.toLowerCase().replace(/\s+/g, '-');
        const tempTag: ResourceTag = {
            id: `temp-${Date.now()}-${slug}`,
            name: normalizedName,
            slug: slug,
            usageCount: 0,
        };

        // Add to allTags so it can be found later
        setAllTags([...allTags, tempTag]);
        handleTagSelect(tempTag);
    };

    const exactMatch = suggestions.find(
        s => s.name.toLowerCase() === searchQuery.toLowerCase()
    );
    const showCreateOption = searchQuery.trim().length > 0 && !exactMatch;

    return (
        <div className="relative" ref={dropdownRef}>
            <div className="relative">
                <Input
                    ref={inputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    placeholder="Search tags or create new..."
                    className="bg-[#032125] border-[#084B54] text-[#C7F4FA] placeholder:text-[#C7F4FA]/30 focus:border-[#109EB1] pr-10"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    {loading ? (
                        <Icon icon="mdi:loading" width="20" height="20" className="text-[#109EB1] animate-spin" />
                    ) : (
                        <Icon icon="mdi:magnify" width="20" height="20" className="text-[#C7F4FA]/50" />
                    )}
                </div>
            </div>

            {/* Dropdown */}
            {showDropdown && (suggestions.length > 0 || showCreateOption) && (
                <div className="absolute z-50 w-full mt-2 bg-[#032125] border border-[#084B54] rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    {/* Create new tag option */}
                    {showCreateOption && (
                        <button
                            type="button"
                            onClick={() => handleCreateTag(searchQuery)}
                            className="w-full px-4 py-3 text-left hover:bg-[#06363D] transition-colors border-b border-[#084B54] flex items-center gap-2"
                        >
                            <div className="flex items-center justify-center w-6 h-6 bg-[#109EB1] rounded-md">
                                <Icon icon="mdi:plus" width="16" height="16" className="text-[#C7F4FA]" />
                            </div>
                            <div className="flex-1">
                                <div className="font-nunito text-sm text-[#C7F4FA]">
                                    Create tag: <span className="font-semibold">{searchQuery}</span>
                                </div>
                                <div className="text-xs text-[#C7F4FA]/50">
                                    This will create a new tag
                                </div>
                            </div>
                        </button>
                    )}

                    {/* Existing tags */}
                    {suggestions.map((tag) => {
                        const isSelected = selectedTags.includes(tag.id);
                        const isPopular = tag.usageCount > 10;

                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => !isSelected && handleTagSelect(tag)}
                                disabled={isSelected}
                                className={cn(
                                    "w-full px-4 py-3 text-left transition-colors flex items-center justify-between",
                                    isSelected
                                        ? "bg-[#109EB1]/10 cursor-not-allowed opacity-50"
                                        : "hover:bg-[#06363D] cursor-pointer"
                                )}
                            >
                                <div className="flex items-center gap-2 flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-nunito text-sm text-[#C7F4FA]">
                                            {tag.name}
                                        </span>
                                        {isPopular && (
                                            <Icon icon="mdi:fire" width="14" height="14" className="text-orange-400" />
                                        )}
                                    </div>
                                    {tag.category && (
                                        <span className="text-xs text-[#C7F4FA]/50">
                                            in {tag.category.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {tag.usageCount > 0 && (
                                        <span className="px-2 py-0.5 bg-[#084B54] text-[#C7F4FA]/70 text-xs rounded-md font-nunito">
                                            {tag.usageCount} uses
                                        </span>
                                    )}
                                    {isSelected && (
                                        <Icon icon="mdi:check" width="16" height="16" className="text-[#109EB1]" />
                                    )}
                                </div>
                            </button>
                        );
                    })}

                    {suggestions.length === 0 && !showCreateOption && (
                        <div className="px-4 py-6 text-center text-[#C7F4FA]/50 font-nunito text-sm">
                            No tags found
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
