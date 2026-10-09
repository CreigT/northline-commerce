const { setAccessCookie } = require("./access-cookie");

module.exports = async function handler(req, res) {
  const sessionId = String(req.query.session_id || "");
  const next = String(req.query.next || "/account");
  const safeNext = next.startsWith("/") ? next : "/account";
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (!sessionId || !key) {
    res.status(400).send("Missing checkout session.");
    return;
  }
  const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions/" + encodeURIComponent(sessionId), {
    headers: { Authorization: "Bearer " + key }
  });
  const session = await stripeRes.json();
  if (!stripeRes.ok || (session.payment_status !== "paid" && session.status !== "complete")) {
    res.status(402).send("Stripe has not marked this checkout paid yet.");
    return;
  }
  const label = String(session.metadata && session.metadata.tier || "");
  const name = String((session.line_items && session.line_items.data && session.line_items.data[0] && session.line_items.data[0].description) || "");
  const tier = label || (safeNext.indexOf("/desk") === 0 ? "operator" : "member");
  setAccessCookie(res, tier === "operator" ? "operator" : "member");
  res.status(302).setHeader("Location", safeNext + (safeNext.indexOf("?") === -1 ? "?" : "&") + "paid=1");
  res.end("Paid. Continue to " + safeNext + ". Item: " + name);
};
