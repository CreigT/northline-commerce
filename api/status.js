module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    store: process.env.STORE_NAME || "Northline Goods",
    mode: process.env.SELLING_MODE || "open",
    agents: [
      { name: "Sales", state: "working", note: "Watching the shop page." },
      { name: "Support", state: "working", note: "No open tickets." },
      { name: "Pricing", state: "working", note: "Prices unchanged today." },
      { name: "Treasury", state: "waiting", note: "No payout due." },
      { name: "Governance", state: "working", note: "Override channel is armed if the key is set." }
    ],
    approvals: [
      { id: "apr-104", title: "Refund over $50", detail: "Order NL-204, linen throw, customer says it arrived stained.", impact: "Money leaves the account.", need: "operator" },
      { id: "apr-105", title: "New supplier contract", detail: "Pottery workshop asked for a 90-day exclusive.", impact: "Legal commitment.", need: "operator" }
    ]
  });
};
