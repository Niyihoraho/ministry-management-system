"use client";

import React from "react";
import Image from "next/image";
import ThemeToggleButton from "./ThemeToggleButton";

export default function HeaderBar() {
  return (
    <header className="flex items-center justify-between px-8 py-4 bg-white dark:bg-[#151c2c] border-b border-gray-200 dark:border-[#232e47]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Image src="/logo-r.png" alt="Logo" width={56} height={56} className="rounded-full bg-white shadow" />
          <div className="flex flex-col justify-center">
            <h2 className="text-lg font-bold text-[#1e293b] dark:text-white leading-tight">GBUR SYSTEM</h2>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-300">super admin</span>
          </div>
        </div>
        <button className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#232e47]">
          {/* Hamburger icon */}
          <span className="block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-700 dark:bg-gray-200 mb-1"></span>
          <span className="block w-6 h-0.5 bg-gray-700 dark:bg-gray-200"></span>
        </button>
        <div className="relative">
          <input
            type="text"
            placeholder="Search or type command..."
            className="pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-[#232e47] text-gray-700 dark:text-gray-200 focus:outline-none"
          />
          <span className="absolute left-3 top-2.5 w-4 h-4 bg-gray-400 rounded-full"></span>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <ThemeToggleButton />
        <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#232e47] relative">
          {/* Notification icon */}
          <span className="w-5 h-5 inline-block bg-gray-400 rounded-full"></span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="w-9 h-9 rounded-full bg-gray-300 dark:bg-[#232e47] flex items-center justify-center overflow-hidden">
            {/* Placeholder user image */}
            <span className="w-8 h-8 bg-gray-400 rounded-full"></span>
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Musharof</span>
          <span className="w-4 h-4 bg-gray-400 rounded-full"></span>
        </div>
      </div>
    </header>
  );
} 