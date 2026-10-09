window.Northline = (function () {
  const FALLBACK = {
    storeName: "Northline Goods",
    tagline: "A small shop run by AI agents. You buy. They operate.",
    supportEmail: "hello@northline.example",
    ownerLegalName: "Legal owner",
    currency: "USD",
    memberPrice: "12",
    operatorPrice: "39",
    memberLink: "",
    operatorLink: "",
    successUrl: "",
    products: [
      { sku: "pour-over", name: "Charcoal pour-over set", price: "64", blurb: "Matte ceramic dripper and server. Made for a quiet morning.", image: "/images/pour-over.jpg", link: "" },
      { sku: "linen", name: "Oatmeal linen throw", price: "88", blurb: "Washed linen, light enough for a sofa, warm enough for a chair.", image: "/images/linen.jpg", link: "" },
      { sku: "lamp", name: "Brass desk lamp", price: "120", blurb: "A small lamp with a linen shade. For reading, not for show.", image: "/images/lamp.jpg", link: "" }
    ]
  };

  function tier() {
    return localStorage.getItem("northline_tier") || "free";
  }
  function setTier(next) {
    localStorage.setItem("northline_tier", next);
    paintTier();
  }
  function tierLabel(value) {
    if (value === "operator") return "Operator";
    if (value === "member") return "Member";
    return "Free browse";
  }
  function can(need) {
    const rank = { free: 0, member: 1, operator: 2 };
    return (rank[tier()] || 0) >= (rank[need] || 0);
  }

  async function loadConfig() {
    try {
      const res = await fetch("/api/config", { cache: "no-store" });
      if (!res.ok) throw new Error("config");
      const data = await res.json();
      return Object.assign({}, FALLBACK, data, {
        products: (data.products && data.products.length) ? data.products : FALLBACK.products
      });
    } catch (err) {
      return FALLBACK;
    }
  }

  function paintTier() {
    document.querySelectorAll("[data-tier-label]").forEach((el) => {
      el.textContent = tierLabel(tier());
    });
    document.querySelectorAll("[data-need]").forEach((el) => {
      const need = el.getAttribute("data-need");
      el.hidden = can(need);
    });
    document.querySelectorAll("[data-show]").forEach((el) => {
      el.hidden = !can(el.getAttribute("data-show"));
    });
  }

  function nav(current) {
    const header = document.querySelector("[data-header]");
    if (!header) return;
    header.innerHTML = `
      <div class="wrap">
        <a class="brand" href="/" data-store>Northline Goods</a>
        <button class="menu-btn" type="button" aria-label="Open menu">Menu</button>
        <nav class="nav">
          <a href="/shop" ${current === "shop" ? 'aria-current="page"' : ""}>Shop</a>
          <a href="/how" ${current === "how" ? 'aria-current="page"' : ""}>How it works</a>
          <a href="/pricing" ${current === "pricing" ? 'aria-current="page"' : ""}>Paywall</a>
          <a href="/account" ${current === "account" ? 'aria-current="page"' : ""}>Account</a>
          <a href="/desk" ${current === "desk" ? 'aria-current="page"' : ""}>Operator desk</a>
          <a href="/setup" ${current === "setup" ? 'aria-current="page"' : ""}>Setup</a>
          <span class="tier-pill">Access: <span data-tier-label>${tierLabel(tier())}</span></span>
        </nav>
      </div>`;
    const btn = header.querySelector(".menu-btn");
    const menu = header.querySelector(".nav");
    btn.addEventListener("click", () => menu.classList.toggle("open"));
  }

  function footer() {
    const el = document.querySelector("[data-footer]");
    if (!el) return;
    el.innerHTML = `
      <div class="wrap">
        <strong data-store>Northline Goods</strong> is the public face of an autonomous commerce company.
        Agents run the shop. You are the customer, or the legal owner with an emergency key.
        <div style="margin-top:8px">Support: <a data-email href="mailto:hello@northline.example">hello@northline.example</a></div>
      </div>`;
  }

  function applyBrand(config) {
    document.querySelectorAll("[data-store]").forEach((el) => { el.textContent = config.storeName; });
    document.querySelectorAll("[data-tagline]").forEach((el) => { el.textContent = config.tagline; });
    document.querySelectorAll("[data-email]").forEach((el) => {
      el.textContent = config.supportEmail;
      if (el.tagName === "A") el.href = "mailto:" + config.supportEmail;
    });
    document.title = document.title.replace("Northline Goods", config.storeName);
  }

  async function boot(current) {
    nav(current);
    footer();
    const params = new URLSearchParams(location.search);
    try {
      const me = await fetch("/api/me", { cache: "no-store" });
      if (me.ok) {
        const access = await me.json();
        if (access.tier && access.tier !== "free") setTier(access.tier);
      }
    } catch (err) {}
    if (params.get("paid") === "member" || params.get("paid") === "operator") {
      setTier(params.get("paid"));
    }
    const config = await loadConfig();
    applyBrand(config);
    paintTier();
    return config;
  }

  async function pay(kind, sku) {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind, sku })
    });
    const data = await res.json();
    if (data.url) {
      location.href = data.url;
      return;
    }
    location.href = data.setup || "/setup";
  }

  return { boot, tier, setTier, can, pay, paintTier };
})();
