import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createTrainingSchema } from "../validation/training";

export async function GET(request: NextRequest) {
    try {
        const trainings = await prisma.trainings.findMany({
            include: { 
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallGroup: { select: { id: true, name: true } },
                alumniGroup: { select: { id: true, name: true } },
                createdBy: { select: { id: true, name: true } }
            },
            orderBy: { startDateTime: 'desc' }
        });
        return NextResponse.json({ trainings }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch trainings' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createTrainingSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
        }
        const data = validation.data;
        
        const newTraining = await prisma.trainings.create({ 
            data: { 
                name: data.name,
                description: data.description,
                startDateTime: new Date(data.startDateTime),
                endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
                location: data.location,
                regionId: data.regionId ? Number(data.regionId) : null,
                universityId: data.universityId ? Number(data.universityId) : null,
                smallGroupId: data.smallGroupId ? Number(data.smallGroupId) : null,
                alumniGroupId: data.alumniGroupId ? Number(data.alumniGroupId) : null,
                createdById: data.createdById,
            } 
        });
        return NextResponse.json(newTraining, { status: 201 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "Training name already exists" }, { status: 409 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ error: "Foreign key constraint failed (invalid region, university, small group, or alumni group)" }, { status: 400 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 