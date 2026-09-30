import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { generateToken, hashPassword, verifyPassword } from "@/app/lib/auth";
import { Role } from "@/app/types";

export async function POST(request: NextRequest) {
    try {
        const { email, password, teamCode } = await request.json();

        // Validating the fields
        if (!email || !password) {
            return NextResponse.json(
                {
                    error: "email password required or are not valid"
                },
                {
                    status: 400
                },
            );
        }

        // Finding existing user
        const userFromDb = await prisma.user.findUnique({
            where: { email },
            include: { team: true },
        });

        if (!userFromDb) {
            return NextResponse.json(
                {
                    error: "Invaild credentials"
                },
                {
                    status: 401
                });
        }
        
        const validPassword = await verifyPassword(password, userFromDb.password)
        if (!validPassword) {
            return NextResponse.json(
                {
                    error: "Invaild credentials"
                },
                {
                    status: 401
                });
        }

        const token = generateToken(userFromDb.id);

        const response = NextResponse.json({
            userFromDb: {
                id: userFromDb.id,
                email: userFromDb.email,
                name: userFromDb.name,
                role: userFromDb.role,
                teamId: userFromDb.teamId,
                team: userFromDb.team,
                token,
            },
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7,
        });

        return response;
    } catch (error) {
        console.log("Login failed")
        return NextResponse.json(
            {
                error: "Something went wrong",
            },
            {
                status: 500,
            },
        );
    }
}