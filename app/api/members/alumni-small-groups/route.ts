import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { createAlumniSmallGroupSchema } from "../../validation/alumniSmallGroup";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const regionId = searchParams.get("regionId");
        const alumniGroupId = searchParams.get("alumniGroupId");
        
        // If specific alumniGroupId is provided, return that alumni small group
        if (alumniGroupId) {
            const alumniSmallGroup = await prisma.alumnismallgroup.findUnique({
                where: { id: Number(alumniGroupId) },
                include: { 
                    region: { select: { id: true, name: true } }
                }
            });
            if (!alumniSmallGroup) {
                return NextResponse.json({ error: "Alumni small group not found" }, { status: 404 });
            }
            return NextResponse.json(alumniSmallGroup, { status: 200 });
        }
        
        let where: any = {};
        
        // Apply explicit region filter if provided
        if (regionId) {
            where.regionId = Number(regionId);
        } else {
            // Apply scope-based filtering based on user role
            const session = await auth();

            if (session?.user?.id) {
                try {
                    const scopeFilter = await getUserScopeFilter(session.user.id);
                    
                    if (!scopeFilter.hasAccess) {
                        return NextResponse.json(
                            { error: "Access denied" },
                            { status: 403 }
                        );
                    }

                    // Apply scope-based filtering
                    if (scopeFilter.scope === 'region' && scopeFilter.regionId) {
                        // Regional users can only see alumni small groups in their region
                        where.regionId = scopeFilter.regionId;
                    } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
                        // Alumni small group users can only see their specific group
                        where.id = scopeFilter.alumniGroupId;
                    } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                        // University users should see alumni small groups in their university's region
                        const university = await prisma.university.findUnique({
                            where: { id: scopeFilter.universityId },
                            select: { regionId: true }
                        });
                        if (university?.regionId) {
                            where.regionId = university.regionId;
                        } else {
                            return NextResponse.json(
                                { error: "Access denied - university not found" },
                                { status: 403 }
                            );
                        }
                    } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
                        // Small group users should see alumni small groups in their group's region
                        const smallGroup = await prisma.smallgroup.findUnique({
                            where: { id: scopeFilter.smallGroupId },
                            select: { regionId: true }
                        });
                        if (smallGroup?.regionId) {
                            where.regionId = smallGroup.regionId;
                        } else {
                            return NextResponse.json(
                                { error: "Access denied - small group not found" },
                                { status: 403 }
                            );
                        }
                    }
                    // Superadmin and national users can see all alumni small groups (no additional filtering)
                } catch (error) {
                    console.error('Error applying RLS filter:', error);
                    return NextResponse.json(
                        { error: "Access denied" },
                        { status: 403 }
                    );
                }
            }
        }
        
        const alumniSmallGroups = await prisma.alumnismallgroup.findMany({
            where,
            include: { 
                region: { select: { id: true, name: true } }
            }
        });
        return NextResponse.json(alumniSmallGroups, { status: 200 });
    } catch (error) {
        console.error("Error fetching alumni small groups:", error);
        return NextResponse.json({ error: 'Failed to fetch alumni small groups' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createAlumniSmallGroupSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const data = validation.data;

        // RLS: ensure user can create within region scope
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const scope = await getUserScopeFilter(session.user.id);
            if (!scope.hasAccess) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }
            const targetRegionId = Number(data.regionId);
            if (scope.scope === 'region' && scope.regionId !== targetRegionId) {
                return NextResponse.json({ error: "Access denied - can only create in your region" }, { status: 403 });
            }
            if (scope.scope === 'university' && scope.universityId) {
                const uni = await prisma.university.findUnique({ where: { id: scope.universityId }, select: { regionId: true } });
                if (!uni || uni.regionId !== targetRegionId) {
                    return NextResponse.json({ error: "Access denied - region mismatch" }, { status: 403 });
                }
            }
            if (scope.scope === 'smallgroup' && scope.smallGroupId) {
                const sg = await prisma.smallgroup.findUnique({ where: { id: scope.smallGroupId }, select: { regionId: true } });
                if (!sg || sg.regionId !== targetRegionId) {
                    return NextResponse.json({ error: "Access denied - region mismatch" }, { status: 403 });
                }
            }
            if (scope.scope === 'alumnismallgroup' && scope.alumniGroupId) {
                const ag = await prisma.alumnismallgroup.findUnique({ where: { id: scope.alumniGroupId }, select: { regionId: true } });
                if (!ag || ag.regionId !== targetRegionId) {
                    return NextResponse.json({ error: "Access denied - region mismatch" }, { status: 403 });
                }
            }
        } catch (e) {
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        const newAlumniSmallGroup = await prisma.alumnismallgroup.create({
            data: {
                name: data.name,
                regionId: Number(data.regionId)
            },
            include: {
                region: { select: { id: true, name: true } }
            }
        });
        
        return NextResponse.json(newAlumniSmallGroup, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: "Alumni small group name already exists" },
                    { status: 409 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: "Foreign key constraint failed (invalid region)" },
                    { status: 400 }
                );
            }
        }
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
} 