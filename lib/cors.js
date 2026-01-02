const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim());

function getOrigin(req) {
  const origin = req.headers.origin || "";
  if (allowedOrigins.includes("*")) return "*";
  if (allowedOrigins.includes(origin)) return origin;
  return allowedOrigins[0] || "*";
}

function withCors(handler) {
  return async (req, res) => {
    const origin = getOrigin(req);
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    res.setHeader("Access-Control-Max-Age", "86400");
    // If you need credentials, set to 'true' and ensure allowedOrigins is explicit
    // res.setHeader('Access-Control-Allow-Credentials', 'true')

    if (req.method === "OPTIONS") {
      // Preflight request
      return res.status(200).end();
    }

    try {
      return await handler(req, res);
    } catch (err) {
      // ensure errors still send CORS headers
      if (!res.headersSent) {
        res.setHeader("Content-Type", "application/json");
        res.status(500).json({ error: "Internal server error" });
      }
      throw err;
    }
  };
}

module.exports = withCors;
