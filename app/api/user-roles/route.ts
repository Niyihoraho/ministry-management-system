import { NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createUserRoleSchema } from "@/app/api/validation/userRole";
import { auth } from "../../authentication/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const getAll = searchParams.get('all');
    
    // If getAll=true, return all user roles
    if (getAll === 'true') {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const allUserRoles = await prisma.userrole.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          region: true,
          university: true,
          smallgroup: true,
          alumnismallgroup: true
        },
        orderBy: { assignedAt: 'desc' }
      });
      
      return NextResponse.json({
        roles: allUserRoles
      });
    }
    
    // If no userId provided, get current user's role
    if (!userId) {
      const session = await auth();
      if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      
      const userRole = await prisma.userrole.findFirst({
        where: {
          userId: session.user.id
        },
        orderBy: { assignedAt: 'desc' }
      });
      
      return NextResponse.json({
        role: userRole?.scope || null,
        userRole: userRole
      });
    }
    
    // Get roles for specific user
    const userRoles = await prisma.userrole.findMany({
      where: {
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        region: true,
        university: true,
        smallgroup: true,
        alumnismallgroup: true
      },
      orderBy: { assignedAt: 'desc' }
    });
    
    return NextResponse.json({
      roles: userRoles,
      primaryRole: userRoles[0]?.scope || null
    });
  } catch (error) {
    console.error("GET /api/user-roles error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createUserRoleSchema.parse({
      ...body,
      // normalize empty strings sent from the UI
      regionId: body.regionId ?? null,
      universityId: body.universityId ?? null,
      smallGroupId: body.smallGroupId ?? null,
      alumniGroupId: body.alumniGroupId ?? null,
    });

    // Optional: verify foreign keys exist (light checks)
    if (parsed.regionId) {
      const exists = await prisma.region.findUnique({ where: { id: parsed.regionId } });
      if (!exists) return NextResponse.json({ error: "Region not found" }, { status: 400 });
    }
    if (parsed.universityId) {
      const exists = await prisma.university.findUnique({ where: { id: parsed.universityId } });
      if (!exists) return NextResponse.json({ error: "University not found" }, { status: 400 });
    }
    if (parsed.smallGroupId) {
      const exists = await prisma.smallgroup.findUnique({ where: { id: parsed.smallGroupId } });
      if (!exists) return NextResponse.json({ error: "Small group not found" }, { status: 400 });
    }
    if (parsed.alumniGroupId) {
      const exists = await prisma.alumnismallgroup.findUnique({ where: { id: parsed.alumniGroupId } });
      if (!exists) return NextResponse.json({ error: "Alumni small group not found" }, { status: 400 });
    }

    const created = await prisma.userrole.create({
      data: {
        userId: parsed.userId,
        scope: parsed.scope as any,
        regionId: parsed.regionId ?? null,
        universityId: parsed.universityId ?? null,
        smallGroupId: parsed.smallGroupId ?? null,
        alumniGroupId: parsed.alumniGroupId ?? null,

      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return NextResponse.json({ error: err.issues?.[0]?.message ?? "Validation error" }, { status: 400 });
    }
    console.error("POST /api/user-roles error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}