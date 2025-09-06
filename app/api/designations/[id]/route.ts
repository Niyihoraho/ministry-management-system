import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { createDesignationSchema } from "../../validation/designation";

// GET single designation
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const designationId = parseInt(id);
        if (isNaN(designationId)) {
            return NextResponse.json({ error: "Invalid designation ID" }, { status: 400 });
        }

        const designation = await prisma.contributiondesignation.findUnique({
            where: { id: designationId },
            include: { 
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallgroup: { select: { id: true, name: true } }
            }
        });

        if (!designation) {
            return NextResponse.json({ error: "Designation not found" }, { status: 404 });
        }

        return NextResponse.json(designation, { status: 200 });
    } catch (error) {
        console.error("Error fetching designation:", error);
        return NextResponse.json({ error: 'Failed to fetch designation' }, { status: 500 });
    }
}

// PUT update designation
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const designationId = parseInt(id);
        if (isNaN(designationId)) {
            return NextResponse.json({ error: "Invalid designation ID" }, { status: 400 });
        }

        const body = await request.json();
        console.log("=== PUT REQUEST DEBUG ===");
        console.log("Request body:", JSON.stringify(body, null, 2));
        console.log("Body type:", typeof body);
        console.log("Body keys:", Object.keys(body));
        
        const validation = createDesignationSchema.safeParse(body);
        
        if (!validation.success) {
            console.log("=== VALIDATION ERRORS ===");
            console.log("Validation errors:", JSON.stringify(validation.error.issues, null, 2));
            return NextResponse.json(
                { error: "Validation failed", details: validation.error.issues },
                { status: 400 }
            );
        }
        
        console.log("=== VALIDATION SUCCESS ===");
        console.log("Validated data:", JSON.stringify(validation.data, null, 2));

        const data = validation.data;

        // Check if designation exists
        const existingDesignation = await prisma.contributiondesignation.findUnique({
            where: { id: designationId }
        });

        if (!existingDesignation) {
            return NextResponse.json({ error: "Designation not found" }, { status: 404 });
        }

        const updatedDesignation = await prisma.contributiondesignation.update({
            where: { id: designationId },
            data: {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                targetAmount: data.targetAmount ? Number(data.targetAmount) : null,
                regionId: data.regionId ? Number(data.regionId) : null,
                universityId: data.universityId ? Number(data.universityId) : null,
                smallGroupId: data.smallGroupId ? Number(data.smallGroupId) : null,
                updatedAt: new Date()
            },
            include: {
                region: { select: { id: true, name: true } },
                university: { select: { id: true, name: true } },
                smallgroup: { select: { id: true, name: true } }
            }
        });
        
        return NextResponse.json(updatedDesignation, { status: 200 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: "Designation name already exists" },
                    { status: 409 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: "Foreign key constraint failed (invalid region, university, or small group)" },
                    { status: 400 }
                );
            }
        }
        console.error("Error updating designation:", error);
        return NextResponse.json({ error: 'Failed to update designation' }, { status: 500 });
    }
}

// DELETE designation
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const designationId = parseInt(id);
        if (isNaN(designationId)) {
            return NextResponse.json({ error: "Invalid designation ID" }, { status: 400 });
        }

        // Check if designation exists
        const existingDesignation = await prisma.contributiondesignation.findUnique({
            where: { id: designationId }
        });

        if (!existingDesignation) {
            return NextResponse.json({ error: "Designation not found" }, { status: 404 });
        }

        // Check if designation has contributions
        const contributionCount = await prisma.contribution.count({
            where: { designationId: designationId }
        });

        if (contributionCount > 0) {
            return NextResponse.json(
                { error: "Cannot delete designation with existing contributions" },
                { status: 400 }
            );
        }

        await prisma.contributiondesignation.delete({
            where: { id: designationId }
        });
        
        return NextResponse.json({ message: "Designation deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting designation:", error);
        return NextResponse.json({ error: 'Failed to delete designation' }, { status: 500 });
    }
}
