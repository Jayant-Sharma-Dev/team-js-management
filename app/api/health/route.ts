import { checkDatabaseConnection } from "@/app/lib/db";
import { NextResponse } from "next/server";
export async function GET() {
    const isConnected = await checkDatabaseConnection();
    if(!isConnected){
        return NextResponse.json(
            {
                status: "error",
                message: "database connection failed",
            },{
                status: 503
            }
        )
    }
     return NextResponse.json(
            {
                status: "ok",
                message: "database connected successfully",
            },{
                status: 200
            }
        )
}