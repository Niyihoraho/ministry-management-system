import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";
import prisma from "../../../../prisma/client";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 }
            );
        }

        // Get user's scope information
        const scopeFilter = await getUserScopeFilter(session.user.id);
        
        if (!scopeFilter.hasAccess) {
            return NextResponse.json(
                { error: "Access denied" },
                { status: 403 }
            );
        }

        // Fetch additional details for the scope
        let scopeDetails: any = {
            scope: scopeFilter.scope,
            regionId: scopeFilter.regionId,
            universityId: scopeFilter.universityId,
            smallGroupId: scopeFilter.smallGroupId,
            alumniGroupId: scopeFilter.alumniGroupId,
        };

        // Fetch region name if regionId exists
        if (scopeFilter.regionId) {
            const region = await prisma.region.findUnique({
                where: { id: scopeFilter.regionId },
                select: { name: true }
            });
            if (region) {
                scopeDetails.regionName = region.name;
            }
        }

        // Fetch university name if universityId exists
        if (scopeFilter.universityId) {
            const university = await prisma.university.findUnique({
                where: { id: scopeFilter.universityId },
                select: { name: true }
            });
            if (university) {
                scopeDetails.universityName = university.name;
            }
        }

        // Fetch small group name if smallGroupId exists
        if (scopeFilter.smallGroupId) {
            const smallGroup = await prisma.smallgroup.findUnique({
                where: { id: scopeFilter.smallGroupId },
                select: { name: true }
            });
            if (smallGroup) {
                scopeDetails.smallGroupName = smallGroup.name;
            }
        }

        // Fetch alumni group name if alumniGroupId exists
        if (scopeFilter.alumniGroupId) {
            const alumniGroup = await prisma.alumnismallgroup.findUnique({
                where: { id: scopeFilter.alumniGroupId },
                select: { name: true }
            });
            if (alumniGroup) {
                scopeDetails.alumniGroupName = alumniGroup.name;
            }
        }

        return NextResponse.json({ scope: scopeDetails }, { status: 200 });
    } catch (error) {
        console.error("Error fetching user scope:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}