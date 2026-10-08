module.exports = function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Use POST." });
    return;
  }
  const expected = process.env.OWNER_OVERRIDE_KEY || "";
  const body = req.body || {};
  const action = String(body.action || "").slice(0, 120);
  const reason = String(body.reason || "").slice(0, 500);
  if (!expected) {
    res.status(503).json({
      ok: false,
      error: "OWNER_OVERRIDE_KEY is not set. Add it in Vercel, then redeploy."
    });
    return;
  }
  if (!body.key || body.key !== expected) {
    res.status(401).json({ ok: false, error: "Override key did not match." });
    return;
  }
  const allowed = ["pause-selling", "resume-selling", "freeze-refunds", "release-refunds", "pause-ads"];
  if (!allowed.includes(action)) {
    res.status(400).json({ ok: false, error: "That action is not on the override list." });
    return;
  }
  const record = {
    ok: true,
    action,
    reason,
    at: new Date().toISOString(),
    note: "Logged for the Governance Agent. This demo stores the decision in the response only. Production writes an append-only audit row."
  };
  console.log(JSON.stringify({ event: "owner_override", ...record }));
  res.status(200).json(record);
};
