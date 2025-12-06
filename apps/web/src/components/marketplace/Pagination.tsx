'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
    currentPage: number;
    totalPages?: number;
    onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages = 5, onPageChange }: PaginationProps) {
    // Show fewer pages on mobile
    const pagesToShow = typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : totalPages;

    return (
        <div className="flex justify-center items-center gap-1 sm:gap-2">
            <button
                onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#06363D] border border-[#084B54] text-[#C7F4FA] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#084B54] transition-colors"
            >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {Array.from({ length: pagesToShow }, (_, i) => i + 1).map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`
            w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full font-hebden font-semibold text-xs sm:text-sm transition-colors
            ${currentPage === page
                            ? 'bg-[#109EB1] text-[#C7F4FA]'
                            : 'bg-[#06363D] border border-[#084B54] text-[#C7F4FA] hover:bg-[#084B54]'
                        }
          `}
                >
                    {page}
                </button>
            ))}

            <button
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-[#06363D] border border-[#084B54] text-[#C7F4FA] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#084B54] transition-colors"
            >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
        </div>
    );
}
