import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/prisma/client";
import { createPermissionSchema, updatePermissionSchema, permissionQuerySchema } from "../validation/permission";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validation = permissionQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { resource, action, scope, isActive } = validation.data;
    const where: any = {};
    
    if (resource) {
      where.resource = resource;
    }
    
    if (action) {
      where.action = action;
    }
    
    if (scope) {
      where.scope = scope;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const permissions = await (prisma as any).permission.findMany({
      where,
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: permissions,
      count: permissions.length
    });
  } catch (error) {
    console.error('Error fetching permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = createPermissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if permission name already exists
    const existingPermission = await (prisma as any).permission.findUnique({
      where: { name: data.name }
    });

    if (existingPermission) {
      return NextResponse.json(
        { success: false, error: 'Permission name already exists' },
        { status: 409 }
      );
    }

    // Create permission
    const permission = await (prisma as any).permission.create({
      data: {
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
        scope: data.scope,
        isActive: data.isActive
      }
    });

    return NextResponse.json({
      success: true,
      data: permission,
      message: 'Permission created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating permission:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Permission name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create permission' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = updatePermissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if permission exists
    const existingPermission = await (prisma as any).permission.findUnique({
      where: { id: data.id }
    });

    if (!existingPermission) {
      return NextResponse.json(
        { success: false, error: 'Permission not found' },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.resource !== undefined) updateData.resource = data.resource;
    if (data.action !== undefined) updateData.action = data.action;
    if (data.scope !== undefined) updateData.scope = data.scope;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Update permission
    const updatedPermission = await (prisma as any).permission.update({
      where: { id: data.id },
      data: updateData
    });

    return NextResponse.json({
      success: true,
      data: updatedPermission,
      message: 'Permission updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating permission:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Permission name already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Permission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update permission' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Permission ID is required' },
        { status: 400 }
      );
    }

    // Check if permission exists and has no role assignments
    const existingPermission = await (prisma as any).permission.findUnique({
      where: { id: parseInt(id) },
      include: {
        rolepermission: true
      }
    });

    if (!existingPermission) {
      return NextResponse.json(
        { success: false, error: 'Permission not found' },
        { status: 404 }
      );
    }

    if (existingPermission.rolepermission.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete permission with active role assignments' },
        { status: 409 }
      );
    }

    // Delete permission
    await (prisma as any).permission.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Permission deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting permission:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Permission not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete permission' },
      { status: 500 }
    );
  }
} 