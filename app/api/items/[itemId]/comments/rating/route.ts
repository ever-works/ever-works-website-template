import { NextResponse } from "next/server";
import { db } from "@/lib/db/drizzle";
import { comments } from "@/lib/db/schema";
import { and, avg, count, isNull, eq } from "drizzle-orm";
import { checkDatabaseAvailability } from "@/lib/utils/database-check";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    // Check database availability first
    const dbCheck = checkDatabaseAvailability();
    if (dbCheck) return dbCheck;
    const result = await db
      .select({
        averageRating: avg(comments.rating).as("averageRating"),
        totalRatings: count().as("totalRatings"),
      })
      .from(comments)
      .where(
        and(
          eq(comments.itemId, (await params).itemId),
          isNull(comments.deletedAt)
        )
      );

    const { averageRating, totalRatings } = result[0];

    return NextResponse.json({
      averageRating: Number(averageRating) || 0,
      totalRatings: Number(totalRatings) || 0,
    });
  } catch (error) {
    console.error("Failed to fetch ratings:", error);
    return NextResponse.json(
      { error: "Failed to fetch ratings" },
      { status: 500 }
    );
  }
} 