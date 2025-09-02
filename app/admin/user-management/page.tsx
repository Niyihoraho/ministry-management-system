"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserManagementPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the all-users page
    router.replace("/admin/user-management/all-users");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-120px)]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 dark:text-gray-400">Redirecting to user management...</p>
      </div>
    </div>
  );
} 