import { prisma } from "@/app/lib/db";
import bcrypt from "bcryptjs";

async function main() {
    const password = await bcrypt.hash("Password123!", 12);
    const teams = [
        {
            name: "Engineering",
            code: "ENG",
            description: "Builds and maintains the product.",
            manager: { name: "John Developer", email: "john@company.com" },
            users: [
                { name: "Jane Designer", email: "jane@company.com" },
                { name: "Mike Engineer", email: "mike@company.com" },
                { name: "Sara QA", email: "sara@company.com" },
            ],
        },
        {
            name: "Marketing",
            code: "MKT",
            description: "Creates demand and tells the product story.",
            manager: { name: "Bob Marketer", email: "bob@company.com" },
            users: [
                { name: "Alice Content", email: "alice@company.com" },
                { name: "Eva Social", email: "eva@company.com" },
                { name: "Tom Growth", email: "tom@company.com" },
            ],
        },
        {
            name: "Sales",
            code: "SLS",
            description: "Builds customer relationships and revenue.",
            manager: { name: "Priya Sales", email: "priya@company.com" },
            users: [
                { name: "David Account", email: "david@company.com" },
                { name: "Nina Solutions", email: "nina@company.com" },
                { name: "Leo Partnerships", email: "leo@company.com" },
            ],
        },
    ];

    for (const teamData of teams) {
        const team = await prisma.team.upsert({
            where: { code: teamData.code },
            update: {
                name: teamData.name,
                description: teamData.description,
            },
            create: {
                name: teamData.name,
                code: teamData.code,
                description: teamData.description,
            },
        });

        await prisma.user.upsert({
            where: { email: teamData.manager.email },
            update: {
                name: teamData.manager.name,
                password,
                role: "MANAGER",
                teamId: team.id,
            },
            create: {
                ...teamData.manager,
                password,
                role: "MANAGER",
                teamId: team.id,
            },
        });

        for (const userData of teamData.users) {
            await prisma.user.upsert({
                where: { email: userData.email },
                update: {
                    name: userData.name,
                    password,
                    role: "USER",
                    teamId: team.id,
                },
                create: {
                    ...userData,
                    password,
                    role: "USER",
                    teamId: team.id,
                },
            });
        }
    }

    const unassignedUsers = [
        { name: "Dipesh Malvia", email: "dipesh@gmail.com", role: "ADMIN" as const },
        { name: "Nikesh G", email: "niks@gmail.com", role: "USER" as const },
    ];

    for (const userData of unassignedUsers) {
        await prisma.user.upsert({
            where: { email: userData.email },
            update: { ...userData, password, teamId: null },
            create: { ...userData, password },
        });
    }

    console.log("Seeded 3 teams, 12 team members, and 2 unassigned users.");
}

main().catch((error) => {
    console.error("Seeding failed:", error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect();
});