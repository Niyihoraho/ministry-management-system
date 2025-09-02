import { NextRequest, NextResponse } from 'next/server';
import prisma from "../../../../prisma/client";
import { z } from "zod";

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

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body for bulk update
    const validation = bulkUpdatePermissionsSchema.safeParse(body);
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

    // Get all permission IDs from the request
    const permissionIds = data.permissions.map((p) => p.permissionId);
    
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

              for (const permission of data.permissions) {
          const existingRolePermission = await tx.rolepermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: data.roleId,
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
                roleId: data.roleId,
                permissionId: permission.permissionId,
                grantedBy: data.grantedBy
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
                   roleId: data.roleId,
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