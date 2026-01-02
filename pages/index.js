
const React = require("react");

function Home() {
  return React.createElement(
    "main",
    { style: { fontFamily: "Arial, sans-serif", padding: 24 } },
    React.createElement("h1", null, "qpay — Next.js conversion"),
    React.createElement(
      "p",
      null,
      "The project has been converted to Next.js. API routes live under /api/qpay."
    )
  );
}

module.exports = Home;
