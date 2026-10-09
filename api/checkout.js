const { productsFromEnv } = require("./products");

function form(body) {
  return new URLSearchParams(body).toString();
}

async function stripePost(path, body) {
  const key = process.env.STRIPE_SECRET_KEY || "";
  const res = await fetch("https://api.stripe.com/v1/" + path, {
    method: "POST",
    headers: {
      Authorization: "Bearer " + key,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: form(body)
  });
  const data = await res.json();
  if (!res.ok) {
    const message = (data.error && data.error.message) || "Stripe rejected the checkout.";
    throw new Error(message);
  }
  return data;
}

function origin(req) {
  const proto = req.headers["x-forwarded-proto"] || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  return proto + "://" + host;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Use POST." });
    return;
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const kind = String(body.kind || "");
  const sku = String(body.sku || "");
  const base = origin(req);
  const secret = process.env.STRIPE_SECRET_KEY || "";
  const products = productsFromEnv();

  if (!secret) {
    const link = kind === "member"
      ? process.env.STRIPE_MEMBER_LINK
      : kind === "operator"
        ? process.env.STRIPE_OPERATOR_LINK
        : (products.find((item) => item.sku === sku) || {}).link;
    if (link) {
      res.status(200).json({ ok: true, url: link, mode: "payment_link" });
      return;
    }
    res.status(409).json({
      ok: false,
      error: "Payments are not connected. Open /setup and add a Stripe secret key or a payment link.",
      setup: "/setup"
    });
    return;
  }

  let next = "/account";
  let mode = "payment";
  let name = "Order";
  let amount = 0;
  if (kind === "member") {
    mode = "subscription";
    name = "Member access";
    amount = Math.round(Number(process.env.MEMBER_PRICE || 12) * 100);
    next = "/account";
  } else if (kind === "operator") {
    mode = "subscription";
    name = "Operator desk";
    amount = Math.round(Number(process.env.OPERATOR_PRICE || 39) * 100);
    next = "/desk";
  } else {
    const item = products.find((product) => product.sku === sku);
    if (!item) {
      res.status(400).json({ ok: false, error: "Unknown product." });
      return;
    }
    if (item.link) {
      res.status(200).json({ ok: true, url: item.link, mode: "payment_link" });
      return;
    }
    name = item.name;
    amount = Math.round(Number(item.price) * 100);
    next = "/account?sku=" + encodeURIComponent(item.sku);
  }

  if (!amount) {
    res.status(400).json({ ok: false, error: "Price is missing." });
    return;
  }

  try {
    const session = await stripePost("checkout/sessions", {
      mode,
      success_url: base + "/api/access?session_id={CHECKOUT_SESSION_ID}&next=" + encodeURIComponent(next),
      cancel_url: base + "/pricing",
      "metadata[tier]": kind === "operator" ? "operator" : "member",
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": (process.env.CURRENCY || "usd").toLowerCase(),
      "line_items[0][price_data][unit_amount]": String(amount),
      "line_items[0][price_data][product_data][name]": name,
      ...(mode === "subscription" ? { "line_items[0][price_data][recurring][interval]": "month" } : {})
    });
    res.status(200).json({ ok: true, url: session.url, mode: "checkout" });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
};
