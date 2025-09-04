import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { createPermanentMinistryEventSchema } from "../../validation/permanentMinistryEvent";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";

// GET single event
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const eventId = parseInt(params.id);
        if (isNaN(eventId)) {
            return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
        }

        const event = await prisma.permanentministryevent.findUnique({
            where: { id: eventId },
            include: { 
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallgroup: { select: { id: true, name: true } },
                alumnismallgroup: { select: { id: true, name: true } }
            }
        });

        if (!event) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // Apply RLS - check if user can access this event
        const session = await auth();
        if (session?.user?.id) {
            try {
                const scopeFilter = await getUserScopeFilter(session.user.id);
                
                if (!scopeFilter.hasAccess) {
                    return NextResponse.json({ error: "Access denied" }, { status: 403 });
                }

                // Check if user can access this specific event based on their scope
                if (scopeFilter.scope === 'region' && scopeFilter.regionId && event.regionId !== scopeFilter.regionId) {
                    return NextResponse.json({ error: "Access denied - event not in your region" }, { status: 403 });
                }
                if (scopeFilter.scope === 'university' && scopeFilter.universityId && event.universityId !== scopeFilter.universityId) {
                    return NextResponse.json({ error: "Access denied - event not in your university" }, { status: 403 });
                }
                if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId && event.smallGroupId !== scopeFilter.smallGroupId) {
                    return NextResponse.json({ error: "Access denied - event not in your small group" }, { status: 403 });
                }
                if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId && event.alumniGroupId !== scopeFilter.alumniGroupId) {
                    return NextResponse.json({ error: "Access denied - event not in your alumni group" }, { status: 403 });
                }
            } catch (error) {
                console.error('Error applying RLS filter:', error);
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }
        }

        // Transform the data to match the frontend interface (camelCase)
        const transformedEvent = {
            ...event,
            smallGroup: event.smallgroup,
            alumniGroup: event.alumnismallgroup
        };

        return NextResponse.json(transformedEvent, { status: 200 });
    } catch (error) {
        console.error("Error fetching event:", error);
        return NextResponse.json({ error: 'Failed to fetch event' }, { status: 500 });
    }
}

// PUT update event
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const eventId = parseInt(params.id);
        if (isNaN(eventId)) {
            return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
        }

        const body = await request.json();
        const validation = createPermanentMinistryEventSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }

        const data = validation.data;

        // Check if event exists
        const existingEvent = await prisma.permanentministryevent.findUnique({
            where: { id: eventId }
        });

        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // RLS: ensure user can update this event
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const scope = await getUserScopeFilter(session.user.id);
            if (!scope.hasAccess) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }

            // Check if user can update this specific event
            if (scope.scope === 'region' && scope.regionId && existingEvent.regionId !== scope.regionId) {
                return NextResponse.json({ error: "Access denied - cannot update event outside your region" }, { status: 403 });
            }
            if (scope.scope === 'university' && scope.universityId && existingEvent.universityId !== scope.universityId) {
                return NextResponse.json({ error: "Access denied - cannot update event outside your university" }, { status: 403 });
            }
            if (scope.scope === 'smallgroup' && scope.smallGroupId && existingEvent.smallGroupId !== scope.smallGroupId) {
                return NextResponse.json({ error: "Access denied - cannot update event outside your small group" }, { status: 403 });
            }
            if (scope.scope === 'alumnismallgroup' && scope.alumniGroupId && existingEvent.alumniGroupId !== scope.alumniGroupId) {
                return NextResponse.json({ error: "Access denied - cannot update event outside your alumni group" }, { status: 403 });
            }

            // Apply the same validation logic as in POST for the new data
            const targetRegionId = data.regionId ?? null;
            const targetUniversityId = data.universityId ?? null;
            const targetSmallGroupId = data.smallGroupId ?? null;
            const targetAlumniGroupId = data.alumniGroupId ?? null;

            if (scope.scope === 'region' && scope.regionId) {
                if (targetRegionId !== null && targetRegionId !== scope.regionId) {
                    return NextResponse.json({ error: "Access denied - region mismatch" }, { status: 403 });
                }
            }

            if (scope.scope === 'university' && scope.universityId) {
                if (targetUniversityId !== null && targetUniversityId !== scope.universityId) {
                    return NextResponse.json({ error: "Access denied - university mismatch" }, { status: 403 });
                }
                if (targetAlumniGroupId) {
                    return NextResponse.json({ error: "Access denied - cannot assign alumni group at university scope" }, { status: 403 });
                }
            }

            if (scope.scope === 'smallgroup' && scope.smallGroupId) {
                if (targetSmallGroupId !== null && targetSmallGroupId !== scope.smallGroupId) {
                    return NextResponse.json({ error: "Access denied - small group mismatch" }, { status: 403 });
                }
                if (targetAlumniGroupId) {
                    return NextResponse.json({ error: "Access denied - cannot assign alumni group at small group scope" }, { status: 403 });
                }
            }

            if (scope.scope === 'alumnismallgroup' && scope.alumniGroupId) {
                if (targetAlumniGroupId !== null && targetAlumniGroupId !== scope.alumniGroupId) {
                    return NextResponse.json({ error: "Access denied - alumni group mismatch" }, { status: 403 });
                }
                if (targetUniversityId || targetSmallGroupId) {
                    return NextResponse.json({ error: "Access denied - cannot assign university/small group at alumni scope" }, { status: 403 });
                }
            }
        } catch (e) {
            console.error('Error applying RLS validation:', e);
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        const updatedEvent = await prisma.permanentministryevent.update({
            where: { id: eventId },
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

        // Transform the data to match the frontend interface (camelCase)
        const transformedEvent = {
            ...updatedEvent,
            smallGroup: updatedEvent.smallgroup,
            alumniGroup: updatedEvent.alumnismallgroup
        };
        
        return NextResponse.json(transformedEvent, { status: 200 });
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
        console.error("Error updating event:", error);
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 });
    }
}

// DELETE event
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const eventId = parseInt(params.id);
        if (isNaN(eventId)) {
            return NextResponse.json({ error: "Invalid event ID" }, { status: 400 });
        }

        // Check if event exists
        const existingEvent = await prisma.permanentministryevent.findUnique({
            where: { id: eventId }
        });

        if (!existingEvent) {
            return NextResponse.json({ error: "Event not found" }, { status: 404 });
        }

        // RLS: ensure user can delete this event
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        try {
            const scope = await getUserScopeFilter(session.user.id);
            if (!scope.hasAccess) {
                return NextResponse.json({ error: "Access denied" }, { status: 403 });
            }

            // Check if user can delete this specific event
            if (scope.scope === 'region' && scope.regionId && existingEvent.regionId !== scope.regionId) {
                return NextResponse.json({ error: "Access denied - cannot delete event outside your region" }, { status: 403 });
            }
            if (scope.scope === 'university' && scope.universityId && existingEvent.universityId !== scope.universityId) {
                return NextResponse.json({ error: "Access denied - cannot delete event outside your university" }, { status: 403 });
            }
            if (scope.scope === 'smallgroup' && scope.smallGroupId && existingEvent.smallGroupId !== scope.smallGroupId) {
                return NextResponse.json({ error: "Access denied - cannot delete event outside your small group" }, { status: 403 });
            }
            if (scope.scope === 'alumnismallgroup' && scope.alumniGroupId && existingEvent.alumniGroupId !== scope.alumniGroupId) {
                return NextResponse.json({ error: "Access denied - cannot delete event outside your alumni group" }, { status: 403 });
            }
        } catch (e) {
            console.error('Error applying RLS validation:', e);
            return NextResponse.json({ error: "Access denied" }, { status: 403 });
        }

        await prisma.permanentministryevent.delete({
            where: { id: eventId }
        });
        
        return NextResponse.json({ message: "Event deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 });
    }
}
