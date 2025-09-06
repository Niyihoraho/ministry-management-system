import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { createContributionSchema } from "../validation/contribution";

export async function GET(request: NextRequest) {
    try {
        const contributions = await prisma.contribution.findMany({
            include: { 
                contributor: { select: { id: true, name: true, email: true, phone: true } },
                contributiondesignation: { select: { id: true, name: true, description: true } },
                member: { select: { id: true, firstname: true, secondname: true, email: true } },
                paymenttransaction: { select: { id: true, externalId: true, status: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(contributions, { status: 200 });
    } catch (error) {
        console.error("Error fetching contributions:", error);
        return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validation = createContributionSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: "Validation failed", details: validation.error.issues }, { status: 400 });
        }
        const data = validation.data;
        
        const newContribution = await prisma.contribution.create({ 
            data: { 
                contributorId: data.contributorId,
                amount: data.amount,
                method: data.method,
                designationId: data.designationId,
                status: data.status,
                transactionId: data.transactionId,
                paymentTransactionId: data.paymentTransactionId,
                memberId: data.memberId,
            } 
        });
        
        // Fetch the created contribution with relations
        const contributionWithRelations = await prisma.contribution.findUnique({
            where: { id: newContribution.id },
            include: { 
                contributor: { select: { id: true, name: true, email: true, phone: true } },
                contributiondesignation: { select: { id: true, name: true, description: true } },
                member: { select: { id: true, firstname: true, secondname: true, email: true } },
                paymenttransaction: { select: { id: true, externalId: true, status: true } }
            }
        });
        
        return NextResponse.json(contributionWithRelations, { status: 201 });
    } catch (error: any) {
        console.error("Error creating contribution:", error);
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2002') {
                return NextResponse.json({ error: "Transaction ID already exists" }, { status: 409 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({ error: "Foreign key constraint failed (invalid contributor, designation, member, or payment transaction)" }, { status: 400 });
            }
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
