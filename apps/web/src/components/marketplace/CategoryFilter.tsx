'use client';

import { useState, useEffect } from 'react';
import { fetchCategories, type Category, ResourceType } from '@/lib/api/resources';

interface CategoryFilterProps {
    selectedCategories: string[];
    onCategoriesChange: (categories: string[]) => void;
    resourceType?: ResourceType;
}

export function CategoryFilter({ selectedCategories, onCategoriesChange, resourceType }: CategoryFilterProps) {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCategories = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const categories = await fetchCategories(resourceType);
                setCategories(categories);
            } catch (err) {
                console.error('Failed to fetch categories:', err);
                setError(err instanceof Error ? err.message : 'Failed to load categories');
                setCategories([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
    }, [resourceType]);

    const toggleCategory = (categoryId: string) => {
        if (selectedCategories.includes(categoryId)) {
            onCategoriesChange(selectedCategories.filter((id) => id !== categoryId));
        } else {
            onCategoriesChange([...selectedCategories, categoryId]);
        }
    };

    return (
        <div className="flex flex-col gap-2.5">
            {isLoading ? (
                <div className="text-sm text-[#C7F4FA]/40 py-2 font-abeezee">Loading categories...</div>
            ) : error ? (
                <div className="text-sm text-red-400 py-2 font-abeezee">{error}</div>
            ) : !categories || categories.length === 0 ? (
                <div className="text-sm text-[#C7F4FA]/40 py-2 font-abeezee">No categories found</div>
            ) : (
                categories.map((category) => (
                    <button
                        key={category.id}
                        onClick={() => toggleCategory(category.id)}
                        className={`flex items-center px-[15px] py-2.5 rounded-full transition-all ${selectedCategories.includes(category.id)
                            ? 'bg-[#032125] text-[#109EB1]'
                            : 'bg-transparent text-[#C7F4FA] hover:bg-[#032125]/50'
                            }`}
                    >
                        <div className="flex items-center gap-2">
                            <span className="font-abeezee text-[15.16px] leading-[18px]">{category.name}</span>
                        </div>
                        <span className="ml-auto text-xs text-[#C7F4FA]/40 font-abeezee">
                            {category.usageCountForType || category.usageCount || 0}
                        </span>
                    </button>
                ))
            )}
        </div>
    );
}
