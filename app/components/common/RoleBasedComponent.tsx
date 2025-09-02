'use client';

import { useSession } from 'next-auth/react';
import { UserRole } from '@/app/utils/auth';

// Extend the session user type to include role
interface ExtendedSession {
  user: {
    id?: string;
    role?: UserRole;
  } & any;
}

interface RoleBasedComponentProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export default function RoleBasedComponent({ 
  children, 
  requiredRole, 
  fallback = null 
}: RoleBasedComponentProps) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const userRole = session?.user?.role;

  // If no role is required, show the component
  if (!requiredRole) {
    return <>{children}</>;
  }

  // If user doesn't have the required role, show fallback
  if (userRole !== requiredRole) {
    return <>{fallback}</>;
  }

  // User has the required role, show the component
  return <>{children}</>;
}

// Convenience components for common roles
export function SuperAdminOnly({ children, fallback }: Omit<RoleBasedComponentProps, 'requiredRole'>) {
  return (
    <RoleBasedComponent requiredRole="superadmin" fallback={fallback}>
      {children}
    </RoleBasedComponent>
  );
}

export function AdminOnly({ children, fallback }: Omit<RoleBasedComponentProps, 'requiredRole'>) {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const userRole = session?.user?.role;
  
  // Check if user is admin (superadmin or national)
  const isAdmin = userRole === 'superadmin' || userRole === 'national';
  
  if (!isAdmin) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

// Example usage component
export function ExampleUsage() {
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const userRole = session?.user?.role;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Role-Based Access Control Example</h2>
      
      <div className="p-4 bg-gray-100 rounded">
        <p><strong>Current User Role:</strong> {userRole || 'Not logged in'}</p>
      </div>

      {/* Only superadmin can see this */}
      <SuperAdminOnly 
        fallback={<p className="text-red-600">❌ Only Super Admins can see this content</p>}
      >
        <div className="p-4 bg-green-100 border border-green-300 rounded">
          <h3 className="font-bold text-green-800">🔐 Super Admin Content</h3>
          <p className="text-green-700">This content is only visible to super admins.</p>
        </div>
      </SuperAdminOnly>

      {/* Only admins (superadmin or national) can see this */}
      <AdminOnly 
        fallback={<p className="text-orange-600">❌ Only Admins can see this content</p>}
      >
        <div className="p-4 bg-blue-100 border border-blue-300 rounded">
          <h3 className="font-bold text-blue-800">👥 Admin Content</h3>
          <p className="text-blue-700">This content is visible to all admins (superadmin and national).</p>
        </div>
      </AdminOnly>

      {/* Anyone can see this */}
      <div className="p-4 bg-gray-100 border border-gray-300 rounded">
        <h3 className="font-bold text-gray-800">🌐 Public Content</h3>
        <p className="text-gray-700">This content is visible to everyone.</p>
      </div>
    </div>
  );
} 