const withCors = require("../../../lib/cors");
const {
  getQpayToken,
  QPAY_API_URL,
  QPAY_INVOICE_CODE,
} = require("../../../lib/qpay");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const { invoiceNumber, invoiceReceiverCode, amount, items } = req.body;
    const token = await getQpayToken();

    const qpayRes = await fetch(`${QPAY_API_URL}/invoice`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invoice_code: QPAY_INVOICE_CODE,
        sender_invoice_no: invoiceNumber,
        invoice_receiver_code: invoiceReceiverCode,
        invoice_description: "Payment invoice",
        amount,
        callback_url:
          (process.env.NEXT_PUBLIC_SITE_URL || "") + "/api/qpay/callback",
        extra_data: { items },
      }),
    });

    const data = await qpayRes.json();
    res.status(200).json(data);
  } catch (err) {
    console.error("Error in /api/qpay/create:", err.stack || err);
    res
      .status(500)
      .json({ error: "Failed to create invoice", details: err.message });
  }
});
module.exports.default = module.exports;
