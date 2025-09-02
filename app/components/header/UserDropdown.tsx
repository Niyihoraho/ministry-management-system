"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { UserCircleIcon } from "../../icons/index";

interface ExtendedSession {
  user?: {
    id?: string;
    email?: string;
    name?: string;
    role?: string;
  } & any;
}

function mapScopeToLabel(scope?: string | null) {
  switch (scope) {
    case 'superadmin':
      return 'Super admin';
    case 'national':
      return 'National';
    case 'region':
      return 'Region';
    case 'university':
      return 'University';
    case 'smallgroup':
      return 'Small group';
    case 'alumnismallgroup':
      return 'Alumni small group';
    default:
      return 'User';
  }
}

export default function UserDropdown() {
  const { data } = useSession() as { data: ExtendedSession | null };
  const session = data || undefined;
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const userName = session?.user?.name || session?.user?.email || "User";
  const [scopedRole, setScopedRole] = useState<string | null>(null);
  const [loadingScope, setLoadingScope] = useState(false);

  useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickAway);
    return () => document.removeEventListener("mousedown", onClickAway);
  }, []);

  // Fetch scoped role from API (uses session on server)
  useEffect(() => {
    const fetchScope = async () => {
      if (!session?.user?.id) return;
      setLoadingScope(true);
      try {
        const res = await fetch('/api/user-roles');
        if (res.ok) {
          const data = await res.json();
          setScopedRole(data.role ?? null);
        } else {
          setScopedRole(null);
        }
      } catch {
        setScopedRole(null);
      } finally {
        setLoadingScope(false);
      }
    };
    fetchScope();
  }, [session?.user?.id]);

  const scopeLabel = loadingScope ? 'Loading…' : mapScopeToLabel(scopedRole);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-2 px-1.5 py-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
      >
        <span className="w-8 h-8 rounded-full overflow-hidden border border-gray-700/30 dark:border-gray-200/10 flex items-center justify-center bg-white dark:bg-gray-800">
          <UserCircleIcon className="w-5 h-5 text-gray-400" />
        </span>
        <span className="hidden md:block font-semibold text-sm text-gray-900 dark:text-white max-w-[140px] truncate">
          {scopeLabel}
        </span>
        <svg width="16" height="16" fill="none" viewBox="0 0 20 20" className="text-gray-400"><path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{userName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{mapScopeToLabel(scopedRole)}</p>
          </div>

          {/* Actions */}
          <div className="py-1">
            <a href="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">Profile</a>
            <button
              onClick={() => signOut({ callbackUrl: "/signin" })}
              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 