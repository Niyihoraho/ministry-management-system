import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma/client";
import { createPermanentMinistryEventSchema } from "../validation/permanentMinistryEvent";
import { auth } from "../../authentication/auth";
import { getUserScopeFilter } from "../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const regionId = searchParams.get("regionId");
        const universityId = searchParams.get("universityId");
        const smallGroupId = searchParams.get("smallGroupId");
        const alumniGroupId = searchParams.get("alumniGroupId");
        const type = searchParams.get("type");
        
        let where: any = {};
        
        // Apply explicit filters if provided
        if (regionId) {
            where.regionId = Number(regionId);
        }
        if (universityId) {
            where.universityId = Number(universityId);
        }
        if (smallGroupId) {
            where.smallGroupId = Number(smallGroupId);
        }
        if (alumniGroupId) {
            where.alumniGroupId = Number(alumniGroupId);
        }
        if (type) {
            where.type = type;
        }
        
        // If no explicit filters, apply scope-based filtering
        if (!regionId && !universityId && !smallGroupId && !alumniGroupId) {
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
                        // Regional users can only see events in their region
                        where.regionId = scopeFilter.regionId;
                    } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                        // University users can only see events in their university
                        where.universityId = scopeFilter.universityId;
                    } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
                        // Small group users can only see events in their small group
                        where.smallGroupId = scopeFilter.smallGroupId;
                    } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
                        // Alumni small group users can only see events in their alumni group
                        where.alumniGroupId = scopeFilter.alumniGroupId;
                    }
                    // Superadmin and national users can see all events (no additional filtering)
                } catch (error) {
                    console.error('Error applying RLS filter:', error);
                    return NextResponse.json(
                        { error: "Access denied" },
                        { status: 403 }
                    );
                }
            }
        }
        
        const events = await prisma.permanentministryevent.findMany({
            where,
            include: { 
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallgroup: { select: { id: true, name: true } },
                alumnismallgroup: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ events }, { status: 200 });
    } catch (error) {
        console.error("Error fetching events:", error);
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createPermanentMinistryEventSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const data = validation.data;

        // RLS: ensure user can create within their scoped org and that relations are consistent
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        try {
            const scope = await getUserScopeFilter(session.user.id);
            if (!scope.hasAccess) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }

            // Helper fetches
            const fetchUniversity = async (id?: number | null) => id ? prisma.university.findUnique({ where: { id }, select: { id: true, regionId: true } }) : null;
            const fetchSmallGroup = async (id?: number | null) => id ? prisma.smallgroup.findUnique({ where: { id }, select: { id: true, universityId: true, regionId: true } }) : null;
            const fetchAlumniGroup = async (id?: number | null) => id ? prisma.alumnismallgroup.findUnique({ where: { id }, select: { id: true, regionId: true } }) : null;

            const targetRegionId = data.regionId ?? null;
            const targetUniversityId = data.universityId ?? null;
            const targetSmallGroupId = data.smallGroupId ?? null;
            const targetAlumniGroupId = data.alumniGroupId ?? null;

            if (scope.scope === 'region' && scope.regionId) {
                // Region must match
                if (targetRegionId !== null && targetRegionId !== scope.regionId) {
                    return NextResponse.json({ error: "Access denied - region mismatch" }, { status: 403 });
                }
                // If university provided, it must belong to this region
                const uni = await fetchUniversity(targetUniversityId || undefined);
                if (uni && uni.regionId !== scope.regionId) {
                    return NextResponse.json({ error: "Access denied - university outside your region" }, { status: 403 });
                }
                // Small group and alumni group must be in region
                const sg = await fetchSmallGroup(targetSmallGroupId || undefined);
                if (sg && sg.regionId !== scope.regionId) {
                    return NextResponse.json({ error: "Access denied - small group outside your region" }, { status: 403 });
                }
                const ag = await fetchAlumniGroup(targetAlumniGroupId || undefined);
                if (ag && ag.regionId !== scope.regionId) {
                    return NextResponse.json({ error: "Access denied - alumni group outside your region" }, { status: 403 });
                }
            }

            if (scope.scope === 'university' && scope.universityId) {
                // University must match and alumni group must not be set
                if (targetUniversityId !== null && targetUniversityId !== scope.universityId) {
                    return NextResponse.json({ error: "Access denied - university mismatch" }, { status: 403 });
                }
                if (targetAlumniGroupId) {
                    return NextResponse.json({ error: "Access denied - cannot assign alumni group at university scope" }, { status: 403 });
                }
                // Region must match the university's region if provided
                const uni = await fetchUniversity(scope.universityId);
                if (uni && targetRegionId !== null && targetRegionId !== uni.regionId) {
                    return NextResponse.json({ error: "Access denied - region does not match university" }, { status: 403 });
                }
                // Small group must belong to the scoped university
                const sg = await fetchSmallGroup(targetSmallGroupId || undefined);
                if (sg && sg.universityId !== scope.universityId) {
                    return NextResponse.json({ error: "Access denied - small group not in your university" }, { status: 403 });
                }
            }

            if (scope.scope === 'smallgroup' && scope.smallGroupId) {
                if (targetSmallGroupId !== null && targetSmallGroupId !== scope.smallGroupId) {
                    return NextResponse.json({ error: "Access denied - small group mismatch" }, { status: 403 });
                }
                // Ensure university/region align with the small group if provided
                const sg = await fetchSmallGroup(scope.smallGroupId);
                if (sg) {
                    if (targetUniversityId !== null && targetUniversityId !== sg.universityId) {
                        return NextResponse.json({ error: "Access denied - university does not match your small group" }, { status: 403 });
                    }
                    if (targetRegionId !== null && targetRegionId !== sg.regionId) {
                        return NextResponse.json({ error: "Access denied - region does not match your small group" }, { status: 403 });
                    }
                }
                if (targetAlumniGroupId) {
                    return NextResponse.json({ error: "Access denied - cannot assign alumni group at small group scope" }, { status: 403 });
                }
            }

            if (scope.scope === 'alumnismallgroup' && scope.alumniGroupId) {
                if (targetAlumniGroupId !== null && targetAlumniGroupId !== scope.alumniGroupId) {
                    return NextResponse.json({ error: "Access denied - alumni group mismatch" }, { status: 403 });
                }
                // Ensure region aligns with alumni group if provided
                const ag = await fetchAlumniGroup(scope.alumniGroupId);
                if (ag && targetRegionId !== null && targetRegionId !== ag.regionId) {
                    return NextResponse.json({ error: "Access denied - region does not match your alumni group" }, { status: 403 });
                }
                // University/small group should generally be empty at alumni scope; if provided, deny
                if (targetUniversityId || targetSmallGroupId) {
                    return NextResponse.json({ error: "Access denied - cannot assign university/small group at alumni scope" }, { status: 403 });
                }
            }
        } catch (e) {
            console.error('Error applying RLS validation:', e);
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }
        const newEvent = await prisma.permanentministryevent.create({
            data: {
                name: data.name,
                type: data.type,
                regionId: data.regionId,
                universityId: data.universityId,
                smallGroupId: data.smallGroupId,
                alumniGroupId: data.alumniGroupId,
                isActive: data.isActive,
                updatedAt: new Date()
            },
            include: {
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallgroup: { select: { id: true, name: true } },
                alumnismallgroup: { select: { id: true, name: true } }
            }
        });
        
        return NextResponse.json(newEvent, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: "Event name already exists" },
                    { status: 409 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: "Foreign key constraint failed (invalid region, university, small group, or alumni group)" },
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