import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createRegionSchema } from "../validation/region";

export async function GET(request: NextRequest) {
    try {
        const regions = await prisma.region.findMany();
        return NextResponse.json({ regions }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch regions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createRegionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
        }
        const data = validation.data;
        const newRegion = await prisma.region.create({ data: { name: data.name } });
        return NextResponse.json(newRegion, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "Region name already exists" }, { status: 409 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 