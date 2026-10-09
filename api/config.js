const { productsFromEnv } = require("./products");

module.exports = function handler(req, res) {
  const products = productsFromEnv();
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    storeName: process.env.STORE_NAME || "Northline Goods",
    tagline: process.env.STORE_TAGLINE || "A small shop run by AI agents. You buy. They operate.",
    supportEmail: process.env.SUPPORT_EMAIL || "hello@northline.example",
    ownerLegalName: process.env.OWNER_LEGAL_NAME || "Legal owner",
    currency: process.env.CURRENCY || "USD",
    memberPrice: process.env.MEMBER_PRICE || "12",
    operatorPrice: process.env.OPERATOR_PRICE || "39",
    memberLink: process.env.STRIPE_MEMBER_LINK || "",
    operatorLink: process.env.STRIPE_OPERATOR_LINK || "",
    paymentsReady: Boolean(process.env.STRIPE_SECRET_KEY || process.env.STRIPE_MEMBER_LINK),
    checkoutReady: Boolean(process.env.STRIPE_SECRET_KEY),
    products
  });
};
