import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/prisma/client";
import { createRoleSchema, updateRoleSchema, roleQuerySchema } from "../validation/role";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Validate query parameters
    const validation = roleQuerySchema.safeParse(queryParams);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Invalid query parameters", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { level, isActive, includeUserCount, includePermissions } = validation.data;
    const where: any = {};
    
    if (level) {
      where.level = level;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const roles = await (prisma as any).role.findMany({
      where,
      include: {
        permissions: includePermissions ? {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                resource: true,
                action: true,
                scope: true
              }
            }
          }
        } : false,
        userrole: includeUserCount ? {
          select: {
            id: true
          }
        } : false,
        _count: includeUserCount ? {
          select: {
            userrole: true,
            permissions: true
          }
        } : false
      },
      orderBy: [
        { level: 'asc' },
        { name: 'asc' }
      ]
    });

    // Transform the data to include counts
    const transformedRoles = roles.map((role: any) => ({
      ...role,
      usersCount: includeUserCount ? role._count?.userrole || 0 : undefined,
      permissionsCount: includePermissions ? role.permissions?.length || 0 : undefined,
      permissions: includePermissions ? role.permissions?.map((rp: any) => rp.permission) || [] : undefined,
      _count: undefined // Remove the _count field
    }));

    return NextResponse.json({
      success: true,
      data: transformedRoles,
      count: transformedRoles.length
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch roles' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = createRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if role name already exists
    const existingRole = await (prisma as any).role.findUnique({
      where: { name: data.name }
    });

    if (existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role name already exists' },
        { status: 409 }
      );
    }

    // Create role
    const role = await (prisma as any).role.create({
      data: {
        name: data.name,
        description: data.description,
        level: data.level,
        isActive: data.isActive,
        isSystem: data.isSystem
      }
    });

    return NextResponse.json({
      success: true,
      data: role,
      message: 'Role created successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating role:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Role name already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = updateRoleSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if role exists
    const existingRole = await (prisma as any).role.findUnique({
      where: { id: data.id }
    });

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if role name already exists (excluding current role)
    const duplicateRole = await (prisma as any).role.findFirst({
      where: {
        name: data.name,
        id: { not: data.id }
      }
    });

    if (duplicateRole) {
      return NextResponse.json(
        { success: false, error: 'Role name already exists' },
        { status: 409 }
      );
    }

    // Update role
    const updatedRole = await (prisma as any).role.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        level: data.level,
        isActive: data.isActive,
        isSystem: data.isSystem
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedRole,
      message: 'Role updated successfully'
    });
  } catch (error: any) {
    console.error('Error updating role:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Role name already exists' },
        { status: 409 }
      );
    }
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update role' },
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
        { success: false, error: 'Role ID is required' },
        { status: 400 }
      );
    }

    // Check if role exists and has no user assignments
    const existingRole = await (prisma as any).role.findUnique({
      where: { id: parseInt(id) },
      include: {
        userrole: true,
        permissions: true
      }
    });

    if (!existingRole) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    if (existingRole.userrole.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete role with active user assignments' },
        { status: 409 }
      );
    }

    // Delete role (this will also delete role permissions due to cascade)
    await (prisma as any).role.delete({
      where: { id: parseInt(id) }
    });

    return NextResponse.json({
      success: true,
      message: 'Role deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting role:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to delete role' },
      { status: 500 }
    );
  }
} 