import { getCurrentUser, checkUserPermission } from "@/app/lib/auth";
import { prisma } from "@/app/lib/db";
import { Role } from "@/app/types";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
	request: NextRequest,
	context: { params: Promise<{ userId: string }> },
) {
	try {
		const currentUser = await getCurrentUser();
		if (!currentUser || !checkUserPermission(currentUser, Role.ADMIN)) {
			return NextResponse.json(
				{ error: "You are not authorized to assign a team" },
				{ status: 403 },
			);
		}

		const { userId } = await context.params;
		const body = await request.json();
		const teamId = body.teamId;

		if (teamId !== null && typeof teamId !== "string") {
			return NextResponse.json(
				{ error: "teamId must be a string or null" },
				{ status: 400 },
			);
		}

		if (teamId !== null) {
			const team = await prisma.team.findUnique({
				where: { id: teamId },
				select: { id: true },
			});

			if (!team) {
				return NextResponse.json(
					{ error: "Team not found" },
					{ status: 404 },
				);
			}
		}

		const updatedUser = await prisma.user.update({
			where: { id: userId },
			data: { 
                teamId: teamId, 
            },
            include: {
                team: true,
            }, 
		});

		return NextResponse.json({ 
            user: updatedUser,
            message: teamId
            ? "User assigned successfully"
            : "User removed successfully" ,
        });
	} catch (error) {
		console.error("Team assignment failed:", error);

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
