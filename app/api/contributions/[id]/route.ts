import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../prisma/client";
import { createContributionSchema } from "../../validation/contribution";

// GET single contribution
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const contributionId = parseInt(id);
        if (isNaN(contributionId)) {
            return NextResponse.json({ error: "Invalid contribution ID" }, { status: 400 });
        }

        const contribution = await prisma.contribution.findUnique({
            where: { id: contributionId },
            include: { 
                contributor: { select: { id: true, name: true, email: true, phone: true } },
                contributiondesignation: { select: { id: true, name: true, description: true } },
                member: { select: { id: true, firstname: true, secondname: true, email: true } },
                paymenttransaction: { select: { id: true, externalId: true, status: true } }
            }
        });

        if (!contribution) {
            return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
        }

        return NextResponse.json(contribution, { status: 200 });
    } catch (error) {
        console.error("Error fetching contribution:", error);
        return NextResponse.json({ error: 'Failed to fetch contribution' }, { status: 500 });
    }
}

// PUT update contribution
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const contributionId = parseInt(id);
        if (isNaN(contributionId)) {
            return NextResponse.json({ error: "Invalid contribution ID" }, { status: 400 });
        }

        const body = await request.json();
        console.log("=== PUT REQUEST DEBUG ===");
        console.log("Request body:", JSON.stringify(body, null, 2));
        console.log("Body type:", typeof body);
        console.log("Body keys:", Object.keys(body));
        
        const validation = createContributionSchema.safeParse(body);
        
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

        // Check if contribution exists
        const existingContribution = await prisma.contribution.findUnique({
            where: { id: contributionId }
        });

        if (!existingContribution) {
            return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
        }

        const updatedContribution = await prisma.contribution.update({
            where: { id: contributionId },
            data: {
                contributorId: data.contributorId,
                amount: data.amount,
                method: data.method,
                designationId: data.designationId,
                status: data.status,
                transactionId: data.transactionId,
                paymentTransactionId: data.paymentTransactionId,
                memberId: data.memberId,
            },
            include: {
                contributor: { select: { id: true, name: true, email: true, phone: true } },
                contributiondesignation: { select: { id: true, name: true, description: true } },
                member: { select: { id: true, firstname: true, secondname: true, email: true } },
                paymenttransaction: { select: { id: true, externalId: true, status: true } }
            }
        });
        
        return NextResponse.json(updatedContribution, { status: 200 });
    } catch (error: any) {
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: "Transaction ID already exists" },
                    { status: 409 }
                );
            }
            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: "Foreign key constraint failed (invalid contributor, designation, member, or payment transaction)" },
                    { status: 400 }
                );
            }
        }
        console.error("Error updating contribution:", error);
        return NextResponse.json({ error: 'Failed to update contribution' }, { status: 500 });
    }
}

// DELETE contribution
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const contributionId = parseInt(id);
        if (isNaN(contributionId)) {
            return NextResponse.json({ error: "Invalid contribution ID" }, { status: 400 });
        }

        // Check if contribution exists
        const existingContribution = await prisma.contribution.findUnique({
            where: { id: contributionId }
        });

        if (!existingContribution) {
            return NextResponse.json({ error: "Contribution not found" }, { status: 404 });
        }

        await prisma.contribution.delete({
            where: { id: contributionId }
        });
        
        return NextResponse.json({ message: "Contribution deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting contribution:", error);
        return NextResponse.json({ error: 'Failed to delete contribution' }, { status: 500 });
    }
}
