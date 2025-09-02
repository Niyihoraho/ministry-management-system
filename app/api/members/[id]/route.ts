import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import { auth } from "../../../authentication/auth";
import { getUserScopeFilter } from "../../../utils/auth";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const member = await prisma.member.findUnique({
      where: { id },
    });
    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Apply RLS validation - check if user can view this member
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const scopeFilter = await getUserScopeFilter(session.user.id);
      
      if (!scopeFilter.hasAccess) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      // Validate that user can view this member based on their scope
      if (scopeFilter.scope === 'region' && scopeFilter.regionId) {
        if (member.regionId !== scopeFilter.regionId) {
          return NextResponse.json(
            { error: "Access denied - can only view members in your assigned region" },
            { status: 403 }
          );
        }
      } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
        if (member.universityId !== scopeFilter.universityId) {
          return NextResponse.json(
            { error: "Access denied - can only view members in your assigned university" },
            { status: 403 }
          );
        }
      } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
        if (member.smallGroupId !== scopeFilter.smallGroupId) {
          return NextResponse.json(
            { error: "Access denied - can only view members in your assigned small group" },
            { status: 403 }
          );
        }
      } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
        if (member.alumniGroupId !== scopeFilter.alumniGroupId) {
          return NextResponse.json(
            { error: "Access denied - can only view members in your assigned alumni group" },
            { status: 403 }
          );
        }
      }
      // Superadmin and national users can view any member (no additional validation)
    } catch (error) {
      console.error('Error applying RLS validation:', error);
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    return NextResponse.json(member, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch member" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = Number(params.id);
    const body = await request.json();

    // Check if member exists
    const existingMember = await prisma.member.findUnique({
      where: { id },
    });
    if (!existingMember) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Apply RLS validation - check if user can update this member
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    try {
      const scopeFilter = await getUserScopeFilter(session.user.id);
      
      if (!scopeFilter.hasAccess) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }

      // Validate that user can update this member based on their scope
      if (scopeFilter.scope === 'region' && scopeFilter.regionId) {
        if (existingMember.regionId !== scopeFilter.regionId) {
          return NextResponse.json(
            { error: "Access denied - can only update members in your assigned region" },
            { status: 403 }
          );
        }
      } else if (scopeFilter.scope === 'university' && scopeFilter.universityId) {
        if (existingMember.universityId !== scopeFilter.universityId) {
          return NextResponse.json(
            { error: "Access denied - can only update members in your assigned university" },
            { status: 403 }
          );
        }
      } else if (scopeFilter.scope === 'smallgroup' && scopeFilter.smallGroupId) {
        if (existingMember.smallGroupId !== scopeFilter.smallGroupId) {
          return NextResponse.json(
            { error: "Access denied - can only update members in your assigned small group" },
            { status: 403 }
          );
        }
      } else if (scopeFilter.scope === 'alumnismallgroup' && scopeFilter.alumniGroupId) {
        if (existingMember.alumniGroupId !== scopeFilter.alumniGroupId) {
          return NextResponse.json(
            { error: "Access denied - can only update members in your assigned alumni group" },
            { status: 403 }
          );
        }
      }
      // Superadmin and national users can update any member (no additional validation)
    } catch (error) {
      console.error('Error applying RLS validation:', error);
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Helper function to handle empty strings and null values
    const handleEmptyValue = (value: any) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return value;
    };

    // Helper function to handle numeric values
    const handleNumericValue = (value: any) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return Number(value);
    };

    // Helper function to handle date values
    const handleDateValue = (value: any) => {
      if (value === "" || value === null || value === undefined) {
        return null;
      }
      return new Date(value);
    };

    const updated = await prisma.member.update({
      where: { id },
      data: {
        firstname: handleEmptyValue(body.firstname),
        secondname: handleEmptyValue(body.secondname),
        gender: handleEmptyValue(body.gender?.toLowerCase()),
        birthdate: handleDateValue(body.birthdate),
        placeOfBirthDistrict: handleEmptyValue(body.placeOfBirthDistrict),
        placeOfBirthSector: handleEmptyValue(body.placeOfBirthSector),
        placeOfBirthCell: handleEmptyValue(body.placeOfBirthCell),
        placeOfBirthVillage: handleEmptyValue(body.placeOfBirthVillage),
        localChurch: handleEmptyValue(body.localChurch),
        email: handleEmptyValue(body.email),
        phone: handleEmptyValue(body.phone),
        type: body.type ? body.type.toLowerCase() as any : existingMember.type,
        status: body.status ? body.status.toLowerCase() as any : existingMember.status,
        regionId: handleNumericValue(body.regionId),
        universityId: handleNumericValue(body.universityId),
        smallGroupId: handleNumericValue(body.smallGroupId),
        alumniGroupId: handleNumericValue(body.alumniGroupId),
        graduationDate: handleDateValue(body.graduationDate),
        faculty: handleEmptyValue(body.faculty),
        professionalism: handleEmptyValue(body.professionalism),
        maritalStatus: handleEmptyValue(body.maritalStatus),
        updatedAt: new Date(),
      },
    });
    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    console.error("Failed to update member:", error);
    
    // Handle specific Prisma errors
    if (typeof error === 'object' && error !== null && 'code' in error) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 409 }
        );
      }
      if (error.code === 'P2003') {
        return NextResponse.json(
          { error: "Foreign key constraint failed" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ error: error?.message || "Failed to update member" }, { status: 500 });
  }
} 