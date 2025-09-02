import { NextRequest, NextResponse } from 'next/server';
import { requireScopedSuperAdmin, requireScopedAdmin, getSessionWithRole, getUserScopedRole } from '@/app/utils/auth';

// Example 1: Route that requires superadmin scoped role
export async function GET(req: NextRequest) {
  // Check if user has superadmin scoped role
  const session = await requireScopedSuperAdmin();
  
  // If session is a NextResponse, it means there was an error
  if (session instanceof NextResponse) {
    return session;
  }
  
  // User is authenticated and has superadmin scoped role
  return NextResponse.json({
    message: "Super admin scoped access granted",
    user: {
      id: session.user.id,
      sessionRole: session.user.role, // This will be 'superadmin' for all users
      scopedRole: await getUserScopedRole(session.user.id!)
    }
  });
}

// Example 2: Route that requires any admin scoped role (superadmin or national)
export async function POST(req: NextRequest) {
  // Check if user has admin scoped role
  const session = await requireScopedAdmin();
  
  // If session is a NextResponse, it means there was an error
  if (session instanceof NextResponse) {
    return session;
  }
  
  // User is authenticated and has admin scoped role
  const body = await req.json();
  const scopedRole = await getUserScopedRole(session.user.id!);
  
  return NextResponse.json({
    message: "Admin scoped access granted",
    user: {
      id: session.user.id,
      sessionRole: session.user.role,
      scopedRole: scopedRole
    },
    data: body
  });
}

// Example 3: Route with conditional logic based on scoped role
export async function PUT(req: NextRequest) {
  // Get session without requiring specific role
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const scopedRole = await getUserScopedRole(session.user.id);
  
  // Different logic based on scoped role
  if (scopedRole === 'superadmin') {
    // Super admin can do everything
    return NextResponse.json({
      message: "Super admin scoped - Full access",
      sessionRole: session.user.role,
      scopedRole: scopedRole
    });
  } else if (scopedRole === 'national') {
    // National admin has limited access
    return NextResponse.json({
      message: "National admin scoped - Limited access",
      sessionRole: session.user.role,
      scopedRole: scopedRole
    });
  } else if (scopedRole === 'region') {
    // Regional admin has regional access
    return NextResponse.json({
      message: "Regional admin scoped - Regional access",
      sessionRole: session.user.role,
      scopedRole: scopedRole
    });
  } else {
    // Other roles or no scoped role assigned
    return NextResponse.json({ 
      error: "Forbidden - No scoped role assigned or insufficient permissions",
      sessionRole: session.user.role,
      scopedRole: scopedRole
    }, { status: 403 });
  }
}

// Example 4: Route that shows role information
export async function PATCH(req: NextRequest) {
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const scopedRole = await getUserScopedRole(session.user.id);
  
  return NextResponse.json({
    message: "Role information",
    user: {
      id: session.user.id,
      sessionRole: session.user.role, // Always 'superadmin' for authenticated users
      scopedRole: scopedRole, // The actual role assigned through UserRoleForm
      hasScopedRole: !!scopedRole
    },
    explanation: {
      sessionRole: "This is the role from the session (always 'superadmin' for authenticated users)",
      scopedRole: "This is the role assigned through UserRoleForm with specific scope",
      hasScopedRole: "Whether the user has been assigned a specific scoped role"
    }
  });
} 