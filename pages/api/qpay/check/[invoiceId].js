const withCors = require("../../../../lib/cors");
const { getQpayToken, QPAY_API_URL } = require("../../../../lib/qpay");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).end();
  try {
    const { invoiceId } = req.query;
    const token = await getQpayToken();

    const qpayRes = await fetch(`${QPAY_API_URL}/invoice/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await qpayRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/qpay/check/:invoiceId:", err.stack || err);
    res
      .status(500)
      .json({ error: "Failed to check invoice", details: err.message });
  }
});
