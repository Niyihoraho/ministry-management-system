import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../prisma/client";
import { createAttendanceSchema } from "../validation/attendance";
import { auth } from "../../authentication/auth";
import { getUserScopeFilter } from "../../utils/auth";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const where: any = {};
        
        // Event and status filters
        if (searchParams.has("eventId")) {
            where.permanentEventId = Number(searchParams.get("eventId"));
        }
        if (searchParams.has("status")) {
            where.status = searchParams.get("status");
        }
        
        // Date filters
        if (searchParams.has("dateFrom") || searchParams.has("dateTo")) {
            where.recordedAt = {};
            if (searchParams.has("dateFrom") && searchParams.get("dateFrom")) {
                const dateFrom = new Date(searchParams.get("dateFrom")!);
                dateFrom.setHours(0, 0, 0, 0);
                where.recordedAt.gte = dateFrom;
            }
            if (searchParams.has("dateTo") && searchParams.get("dateTo")) {
                const dateTo = new Date(searchParams.get("dateTo")!);
                dateTo.setHours(23, 59, 59, 999);
                where.recordedAt.lte = dateTo;
            }
        }
        
        // Check if explicit member organizational filters are provided
        const hasExplicitFilters = searchParams.has("regionId") || searchParams.has("universityId") || 
            searchParams.has("smallGroupId") || searchParams.has("alumniGroupId");
        
        // Member organizational filters
        if (hasExplicitFilters) {
            where.member = {};
            
            if (searchParams.has("regionId")) {
                where.member.regionId = Number(searchParams.get("regionId"));
            }
            if (searchParams.has("universityId")) {
                where.member.universityId = Number(searchParams.get("universityId"));
            }
            if (searchParams.has("smallGroupId")) {
                where.member.smallGroupId = Number(searchParams.get("smallGroupId"));
            }
            if (searchParams.has("alumniGroupId")) {
                where.member.alumniGroupId = Number(searchParams.get("alumniGroupId"));
            }
        } else {
            // If no explicit filters, apply scope-based filtering
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

                    // Apply scope-based filtering to member
                    where.member = {};
                    
                    if (scopeFilter.scope === 'region' && scopeFilter.regionId) {
                        // Regional users can only see attendance records for members in their region
                        where.member.regionId = scopeFilter.regionId;
                    } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
                        // University users can only see attendance records for members in their university
                        where.member.universityId = scopeFilter.universityId;
                    } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
                        // Small group users can only see attendance records for members in their small group
                        where.member.smallGroupId = scopeFilter.smallGroupId;
                    } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
                        // Alumni small group users can only see attendance records for members in their alumni group
                        where.member.alumniGroupId = scopeFilter.alumniGroupId;
                    }
                    // Superadmin and national users can see all attendance records (no additional filtering)
                } catch (error) {
                    console.error('Error applying RLS filter:', error);
                    return NextResponse.json(
                        { error: "Access denied" },
                        { status: 403 }
                    );
                }
            }
        }
        
        const attendance = await prisma.attendance.findMany({
            where,
            include: {
                member: { 
                    select: { 
                        id: true, 
                        firstname: true, 
                        secondname: true,
                        regionId: true,
                        universityId: true,
                        smallGroupId: true,
                        alumniGroupId: true
                    } 
                },
                permanentministryevent: { select: { id: true, name: true } },
                trainings: { select: { id: true, name: true } }
            }
        });
        return NextResponse.json({ attendance }, { status: 200 });
    } catch (error) {
        console.error("Error fetching attendance records:", error);
        return NextResponse.json({ error: 'Failed to fetch attendance records' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        if (!Array.isArray(body)) {
            return NextResponse.json({ error: "Expected an array of attendance records" }, { status: 400 });
        }

        const results = [];
        for (const record of body) {
            const validation = createAttendanceSchema.safeParse(record);
            if (!validation.success) {
                // Return flattened errors for a cleaner response
                results.push({ error: validation.error.flatten().fieldErrors, data: record });
                continue;
            }

            const data = validation.data;
            try {
                const attendanceData: any = {
                    memberId: data.memberId,
                    status: data.status,
                    notes: data.notes || null,
                };
                if (data.permanentEventId !== undefined) attendanceData.permanentEventId = data.permanentEventId;
                if (data.trainingId !== undefined) attendanceData.trainingId = data.trainingId;
                const created = await prisma.attendance.create({
                    data: attendanceData,
                });
            
                results.push({ success: true, data: created });
            } catch (error: any) {
                let errorMessage = "Could not create attendance record.";
                if (error.code === 'P2002') {
                
                    const target = (error.meta?.target as string[]) || [];
                    if (target.includes('permanentEventId')) {
                         errorMessage = "Attendance already recorded for this member and permanent event.";
                    } else if (target.includes('trainingId')) {
                         errorMessage = "Attendance already recorded for this member and training.";
                    } else {
                         errorMessage = "This attendance record already exists.";
                    }
                } else if (error.code === 'P2003') {
                   
                    errorMessage = "The specified member or event does not exist.";
                }
                results.push({ error: errorMessage, data: record });
            }
        }
        return NextResponse.json({ results }, { status: 201 });
    } catch (error) {
       
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}