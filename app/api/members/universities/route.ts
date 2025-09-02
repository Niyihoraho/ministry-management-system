import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const regionId = searchParams.get("regionId");
        const universityId = searchParams.get("universityId");
        
        // If specific universityId is provided, return that university
        if (universityId) {
            const university = await prisma.university.findUnique({
                where: { id: Number(universityId) },
                select: { id: true, name: true }
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
                    const scopeFilter = await getUserScopeFilter(session.user.id);
                    
                    if (!scopeFilter.hasAccess) {
                        return NextResponse.json(
                            { error: "Access denied" },
                            { status: 403 }
                        );
                    }

                    // Apply scope-based filtering
                    if (scopeFilter.scope === 'region' && scopeFilter.regionId) {
                        // Regional users can only see universities in their region
                        where.regionId = scopeFilter.regionId;
                    } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                        // University users can only see their specific university
                        where.id = scopeFilter.universityId;
                    } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
                        // Small group users should see universities based on their group's region
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
                    } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
                        // Alumni group users should see universities based on their group's region
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
            select: { id: true, name: true }
        });
        return NextResponse.json(universities, { status: 200 });
    } catch (error) {
        console.error("Error fetching universities:", error);
        return NextResponse.json({ error: 'Failed to fetch universities' }, { status: 500 });
    }
} 