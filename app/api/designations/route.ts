import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createDesignationSchema } from "../validation/designation";

export async function GET(request: NextRequest) {
    try {
        const designations = await prisma.contributionDesignation.findMany({
            include: { 
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallGroup: { select: { id: true, name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json({ designations }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch designations' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createDesignationSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
        }
        const data = validation.data;
        
        const newDesignation = await prisma.contributionDesignation.create({ 
            data: { 
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                targetAmount: data.targetAmount ? Number(data.targetAmount) : null,
                regionId: data.regionId ? Number(data.regionId) : null,
                universityId: data.universityId ? Number(data.universityId) : null,
                smallGroupId: data.smallGroupId ? Number(data.smallGroupId) : null,
            } 
        });
        return NextResponse.json(newDesignation, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "Designation name or code already exists" }, { status: 409 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ error: "Foreign key constraint failed (invalid region, university, or small group)" }, { status: 400 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 