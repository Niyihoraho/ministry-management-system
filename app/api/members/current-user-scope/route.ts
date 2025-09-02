import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { auth } from "../../../authentication/auth";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userRole = await prisma.userrole.findFirst({
            where: {
                userId: session.user.id
            },
            include: {
                region: {
                    select: { id: true, name: true }
                },
                university: {
                    select: { id: true, name: true, regionId: true }
                },
                smallgroup: {
                    select: { id: true, name: true, regionId: true, universityId: true }
                },
                alumnismallgroup: {
                    select: { id: true, name: true, regionId: true }
                }
            },
            orderBy: { assignedAt: 'desc' }
        });

        if (!userRole) {
            return NextResponse.json(
                { error: "No role found for user" },
                { status: 403 }
            );
        }

        return NextResponse.json({
            scope: userRole.scope,
            region: userRole.region,
            university: userRole.university,
            smallGroup: userRole.smallgroup,
            alumniGroup: userRole.alumnismallgroup
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user scope:", error);
        return NextResponse.json(
            { error: 'Failed to fetch user scope' },
            { status: 500 }
        );
    }
}
