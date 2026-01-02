const withCors = require("../../../lib/cors");
const { getQpayToken, QPAY_API_URL } = require("../../../lib/qpay");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const payload = req.body;
    console.log("QPay Callback Received:", payload);

    const token = await getQpayToken();
    const qpayRes = await fetch(
      `${QPAY_API_URL}/invoice/${payload.invoice_id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const invoiceData = await qpayRes.json();
    console.log("Verified Invoice:", invoiceData);

    // TODO: Update your database/order status here
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error in /api/qpay/callback:", err.stack || err);
    res
      .status(500)
      .json({ error: "Callback handling failed", details: err.message });
  }
});
