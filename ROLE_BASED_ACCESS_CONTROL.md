# Role-Based Access Control (RBAC) Implementation Guide

## Overview

This guide explains how to implement and use role-based access control in your ministry management system. The system uses a two-tier approach:

1. **Session Role**: All authenticated users get `superadmin` role in their session
2. **Scoped Role**: Specific roles are assigned through the `UserRoleForm` and stored in the `userrole` table

## User Roles

The system supports the following roles (defined in `userrole_scope` enum):

- **superadmin**: Full system access across all entities
- **national**: National level access and management
- **region**: Access limited to specific region
- **university**: Access limited to specific university
- **smallgroup**: Access limited to specific small group
- **alumnismallgroup**: Access limited to specific alumni small group

## How It Works

### 1. Authentication Setup

The authentication system sets all authenticated users to have `superadmin` role in their session:

```typescript
// In auth.ts - all authenticated users get superadmin role
const userRole = 'superadmin'

return {
  id: dbUser.id,
  email: dbUser.email ?? undefined,
  name: dbUser.name ?? undefined,
  role: userRole, // Always 'superadmin'
} as ExtendedUser
```

### 2. Scoped Role Assignment

Specific roles are assigned through the `UserRoleForm` and stored in the `userrole` table:

```typescript
// Users can be assigned specific scoped roles through UserRoleForm
// These roles are stored in the userrole table with scope, regionId, etc.
```

### 3. Session Structure

The session includes the user's role (always 'superadmin'):

```typescript
interface SessionWithRole {
  user: {
    id?: string;
    role?: UserRole; // Always 'superadmin' for authenticated users
  } & any;
}
```

## Usage Examples

### 1. In React Components (Frontend)

#### Check Session Role (Always 'superadmin')
```tsx
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { data: session } = useSession();
  const userRole = session?.user?.role; // Always 'superadmin'

  return (
    <div>
      {userRole === 'superadmin' && (
        <div>All authenticated users can see this</div>
      )}
    </div>
  );
}
```

#### Check Scoped Role (From userrole table)
```tsx
import { useSession } from 'next-auth/react';
import { useState, useEffect } from 'react';

function MyComponent() {
  const { data: session } = useSession();
  const [scopedRole, setScopedRole] = useState(null);

  useEffect(() => {
    const fetchScopedRole = async () => {
      if (session?.user?.id) {
        const response = await fetch('/api/user-roles');
        if (response.ok) {
          const data = await response.json();
          setScopedRole(data.role);
        }
      }
    };
    fetchScopedRole();
  }, [session?.user?.id]);

  return (
    <div>
      {scopedRole === 'superadmin' && (
        <div>Only users with superadmin scoped role can see this</div>
      )}
    </div>
  );
}
```

#### Using Role-Based Components
```tsx
import { SuperAdminOnly, AdminOnly } from '@/app/components/common/RoleBasedComponent';

function MyPage() {
  return (
    <div>
      {/* Only superadmin scoped role can see this */}
      <SuperAdminOnly fallback={<p>Access denied</p>}>
        <div>Super admin content</div>
      </SuperAdminOnly>

      {/* Only admin scoped role (superadmin or national) can see this */}
      <AdminOnly fallback={<p>Admin access required</p>}>
        <div>Admin content</div>
      </AdminOnly>
    </div>
  );
}
```

### 2. In API Routes (Backend)

#### Require Session Role (Always 'superadmin')
```typescript
import { requireSuperAdmin } from '@/app/utils/auth';

export async function GET(req: Request) {
  const session = await requireSuperAdmin();
  
  // If session is a NextResponse, it means there was an error
  if (session instanceof NextResponse) {
    return session;
  }
  
  // User is authenticated (session role is always 'superadmin')
  return NextResponse.json({ message: "Access granted" });
}
```

#### Require Scoped Role (From userrole table)
```typescript
import { requireScopedSuperAdmin } from '@/app/utils/auth';

export async function GET(req: Request) {
  const session = await requireScopedSuperAdmin();
  
  // If session is a NextResponse, it means there was an error
  if (session instanceof NextResponse) {
    return session;
  }
  
  // User is authenticated and has superadmin scoped role
  return NextResponse.json({ message: "Super admin scoped access granted" });
}
```

#### Conditional Logic Based on Scoped Role
```typescript
import { getSessionWithRole, getUserScopedRole } from '@/app/utils/auth';

export async function POST(req: Request) {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const scopedRole = await getUserScopedRole(session.user.id);
  
  if (scopedRole === 'superadmin') {
    // Super admin logic
    return NextResponse.json({ message: "Super admin scoped access" });
  } else if (scopedRole === 'national') {
    // National admin logic
    return NextResponse.json({ message: "National admin scoped access" });
  } else {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
```

### 3. In Sidebar Navigation

The sidebar automatically shows/hides menu items based on scoped role:

```tsx
// In AppSidebar.tsx
const getNavItems = (): NavItem[] => {
  const baseItems = [
    // ... other menu items
  ];

  // Only show System Administration for users with superadmin scoped role
  if (userScopedRole === 'superadmin') {
    baseItems.push({
      icon: <PlugInIcon />,
      name: 'System Administration',
      subItems: [
        { name: 'User Management', path: '/admin/user-management' },
        { name: 'Role Requests', path: '/admin/roles' },
        { name: 'Emergency Access', path: '/admin/emergency' },
      ],
    });
  }

  return baseItems;
};
```

## Utility Functions

### Available Functions

```typescript
import { 
  getSessionWithRole,
  getUserScopedRole,
  hasRole,
  isSuperAdmin,
  isAdmin,
  hasScopedRole,
  isSuperAdminWithScope,
  isAdminWithScope,
  requireRole,
  requireAdmin,
  requireSuperAdmin,
  requireScopedRole,
  requireScopedAdmin,
  requireScopedSuperAdmin
} from '@/app/utils/auth';

// Get session with role information (always 'superadmin')
const session = await getSessionWithRole();

// Get user's scoped role from userrole table
const scopedRole = await getUserScopedRole(userId);

// Check session role (always 'superadmin' for authenticated users)
const isSuper = isSuperAdmin(session.user.role);

// Check scoped role (from userrole table)
const isSuperScoped = await isSuperAdminWithScope(userId);

// Require session role (always 'superadmin')
const session = await requireSuperAdmin();

// Require scoped role (from userrole table)
const session = await requireScopedSuperAdmin();
```

### Type Definitions

```typescript
export type UserRole = 'superadmin' | 'national' | 'region' | 'university' | 'smallgroup' | 'alumnismallgroup';

export interface SessionWithRole {
  user: {
    id?: string;
    role?: UserRole; // Always 'superadmin' for authenticated users
  } & any;
}
```

## API Endpoints

### Get Current User's Scoped Role
```typescript
GET /api/user-roles
// Returns: { role: "superadmin", userRole: {...} }
```

### Get Specific User's Scoped Roles
```typescript
GET /api/user-roles?userId=123
// Returns: { roles: [...], primaryRole: "superadmin" }
```

## Role Assignment Process

### 1. User Registration/Login
- User registers/logs in
- Session role is automatically set to 'superadmin'

### 2. Role Assignment
- Admin uses `UserRoleForm` to assign specific scoped roles
- Roles are stored in `userrole` table with scope, regionId, etc.

### 3. Access Control
- System checks scoped roles from `userrole` table for access control
- Session role is used for basic authentication

## Best Practices

### 1. Use Scoped Roles for Access Control
```typescript
// Good: Check scoped role for access control
const scopedRole = await getUserScopedRole(userId);
if (scopedRole === 'superadmin') {
  // Grant access
}

// Avoid: Relying only on session role
if (session.user.role === 'superadmin') {
  // This will always be true for authenticated users
}
```

### 2. Use Session Role for Basic Authentication
```typescript
// Good: Use session role for basic auth
const session = await getSessionWithRole();
if (!session?.user?.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Then check scoped role for permissions
const scopedRole = await getUserScopedRole(session.user.id);
```

### 3. Protect API Routes with Scoped Roles
```typescript
// Good: Use scoped role protection
const session = await requireScopedSuperAdmin();

// Avoid: Using only session role protection
const session = await requireSuperAdmin(); // Always succeeds for authenticated users
```

### 4. Handle Role Changes Gracefully
```tsx
// Always provide fallback content
<SuperAdminOnly fallback={<p>You don't have permission to view this content</p>}>
  <AdminContent />
</SuperAdminOnly>
```

## Testing

### Test Different Scoped Roles
1. Create users with different scoped roles using `UserRoleForm`
2. Test API endpoints with different user sessions
3. Verify UI components show/hide correctly based on scoped roles

### Example Test Cases
```typescript
// Test superadmin scoped access
const superAdminUser = { id: 'user1' };
const scopedRole = await getUserScopedRole(superAdminUser.id);
expect(scopedRole).toBe('superadmin');

// Test regular user access
const regularUser = { id: 'user2' };
const scopedRole = await getUserScopedRole(regularUser.id);
expect(scopedRole).toBe(null); // No scoped role assigned
```

## Troubleshooting

### Common Issues

1. **Session role always 'superadmin'**: This is expected behavior
2. **Scoped role not showing**: Check if user has an approved userrole record
3. **API returning 403**: Verify the user has the required scoped role
4. **UI not updating**: Ensure you're checking scoped roles, not session roles

### Debug Steps

1. Check the session in browser dev tools (role will always be 'superadmin')
2. Verify userrole records in the database
3. Test API endpoints directly
4. Check console for authentication errors

## Security Considerations

1. **Always validate scoped roles**: Session roles are for basic auth only
2. **Use HTTPS**: Ensure all API calls use secure connections
3. **Log access attempts**: Monitor for unauthorized access attempts
4. **Regular role reviews**: Periodically review user scoped roles and permissions
5. **Principle of least privilege**: Only grant necessary scoped permissions

## Migration Notes

If you're upgrading from a previous version:

1. Ensure all users have appropriate scoped roles assigned through `UserRoleForm`
2. Update any hardcoded role checks to use scoped role utilities
3. Test all role-based functionality
4. Update TypeScript types if needed
5. Remember that session roles are always 'superadmin' for authenticated users 