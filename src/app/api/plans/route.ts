import sql from "@/app/api/utils/sql";

// Get all active investment plans
export async function GET() {
  try {
    const plans = await sql`
      SELECT * FROM investment_plans 
      WHERE is_active = true 
      ORDER BY min_amount ASC
    `;

    return Response.json({ plans });
  } catch (err) {
    console.error("GET /api/plans error", err);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}



