import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma/client";
import { createUniversitySchema } from "../validation/university";
import { auth } from "../../authentication/auth";
import { applyRLSFilter, getUserScopeFilter } from "../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const regionId = searchParams.get("regionId");
        const universityId = searchParams.get("universityId");
        
        // If specific universityId is provided, return that university
        if (universityId) {
            const university = await prisma.university.findUnique({
                where: { id: Number(universityId) },
                include: { region: { select: { id: true, name: true } } }
            });
            if (!university) {
                return NextResponse.json({ error: "University not found" }, { status: 404 });
            }
            return NextResponse.json(university, { status: 200 });
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
                    // For universities, we need to filter by regionId based on user's scope
                    const scopeFilter = await getUserScopeFilter(session.user.id);
                    
                    if (!scopeFilter.hasAccess) {
                        return NextResponse.json(
                            { error: "Access denied" },
                            { status: 403 }
                        );
                    }

                    // Apply scope-based filtering
                    if (scopeFilter.scope === 'region' && scopeFilter.regionId) {
                        where.regionId = scopeFilter.regionId;
                    } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                        // If user has university scope, only show their specific university
                        where.id = scopeFilter.universityId;
                    } else if (scopeFilter.scope === 'smallgroup' || scopeFilter.scope === 'alumnismallgroup') {
                        // Small group users should see universities based on their group's region
                        // This would require additional logic to get the region from the small group
                        // For now, we'll return access denied
                        return NextResponse.json(
                            { error: "Access denied - insufficient scope" },
                            { status: 403 }
                        );
                    }
                    // Superadmin and national users can see all universities (no additional filtering)
                } catch (error) {
                    console.error('Error applying RLS filter:', error);
                    return NextResponse.json(
                        { error: "Access denied" },
                        { status: 403 }
                    );
                }
            }
        }
        
        const universities = await prisma.university.findMany({
            where,
            include: { region: { select: { id: true, name: true } } }
        });
        return NextResponse.json(universities, { status: 200 });
    } catch (error) {
        console.error("Error fetching universities:", error);
        return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createUniversitySchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
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
                // University-scoped: region must match their university's region
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

        const newUniversity = await prisma.university.create({ data: { name: data.name, regionId: Number(data.regionId) } });
        return NextResponse.json(newUniversity, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "University name already exists" }, { status: 409 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ error: "Foreign key constraint failed (invalid region)" }, { status: 400 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}