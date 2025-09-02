import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const regionId = searchParams.get("regionId");

        // If specific regionId is provided, return that region
        if (regionId) {
            const region = await prisma.region.findUnique({
                where: { id: Number(regionId) },
                select: { id: true, name: true }
            });
            if (!region) {
                return NextResponse.json({ error: "Region not found" }, { status: 404 });
            }
            return NextResponse.json(region, { status: 200 });
        }

        let where: any = {};

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
                    // Regional users can only see their specific region
                    where.id = scopeFilter.regionId;
                } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                    // University users should see their university's region
                    const university = await prisma.university.findUnique({
                        where: { id: scopeFilter.universityId },
                        select: { regionId: true }
                    });
                    if (university?.regionId) {
                        where.id = university.regionId;
                    } else {
                        return NextResponse.json(
                            { error: "Access denied - university not found" },
                            { status: 403 }
                        );
                    }
                } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
                    // Small group users should see their group's region
                    const smallGroup = await prisma.smallgroup.findUnique({
                        where: { id: scopeFilter.smallGroupId },
                        select: { regionId: true }
                    });
                    if (smallGroup?.regionId) {
                        where.id = smallGroup.regionId;
                    } else {
                        return NextResponse.json(
                            { error: "Access denied - small group not found" },
                            { status: 403 }
                        );
                    }
                } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
                    // Alumni group users should see their group's region
                    const alumniGroup = await prisma.alumnismallgroup.findUnique({
                        where: { id: scopeFilter.alumniGroupId },
                        select: { regionId: true }
                    });
                    if (alumniGroup?.regionId) {
                        where.id = alumniGroup.regionId;
                    } else {
                        return NextResponse.json(
                            { error: "Access denied - alumni group not found" },
                            { status: 403 }
                        );
                    }
                }
                // Superadmin and national users can see all regions (no additional filtering)
            } catch (error) {
                console.error('Error applying RLS filter:', error);
                return NextResponse.json(
                    { error: "Access denied" },
                    { status: 403 }
                );
            }
        }

        const regions = await prisma.region.findMany({
            where,
            select: { id: true, name: true }
        });
        return NextResponse.json(regions, { status: 200 });
    } catch (error) {
        console.error("Error fetching regions:", error);
        return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }
} 