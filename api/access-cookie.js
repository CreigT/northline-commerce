const crypto = require("crypto");

function signingSecret() {
  return process.env.ACCESS_SIGNING_SECRET || process.env.OWNER_OVERRIDE_KEY || "";
}

function sign(tier, exp) {
  return crypto.createHmac("sha256", signingSecret()).update(tier + "." + exp).digest("hex");
}

function setAccessCookie(res, tier) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 30;
  const token = tier + "." + exp + "." + sign(tier, exp);
  const secure = process.env.VERCEL ? "; Secure" : "";
  res.setHeader("Set-Cookie", "northline_access=" + token + "; Path=/; HttpOnly; SameSite=Lax; Max-Age=2592000" + secure);
}

function readTier(req) {
  const secret = signingSecret();
  if (!secret) return "free";
  const raw = String(req.headers.cookie || "");
  const match = raw.match(/(?:^|; )northline_access=([^;]+)/);
  if (!match) return "free";
  const parts = decodeURIComponent(match[1]).split(".");
  if (parts.length !== 3) return "free";
  const [tier, exp, mac] = parts;
  if (!["member", "operator"].includes(tier)) return "free";
  if (Number(exp) < Date.now()) return "free";
  const expected = crypto.createHmac("sha256", secret).update(tier + "." + exp).digest("hex");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return "free";
  return tier;
}

module.exports = { setAccessCookie, readTier, signingSecret };
