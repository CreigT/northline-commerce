function productsFromEnv() {
  return [
    {
      sku: "pour-over",
      name: process.env.PRODUCT_1_NAME || "Charcoal pour-over set",
      price: process.env.PRODUCT_1_PRICE || "64",
      blurb: process.env.PRODUCT_1_BLURB || "Matte ceramic dripper and server. Made for a quiet morning.",
      image: "/images/pour-over.jpg",
      link: process.env.PRODUCT_1_LINK || ""
    },
    {
      sku: "linen",
      name: process.env.PRODUCT_2_NAME || "Oatmeal linen throw",
      price: process.env.PRODUCT_2_PRICE || "88",
      blurb: process.env.PRODUCT_2_BLURB || "Washed linen, light enough for a sofa, warm enough for a chair.",
      image: "/images/linen.jpg",
      link: process.env.PRODUCT_2_LINK || ""
    },
    {
      sku: "lamp",
      name: process.env.PRODUCT_3_NAME || "Brass desk lamp",
      price: process.env.PRODUCT_3_PRICE || "120",
      blurb: process.env.PRODUCT_3_BLURB || "A small lamp with a linen shade. For reading, not for show.",
      image: "/images/lamp.jpg",
      link: process.env.PRODUCT_3_LINK || ""
    }
  ];
}

module.exports = { productsFromEnv };
