import { getCurrentUser, checkUserPermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { Role as PrismaRole } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ userId: string }> },
) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
            return NextResponse.json(
                { error: "You are not authorized to change user roles" },
                { status: 403 },
            );
        }

        const { userId } = await context.params;
        const body = await request.json();
        const role = body.role;
        const validRoles = Object.values(Role);

        if (typeof role !== "string" || !validRoles.includes(role as Role)) {
            return NextResponse.json(
                { error: "role must be ADMIN, MANAGER, USER, or GUEST" },
                { status: 400 },
            );
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role: role as PrismaRole },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                team: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });

        return NextResponse.json({
            user: updatedUser,
            message: "User role updated successfully",
        });
    } catch (error) {
        console.error("Role update failed:", error);

        if (error instanceof Error && error.message.includes("Record to update not found")) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
