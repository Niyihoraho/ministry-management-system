import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { createSmallGroupSchema } from "../../validation/smallGroup";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const regionId = searchParams.get("regionId");
        const universityId = searchParams.get("universityId");
        const smallGroupId = searchParams.get("smallGroupId");
        
        // If specific smallGroupId is provided, return that small group
        if (smallGroupId) {
            const smallGroup = await prisma.smallgroup.findUnique({
                where: { id: Number(smallGroupId) },
                include: { 
                    region: { select: { id: true, name: true } },
                    university: { select: { id: true, name: true } }
                }
            });
            if (!smallGroup) {
                return NextResponse.json({ error: "Small group not found" }, { status: 404 });
            }
            return NextResponse.json(smallGroup, { status: 200 });
        }
        
        let where: any = {};
        
        // Apply explicit filters if provided
        if (regionId) {
            where.regionId = Number(regionId);
        }
        if (universityId) {
            where.universityId = Number(universityId);
        }
        
        // If no explicit filters, apply scope-based filtering
        if (!regionId && !universityId) {
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
                        // Regional users can only see small groups in their region
                        where.regionId = scopeFilter.regionId;
                    } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                        // University users can only see small groups in their university
                        where.universityId = scopeFilter.universityId;
                    } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
                        // Small group users can only see their specific group
                        where.id = scopeFilter.smallGroupId;
                    } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
                        // Alumni small group users should see small groups in their region
                        const alumniGroup = await prisma.alumnismallgroup.findUnique({
                            where: { id: scopeFilter.alumniGroupId },
                            select: { regionId: true }
                        });
                        if (alumniGroup?.regionId) {
                            where.regionId = alumniGroup.regionId;
                        } else {
                            return NextResponse.json(
                                { error: "Access denied - alumni group not found" },
                                { status: 403 }
                            );
                        }
                    }
                    // Superadmin and national users can see all small groups (no additional filtering)
                } catch (error) {
                    console.error('Error applying RLS filter:', error);
                    return NextResponse.json(
                        { error: "Access denied" },
                        { status: 403 }
                    );
                }
            }
        }
        
        const smallGroups = await prisma.smallgroup.findMany({
            where,
            include: { 
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } }
            }
        });
        return NextResponse.json(smallGroups, { status: 200 });
    } catch (error) {
        console.error("Error fetching small groups:", error);
        return NextResponse.json({ error: 'Failed to fetch small groups' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createSmallGroupSchema.safeParse(body);
        
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
        const newSmallGroup = await prisma.smallgroup.create({
            data: {
                name: data.name,
                universityId: Number(data.universityId),
                regionId: Number(data.regionId)
            },
            include: {
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } }
            }
        });
        
        return NextResponse.json(newSmallGroup, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: "Small group name already exists" },
                    { status: 409 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: "Foreign key constraint failed (invalid university or region)" },
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