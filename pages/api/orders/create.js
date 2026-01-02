const withCors = require("../../../lib/cors");
const supabase = require("../../../lib/supabase");

// POST /api/orders/create
// Expects JSON body with fields: customer_name, email, items (stringified JSON), total, qr_image
module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  // prefer server-side supabase client
  if (!supabase) {
    return res.status(500).json({
      error:
        "Supabase client not initialized. Check SUPABASE_URL and SUPABASE_SERVICE_KEY.",
    });
  }

  try {
    const { customer_name, email, items, total } = req.body;
    if (!customer_name || !email || !items) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const insertPayload = {
      customer_name,
      email,
      items,
      total: total || 0,
    };

    const { data, error } = await supabase
      .from("orders")
      .insert(insertPayload)
      .select();
    if (error) {
      console.error("Supabase insert error", error);
      return res.status(500).json({
        error: "Failed to save order",
        details: error.message || error,
      });
    }

    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error("Error in /api/orders/create", err.stack || err);
    return res
      .status(500)
      .json({ error: "Internal server error", details: err.message });
  }
});

module.exports.default = module.exports;
