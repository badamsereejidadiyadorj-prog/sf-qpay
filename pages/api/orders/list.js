import supabase from "../../../lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();

  const { page = 1, limit = 10, search = "" } = req.query;

  const from = (page - 1) * limit;
  const to = from + Number(limit) - 1;

  let query = supabase
    .from("orders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(
      `customer_name.ilike.%${search}%,email.ilike.%${search}%,items.ilike.%${search}%`
    );
  }

  const { data, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({
    data,
    count,
    page: Number(page),
    limit: Number(limit),
  });
}
