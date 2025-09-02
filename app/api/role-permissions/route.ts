import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../prisma/client";
import { z } from "zod";

const assignPermissionSchema = z.object({
  roleId: z.number().int().positive(),
  permissionId: z.number().int().positive(),
  grantedBy: z.union([
    z.string().transform((val) => {
      if (!val || val === "" || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
    z.number().int().positive(),
    z.null()
  ]).optional(),
});

const bulkAssignPermissionsSchema = z.object({
  roleId: z.number().int().positive(),
  permissionIds: z.array(z.number().int().positive()),
  grantedBy: z.union([
    z.string().transform((val) => {
      if (!val || val === "" || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
    z.number().int().positive(),
    z.null()
  ]).optional(),
});

// New schema for bulk update (check/uncheck permissions)
const bulkUpdatePermissionsSchema = z.object({
  roleId: z.number().int().positive(),
  permissions: z.array(z.object({
    permissionId: z.number().int().positive(),
    isAssigned: z.boolean()
  })),
  grantedBy: z.union([
    z.string().transform((val) => {
      if (!val || val === "" || val === null) return null;
      const num = Number(val);
      return isNaN(num) ? null : num;
    }),
    z.number().int().positive(),
    z.null()
  ]).optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    const permissionId = searchParams.get('permissionId');

    if (!roleId && !permissionId) {
      return NextResponse.json(
        { success: false, error: 'Either roleId or permissionId is required' },
        { status: 400 }
      );
    }

    const where: any = {};
    
    if (roleId) {
      where.roleId = parseInt(roleId);
    }
    
    if (permissionId) {
      where.permissionId = parseInt(permissionId);
    }

    const rolePermissions = await (prisma as any).rolepermission.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        permission: {
          select: {
            id: true,
            name: true,
            resource: true,
            action: true,
            scope: true
          }
        },
        user_grantedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: [
        { grantedAt: 'desc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: rolePermissions,
      count: rolePermissions.length
    });
  } catch (error) {
    console.error('Error fetching role permissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch role permissions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = assignPermissionSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if role exists
    const role = await (prisma as any).role.findUnique({
      where: { id: data.roleId }
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    // Check if permission exists
    const permission = await (prisma as any).permission.findUnique({
      where: { id: data.permissionId }
    });

    if (!permission) {
      return NextResponse.json(
        { success: false, error: 'Permission not found' },
        { status: 404 }
      );
    }

    // Check if permission is already assigned to this role
    const existingRolePermission = await (prisma as any).rolepermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: data.roleId,
          permissionId: data.permissionId
        }
      }
    });

    if (existingRolePermission) {
      return NextResponse.json(
        { success: false, error: 'Permission is already assigned to this role' },
        { status: 409 }
      );
    }

    // Assign permission to role
    const rolePermission = await (prisma as any).rolepermission.create({
      data: {
        roleId: data.roleId,
        permissionId: data.permissionId,
        grantedBy: data.grantedBy
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            level: true
          }
        },
        permission: {
          select: {
            id: true,
            name: true,
            resource: true,
            action: true,
            scope: true
          }
        },
        user_grantedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: rolePermission,
      message: 'Permission assigned to role successfully'
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error assigning permission to role:', error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Invalid role or permission reference' },
        { status: 400 }
      );
    }
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Permission is already assigned to this role' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to assign permission to role' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Check if this is a bulk update (check/uncheck) or bulk assignment
    const isBulkUpdate = body.permissions && Array.isArray(body.permissions);
    
    let validation;
    if (isBulkUpdate) {
      // Validate request body for bulk update (check/uncheck permissions)
      validation = bulkUpdatePermissionsSchema.safeParse(body);
    } else {
      // Validate request body for bulk assignment
      validation = bulkAssignPermissionsSchema.safeParse(body);
    }
    
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Check if role exists
    const role = await (prisma as any).role.findUnique({
      where: { id: data.roleId }
    });

    if (!role) {
      return NextResponse.json(
        { success: false, error: 'Role not found' },
        { status: 404 }
      );
    }

    if (isBulkUpdate) {
      // Handle bulk update (check/uncheck permissions)
      const bulkUpdateData = data as z.infer<typeof bulkUpdatePermissionsSchema>;
      const permissionIds = bulkUpdateData.permissions.map((p) => p.permissionId);
      
      // Check if all permissions exist
      const permissions = await (prisma as any).permission.findMany({
        where: {
          id: {
            in: permissionIds
          }
        }
      });

      if (permissions.length !== permissionIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more permissions not found' },
          { status: 404 }
        );
      }

      // Use transaction to handle bulk update operations
      const result = await (prisma as any).$transaction(async (tx: any) => {
        const results = {
          added: 0,
          removed: 0,
          unchanged: 0
        };

        for (const permission of bulkUpdateData.permissions) {
          const existingRolePermission = await tx.rolepermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: bulkUpdateData.roleId,
                permissionId: permission.permissionId
              }
            }
          });

          if (permission.isAssigned) {
            // Permission should be assigned
            if (!existingRolePermission) {
              // Create new role permission
              await tx.rolepermission.create({
                data: {
                  roleId: bulkUpdateData.roleId,
                  permissionId: permission.permissionId,
                  grantedBy: bulkUpdateData.grantedBy
                }
              });
              results.added++;
            } else {
              results.unchanged++;
            }
          } else {
            // Permission should not be assigned
            if (existingRolePermission) {
                             // Remove existing role permission
               await tx.rolepermission.delete({
                 where: {
                   roleId_permissionId: {
                     roleId: bulkUpdateData.roleId,
                     permissionId: permission.permissionId
                   }
                 }
               });
              results.removed++;
            } else {
              results.unchanged++;
            }
          }
        }

        return results;
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: `Successfully updated permissions: ${result.added} added, ${result.removed} removed, ${result.unchanged} unchanged`
      });
    } else {
      // Handle bulk assignment (original logic)
      const bulkAssignData = data as z.infer<typeof bulkAssignPermissionsSchema>;
      
      // Check if all permissions exist
      const permissions = await (prisma as any).permission.findMany({
        where: {
          id: {
            in: bulkAssignData.permissionIds
          }
        }
      });

      if (permissions.length !== bulkAssignData.permissionIds.length) {
        return NextResponse.json(
          { success: false, error: 'One or more permissions not found' },
          { status: 404 }
        );
      }

      // Use transaction to handle bulk operations
      const result = await (prisma as any).$transaction(async (tx: any) => {
        const createdRolePermissions = [];

        for (const permissionId of bulkAssignData.permissionIds) {
          // Check if permission is already assigned
          const existingRolePermission = await tx.rolepermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: bulkAssignData.roleId,
                permissionId: permissionId
              }
            }
          });

          if (!existingRolePermission) {
            const rolePermission = await tx.rolepermission.create({
              data: {
                roleId: bulkAssignData.roleId,
                permissionId: permissionId,
                grantedBy: bulkAssignData.grantedBy
              }
            });
            createdRolePermissions.push(rolePermission);
          }
        }

        return createdRolePermissions;
      });

      return NextResponse.json({
        success: true,
        data: result,
        message: `Successfully assigned ${result.length} permissions to role`
      });
    }
  } catch (error: any) {
    console.error('Error bulk updating permissions:', error);
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Invalid role or permission reference' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to bulk update permissions' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const roleId = searchParams.get('roleId');
    const permissionId = searchParams.get('permissionId');

    if (!roleId || !permissionId) {
      return NextResponse.json(
        { success: false, error: 'Both roleId and permissionId are required' },
        { status: 400 }
      );
    }

    // Check if role permission assignment exists
    const existingRolePermission = await (prisma as any).rolepermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: parseInt(roleId),
          permissionId: parseInt(permissionId)
        }
      }
    });

    if (!existingRolePermission) {
      return NextResponse.json(
        { success: false, error: 'Role permission assignment not found' },
        { status: 404 }
      );
    }

    // Remove permission from role
    await (prisma as any).rolepermission.delete({
      where: {
        roleId_permissionId: {
          roleId: parseInt(roleId),
          permissionId: parseInt(permissionId)
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Permission removed from role successfully'
    });
  } catch (error: any) {
    console.error('Error removing permission from role:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Role permission assignment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to remove permission from role' },
      { status: 500 }
    );
  }
} 