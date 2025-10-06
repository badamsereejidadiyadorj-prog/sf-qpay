// server.js
import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

// QPay руу хүсэлт илгээх
app.post("/api/qpay", async (req, res) => {
  try {
    const tokenResponse = await axios.post("https://merchant.qpay.mn/v2/auth/token", {
      username: process.env.QPAY_USERNAME,
      password: process.env.QPAY_PASSWORD
    });

    res.json(tokenResponse.data);
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "QPay холболт амжилтгүй" });
  }
});

app.listen(8080, () => console.log("✅ Server running on port 8080"));
