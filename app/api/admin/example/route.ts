import { NextRequest, NextResponse } from 'next/server';
import { requireSuperAdmin, requireAdmin, getSessionWithRole } from '@/app/utils/auth';

// Example 1: Route that requires superadmin access
export async function GET(req: NextRequest) {
  // Check if user is superadmin
  const session = await requireSuperAdmin();
  
  // If session is a NextResponse, it means there was an error
  if (session instanceof NextResponse) {
    return session;
  }
  
  // User is authenticated and has superadmin role
  return NextResponse.json({
    message: "Super admin access granted",
    user: {
      id: session.user.id,
      role: session.user.role
    }
  });
}

// Example 2: Route that requires any admin access (superadmin or national)
export async function POST(req: NextRequest) {
  // Check if user is admin
  const session = await requireAdmin();
  
  // If session is a NextResponse, it means there was an error
  if (session instanceof NextResponse) {
    return session;
  }
  
  // User is authenticated and has admin role
  const body = await req.json();
  
  return NextResponse.json({
    message: "Admin access granted",
    user: {
      id: session.user.id,
      role: session.user.role
    },
    data: body
  });
}

// Example 3: Route with conditional logic based on role
export async function PUT(req: NextRequest) {
  // Get session without requiring specific role
  const session = await getSessionWithRole();
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const userRole = session.user.role;
  
  // Different logic based on role
  if (userRole === 'superadmin') {
    // Super admin can do everything
    return NextResponse.json({
      message: "Super admin - Full access",
      role: userRole
    });
  } else if (userRole === 'national') {
    // National admin has limited access
    return NextResponse.json({
      message: "National admin - Limited access",
      role: userRole
    });
  } else {
    // Other roles have no access
    return NextResponse.json({ 
      error: "Forbidden - Insufficient permissions" 
    }, { status: 403 });
  }
} 