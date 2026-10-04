import { getCurrentUser } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Prisma, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                {
                    error: "you are not authorized to get user access"
                },
                {
                    status: 401
                }
            );
        }
        const searchParams = request.nextUrl.searchParams;
        const teamId = searchParams.get("teamId");
        const role = searchParams.get("role");

        // Building where clause based on user
        const where: Prisma.UserWhereInput = {};
        if(user.role === Role.ADMIN){
            // Admin can see all user
        }
        else if(user.role === Role.MANAGER){
            // Manager can see team user 
            where.OR = [{teamId: user.teamId}, {role: Role.USER}];
        } else {
            // regular user can see only in their team
            where.teamId = user.teamId;
            where.role = {not: Role.ADMIN};
        }
        if (teamId) {
            where.teamId = teamId;
        }
        if (role) {
            where.role = role;
        }
        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                team: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                createdAt: true,
            },
            orderBy: {createdAt: "desc"}
        });
        return NextResponse.json({users});
    } catch (error) {
        console.log("erro");
        return NextResponse.json({
            error: "Internal server error"
        },
        {
            status: 500
        });
    }
}