import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";

export async function GET(request: NextRequest) {
    try {
        const contributors = await prisma.contributor.findMany({
            include: { 
                member: { select: { id: true, firstname: true, secondname: true, email: true } }
            },
            orderBy: { id: 'desc' }
        });
        return NextResponse.json(contributors, { status: 200 });
    } catch (error) {
        console.error("Error fetching contributors:", error);
        return NextResponse.json({ error: 'Failed to fetch contributors' }, { status: 500 });
    }
}
