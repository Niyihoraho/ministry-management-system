import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/prisma/client";
import { z } from "zod";

const groupedPermissionsQuerySchema = z.object({
  roleId: z.union([
    z.string().transform(val => {
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
    z.number().int().positive(),
    z.null()
  ]).optional(),
  scope: z.string().optional(),
  isActive: z.union([
    z.string().transform(val => val === 'true'),
    z.boolean()
  ]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validation = groupedPermissionsQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { roleId, scope, isActive } = validation.data;
    
    // Build where clause for permissions
    const wherePermission: any = {};
    if (scope) {
      wherePermission.scope = scope;
    }
    if (isActive !== undefined) {
      wherePermission.isActive = isActive;
    }

    // Fetch all permissions
    const permissions = await (prisma as any).permission.findMany({
      where: wherePermission,
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    // If roleId is provided, fetch role permissions to check which ones are assigned
    let rolePermissions: any[] = [];
    if (roleId) {
      rolePermissions = await (prisma as any).rolepermission.findMany({
        where: { roleId: roleId },
        select: { permissionId: true }
      });
    }

    const assignedPermissionIds = new Set(rolePermissions.map(rp => rp.permissionId));

    // Group permissions by resource (category)
    const groupedPermissions: { [key: string]: any[] } = {};
    
    permissions.forEach((permission: any) => {
      const resource = permission.resource;
      if (!groupedPermissions[resource]) {
        groupedPermissions[resource] = [];
      }
      
      groupedPermissions[resource].push({
        id: permission.id,
        name: permission.name,
        description: permission.description,
        resource: permission.resource,
        action: permission.action,
        scope: permission.scope,
        isActive: permission.isActive,
        isAssigned: assignedPermissionIds.has(permission.id)
      });
    });

    // Convert to array format for easier frontend consumption
    const result = Object.entries(groupedPermissions).map(([resource, permissions]) => ({
      category: resource,
      displayName: getCategoryDisplayName(resource),
      permissions: permissions
    }));

    return NextResponse.json({
      success: true,
      data: result,
      count: permissions.length,
      categories: result.length
    });
  } catch (error) {
    console.error('Error fetching grouped permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch grouped permissions' },
      { status: 500 }
    );
  }
}

// Helper function to get display names for categories
function getCategoryDisplayName(resource: string): string {
  const displayNames: { [key: string]: string } = {
    'user': 'User Management',
    'role': 'Role Management',
    'content': 'Content Management',
    'financial': 'Financial Management',
    'report': 'Reports & Analytics',
    'system': 'System Administration',
    'member': 'Member Management',
    'event': 'Event Management',
    'training': 'Training Management',
    'attendance': 'Attendance Management',
    'smallgroup': 'Small Group Management',
    'university': 'University Management',
    'region': 'Region Management',
    'alumni': 'Alumni Management',
    'designation': 'Designation Management',
    'contribution': 'Contribution Management',
    'budget': 'Budget Management',
    'audit': 'Audit Management',
    'backup': 'Backup Management',
    'settings': 'Settings Management'
  };
  
  return displayNames[resource.toLowerCase()] || resource.charAt(0).toUpperCase() + resource.slice(1) + ' Management';
} 