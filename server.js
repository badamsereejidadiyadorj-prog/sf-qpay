// server.js
require("dotenv").config();
const express = require("express");
const fetch = require("node-fetch"); // npm install node-fetch@2
const btoa = require("btoa"); // npm install btoa
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: "*", // or specify: ["https://yourdomain.com"]
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(bodyParser.json());

const QPAY_API_URL = "https://merchant.qpay.mn/v2";

// ---------------------------
// 1. Get QPay Token
// ---------------------------
async function getQpayToken() {
  const clientId = process.env.QPAY_CLIENT_ID;
  const clientSecret = process.env.QPAY_CLIENT_SECRET;
  const encodedCredentials = btoa(`${clientId}:${clientSecret}`);

  const res = await fetch(`${QPAY_API_URL}/auth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${encodedCredentials}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  if (!data.access_token) throw new Error("Failed to get QPay token");
  return data.access_token;
}

// ---------------------------
// 2. Create Invoice
// ---------------------------
app.post("/api/qpay/create", async (req, res) => {
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
        invoice_code: process.env.QPAY_INVOICE_CODE,
        sender_invoice_no: invoiceNumber,
        invoice_receiver_code: invoiceReceiverCode,
        invoice_description: "Payment invoice",
        amount,
        callback_url: process.env.NEXTAUTH_URL + "/api/qpay/callback",
        extra_data: { items },
      }),
    });

    const data = await qpayRes.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create invoice" });
  }
});

// ---------------------------
// 3. Check Invoice
// ---------------------------
app.get("/api/qpay/check/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    const token = await getQpayToken();

    const qpayRes = await fetch(`${QPAY_API_URL}/invoice/${invoiceId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await qpayRes.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check invoice" });
  }
});

// ---------------------------
// 4. Callback / Finish
// ---------------------------
app.post("/api/qpay/callback", async (req, res) => {
  try {
    const payload = req.body;
    console.log("QPay Callback Received:", payload);

    // You can verify payment by calling checkInvoice
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
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Callback handling failed" });
  }
});

// ---------------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`QPay Node server running on port ${PORT}`));
