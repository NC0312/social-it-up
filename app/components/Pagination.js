import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";


export const Pagination = ({
    currentPage,
    totalPages,
    totalRecords,
    startIndex,
    endIndex,
    onPageChange,
    pageButtonsStyles,
    recordInfoStyles,
}) => {
    const [showSettings, setShowSettings] = useState(false);
    const dropdownRef = useRef(null);
    const buttonRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                !buttonRef.current.contains(event.target)
            ) {
                setShowSettings(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowLeft') {
                onPageChange(Math.max(1, currentPage - 1));
            } else if (e.key === 'ArrowRight') {
                onPageChange(Math.min(totalPages, currentPage + 1));
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [currentPage, totalPages, onPageChange]);

    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];

        for (
            let i = Math.max(2, currentPage - delta);
            i <= Math.min(totalPages - 1, currentPage + delta);
            i++
        ) {
            range.push(i);
        }

        if (currentPage - delta > 2) {
            rangeWithDots.push(1, '...');
        } else {
            rangeWithDots.push(1);
        }

        rangeWithDots.push(...range);

        if (currentPage + delta < totalPages - 1) {
            rangeWithDots.push('...', totalPages);
        } else if (totalPages > 1) {
            rangeWithDots.push(totalPages);
        }

        return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    // Sophisticated button styles with hover effects
    const baseButtonStyles = "relative inline-flex items-center justify-center transition-all duration-200 ease-in-out";
    const navButtonStyles = `${baseButtonStyles} w-10 h-10 rounded-lg`;
    const pageButtonStyles = `${baseButtonStyles} w-10 h-10 rounded-lg text-sm font-medium`;

    const defaultButtonStyles = `bg-white border border-gray-200 ${recordInfoStyles} hover:bg-gray-50 hover:border-gray-300 active:bg-gray-100`;
    const activeButtonStyles = `${pageButtonsStyles} ${recordInfoStyles} border-[#36302A]`;
    const disabledButtonStyles = "opacity-50 cursor-not-allowed bg-gray-50 border border-gray-200 text-gray-400";

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Enhanced Stats Bar */}
            <div className="p-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4">
                        {/* Record Stats */}
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                <span className={`text-sm ${recordInfoStyles}`}>
                                    <span className="font-semibold font-serif">{totalRecords}</span> Records
                                </span>
                            </div>
                            <div className="px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                                <span className={`text-sm ${recordInfoStyles}`}>
                                    <span className="font-semibold font-serif">{startIndex}-{endIndex}</span> Showing
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="p-4">
                {/* Mobile View */}
                <div className="flex sm:hidden justify-between items-center">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`${navButtonStyles} ${currentPage === 1 ? disabledButtonStyles : defaultButtonStyles}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="text-sm font-medium px-4 py-2 bg-gray-50 rounded-lg border border-gray-200">
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`${navButtonStyles} ${currentPage === totalPages ? disabledButtonStyles : defaultButtonStyles}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Desktop View */}
                <div className="hidden sm:flex justify-center items-center gap-2">
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onPageChange(1)}
                            disabled={currentPage === 1}
                            className={`${navButtonStyles} ${currentPage === 1 ? disabledButtonStyles : defaultButtonStyles}`}
                            title="First Page"
                        >
                            <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`${navButtonStyles} ${currentPage === 1 ? disabledButtonStyles : defaultButtonStyles}`}
                            title="Previous Page"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                        {pageNumbers.map((pageNum, idx) => (
                            <button
                                key={idx}
                                onClick={() => typeof pageNum === 'number' ? onPageChange(pageNum) : null}
                                disabled={pageNum === '...'}
                                className={`${pageButtonStyles} ${pageNum === currentPage
                                    ? activeButtonStyles
                                    : pageNum === '...'
                                        ? 'cursor-default bg-transparent border-transparent hover:bg-transparent'
                                        : defaultButtonStyles
                                    }`}
                            >
                                {pageNum}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`${navButtonStyles} ${currentPage === totalPages ? disabledButtonStyles : defaultButtonStyles}`}
                            title="Next Page"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onPageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className={`${navButtonStyles} ${currentPage === totalPages ? disabledButtonStyles : defaultButtonStyles}`}
                            title="Last Page"
                        >
                            <ChevronsRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};