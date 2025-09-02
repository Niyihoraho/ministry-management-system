// components/Pagination.tsx
"use client";
import React from "react";

interface Props {
  itemCount: number;
  pageSize: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({ itemCount, pageSize, currentPage, onPageChange }: Props) => {
  const pageCount = Math.ceil(itemCount / pageSize);
  
  if (pageCount <= 1) return null;

  const changePage = (page: number) => {
    if (page >= 1 && page <= pageCount) {
      onPageChange(page);
    }
  };

  const buttonBaseClass = "px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors";
  const buttonDisabledClass = "opacity-50 cursor-not-allowed hover:bg-white dark:hover:bg-gray-800";

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-500 dark:text-gray-400">
        Page {currentPage} of {pageCount}
      </span>
      <button
        className={`${buttonBaseClass} ${currentPage === 1 ? buttonDisabledClass : ''}`}
        disabled={currentPage === 1}
        onClick={() => changePage(1)}
      >
        {"<<"}
      </button>
      <button
        className={`${buttonBaseClass} ${currentPage === 1 ? buttonDisabledClass : ''}`}
        disabled={currentPage === 1}
        onClick={() => changePage(currentPage - 1)}
      >
        {"<"}
      </button>
      <button
        className={`${buttonBaseClass} ${currentPage === pageCount ? buttonDisabledClass : ''}`}
        disabled={currentPage === pageCount}
        onClick={() => changePage(currentPage + 1)}
      >
        {">"}
      </button>
      <button
        className={`${buttonBaseClass} ${currentPage === pageCount ? buttonDisabledClass : ''}`}
        disabled={currentPage === pageCount}
        onClick={() => changePage(pageCount)}
      >
        {">>"}
      </button>
    </div>
  );
};

export default Pagination;