import { useEffect, useMemo, useState } from "react";
import { FiX, FiFilter, FiShoppingCart, FiHeart, FiCheck, FiPackage, FiPercent, FiTrendingUp } from "react-icons/fi";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";

const localTranslations = {
  EN: {
    filters: "Filters",
    refineProducts: "Refine products by need.",
    category: "Category",
    all: "All",
    seeds: "Seeds",
    tools: "Tools",
    inputs: "Inputs",
    fertilizer: "Fertilizer",
    delivery: "Delivery",
    fastDelivery: "Fast delivery only",
    arrives48h: "Arrives within 48 hours",
    budget: "Budget",
    cartSummary: "Cart summary",
    readyCheckout: "Ready for checkout.",
    items: "Items",
    subtotal: "Subtotal",
    free: "Free",
    proceedCheckout: "Proceed to checkout",
    verifiedSellers: "Verified sellers",
    acrossRegion: "Across your region",
    ordersToday: "Orders today",
    pendingDispatch: "12 pending dispatch",
    savings: "Savings",
    seasonalBundles: "On seasonal bundles",
    noProducts: "No products available.",
    freeDeliveryOver: "Free delivery over LKR 5,000",
    addToCart: "Add to cart",
    highQuality: "High quality",
    from: "from",
    updateListing: "Update listing",
    addNewProduct: "Add a new product",
    enterHarvest: "Enter your harvest details to start selling to the community.",
    productName: "Product Name",
    priceLkr: "Price (LKR)",
    qty: "Quantity",
    desc: "Description",
    photo: "Photo",
    updateProduct: "Update Product",
    publishListing: "Publish Listing",
    checkoutSuccess: "Checkout successful! Orders placed.",
    checkoutFailed: "Checkout failed.",
    failedLoad: "Failed to load products.",
    failedAdd: "Failed to add listing.",
    localFarmers: "local farmers"
  },
  SI: {
    filters: "පෙරහන්",
    refineProducts: "ඔබගේ අවශ්‍යතාවය අනුව නිෂ්පාදන තෝරන්න.",
    category: "කාණ්ඩය",
    all: "සියල්ල",
    seeds: "බීජ",
    tools: "උපකරණ",
    inputs: "ආදාන",
    fertilizer: "පොහොර",
    delivery: "බෙදා හැරීම",
    fastDelivery: "ඉක්මන් බෙදා හැරීම් පමණි",
    arrives48h: "පැය 48ක් ඇතුළත ලැබේ",
    budget: "අයවැය",
    cartSummary: "කරත්ත සාරාංශය",
    readyCheckout: "ගෙවීම් කිරීමට සූදානම්.",
    items: "අයිතම",
    subtotal: "මුළු මුදල",
    free: "නොමිලේ",
    proceedCheckout: "ගෙවීම් කරන්න",
    verifiedSellers: "තහවුරු කළ විකුණුම්කරුවන්",
    acrossRegion: "ඔබේ ප්‍රදේශය පුරා",
    ordersToday: "අද ඇණවුම්",
    pendingDispatch: "යැවීමට 12 ක් ඇත",
    savings: "ඉතිරිය",
    seasonalBundles: "කන්නයේ දීමනා සඳහා",
    noProducts: "නිෂ්පාදන නොමැත.",
    freeDeliveryOver: "රු. 5,000 ට වැඩි ඇණවුම් සඳහා බෙදා හැරීම නොමිලේ",
    addToCart: "කරත්තයට එකතු කරන්න",
    highQuality: "උසස් තත්ත්වයේ",
    from: "වෙතින්",
    updateListing: "ලැයිස්තුව යාවත්කාලීන කරන්න",
    addNewProduct: "නව නිෂ්පාදනයක් එකතු කරන්න",
    enterHarvest: "අනෙක් අයට විකිණීම සඳහා ඔබේ අස්වනු විස්තර ඇතුළත් කරන්න.",
    productName: "නිෂ්පාදනයේ නම",
    priceLkr: "මිල (රු.)",
    qty: "ප්‍රමාණය",
    desc: "විස්තරය",
    photo: "ඡායාරූපය",
    updateProduct: "නිෂ්පාදනය යාවත්කාලීන කරන්න",
    publishListing: "ලැයිස්තුගත කරන්න",
    checkoutSuccess: "ඇණවුම් සාර්ථකයි!",
    checkoutFailed: "ඇණවුම අසාර්ථකයි.",
    failedLoad: "නිෂ්පාදන පූරණය කිරීම අසාර්ථක විය.",
    failedAdd: "ලැයිස්තුවට එකතු කිරීම අසාර්ථක විය.",
    localFarmers: "ප්‍රාදේශීය ගොවීන්"
  },
  TA: {
    filters: "வடிப்பான்கள்",
    refineProducts: "தேவைக்கேற்ப தயாரிப்புகளை செம்மைப்படுத்தவும்.",
    category: "வகை",
    all: "அனைத்தும்",
    seeds: "விதைகள்",
    tools: "கருவிகள்",
    inputs: "உள்ளீடுகள்",
    fertilizer: "உரம்",
    delivery: "வினியோகம்",
    fastDelivery: "விரைவான வினியோகம் மட்டும்",
    arrives48h: "48 மணி நேரத்திற்குள் வரும்",
    budget: "பட்ஜெட்",
    cartSummary: "வண்டி சுருக்கம்",
    readyCheckout: "வெளியேற தயார்.",
    items: "பொருட்கள்",
    subtotal: "மொத்தம்",
    free: "இலவசம்",
    proceedCheckout: "வெளியேறு",
    verifiedSellers: "சரிபார்க்கப்பட்ட விற்பனையாளர்கள்",
    acrossRegion: "உங்கள் பிராந்தியம் முழுவதும்",
    ordersToday: "இன்று ஆர்டர்கள்",
    pendingDispatch: "12 அனுப்புதலில் உள்ளது",
    savings: "சேமிப்பு",
    seasonalBundles: "பருவ கால சலுகைகளில்",
    noProducts: "தயாரிப்புகள் இல்லை.",
    freeDeliveryOver: "ரூ. 5,000 க்கு மேல் இலவச வினியோகம்",
    addToCart: "வண்டியில் சேர்",
    highQuality: "உயர் தரம்",
    from: "இருந்து",
    updateListing: "பட்டியலை புதுப்பிக்கவும்",
    addNewProduct: "புதிய தயாரிப்பைச் சேர்க்கவும்",
    enterHarvest: "சமூகத்திற்கு விற்க உங்கள் அறுவடை விவரங்களை உள்ளிடவும்.",
    productName: "தயாரிப்பு பெயர்",
    priceLkr: "விலை (ரூ.)",
    qty: "அளவு",
    desc: "விளக்கம்",
    photo: "புகைப்படம்",
    updateProduct: "தயாரிப்பை புதுப்பிக்கவும்",
    publishListing: "பட்டியலிடவும்",
    checkoutSuccess: "வெளியேறுதல் வெற்றிகரமானது! ஆர்டர்கள் வைக்கப்பட்டன.",
    checkoutFailed: "வெளியேறுதல் தோல்வியடைந்தது.",
    failedLoad: "தயாரிப்புகளை ஏற்றுவதில் தோல்வி.",
    failedAdd: "பட்டியலில் சேர்க்கத் தவறிவிட்டது.",
    localFarmers: "உள்ளூர் விவசாயிகள்"
  }
};

const items = [
  { si: "හාල්", en: "rice", category: "grains" },
  { si: "තක්කාලි", en: "tomato", category: "vegetables" },
  { si: "ඉරිඟු", en: "maize", category: "grains" },
  { si: "කෙසෙල්", en: "banana", category: "fruits" },
  { si: "රසායනාගාර පොහොර", en: "fertilizer", category: "fertilizers" },
  { si: "බීජ", en: "seedling", category: "seedlings" },
  { si: "කුළුබඩු", en: "tubers", category: "tubers" },
];

export default function Market() {
  const { user } = useAuth();
  const [tab, setTab] = useState("marketplace");
  const [marketProducts, setMarketProducts] = useState([]);
  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [err, setErr] = useState("");
  const { lang, t: globalT } = useLang();
  const t = (key) => localTranslations[lang?.toUpperCase()]?.[key] || globalT(key) || key;

  const [crop_name, setCropName] = useState("");
  const [quantity, setQuantity] = useState(10);
  const [unit, setUnit] = useState("kg");
  const [price, setPrice] = useState(250);
  const [photo_url, setPhotoUrl] = useState("");
  const [harvest_date, setHarvestDate] = useState("");
  const [loc, setLoc] = useState("");
  const [seller_name, setSellerName] = useState("");
  const [description, setDescription] = useState("");

  const [cart, setCart] = useState([]);
  const [fastDelivery, setFastDelivery] = useState(false);

  const filteredProducts = useMemo(() => {
    return marketProducts.filter((p) => p.is_available);
  }, [marketProducts]);

  const reload = async () => {
    try {
      setErr("");
      const [marketRes, mineRes] = await Promise.all([
        api.get("/marketplace/products"),
        api.get("/marketplace/products/mine"),
      ]);
      setMarketProducts(marketRes.data.products || []);
      setMyProducts(mineRes.data.products || []);
    } catch (e) {
      setErr(e?.message || t("failedLoad"));
    }
  };

  useEffect(() => {
    reload().catch(() => {});
  }, [user?.id]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => setLoc(`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`),
      () => {},
      { timeout: 12000 }
    );
  }, []);

  const onPickPhoto = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  const resetProductForm = () => {
    setCropName("");
    setQuantity(10);
    setUnit("kg");
    setPrice(250);
    setPhotoUrl("");
    setHarvestDate("");
    setLoc("");
    setSellerName(user?.full_name || "");
    setDescription("");
    setEditingProduct(null);
  };

  const openProductSheet = (product) => {
    if (!product) {
      resetProductForm();
      setSheetOpen(true);
      return;
    }
    setEditingProduct(product);
    setCropName(product.crop_name || items[0].si);
    setQuantity(product.quantity || 10);
    setUnit(product.unit || "kg");
    setPrice(product.price_per_unit || 250);
    setPhotoUrl(product.photo_url || "");
    setHarvestDate(product.harvest_date ? String(product.harvest_date).slice(0, 10) : "");
    setLoc(product.location || user?.location || "");
    setSellerName(product.seller_name || user?.full_name || "");
    setDescription(product.description || "");
    setSheetOpen(true);
  };

  const saveProduct = async () => {
    try {
      setErr("");
      const payload = {
        crop_name,
        quantity: Number(quantity),
        unit,
        price_per_unit: Number(price),
        photo_url: photo_url || null,
        seller_name: seller_name || user?.full_name || null,
        description: description || null,
        location: loc || user?.location || null,
        harvest_date: harvest_date ? `${harvest_date}T00:00:00` : null,
        is_available: true,
      };

      if (editingProduct) {
        await api.put(`/marketplace/products/${editingProduct.id}`, payload);
      } else {
        await api.post("/marketplace/products", payload);
      }

      setSheetOpen(false);
      resetProductForm();
      await reload();
    } catch (e) {
      setErr(e?.message || t("failedAdd"));
    }
  };

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
  };

  const cartTotal = cart.reduce((acc, item) => acc + Number(item.price_per_unit), 0);

  const buyCart = async () => {
    if (!cart.length) return;
    try {
      setErr("");
      for (const item of cart) {
        await api.post("/marketplace/orders", {
          product_id: item.id,
          buyer_name: user?.full_name || "",
          buyer_phone: user?.phone || "",
          buyer_address: user?.location || "",
          quantity: 1,
          payment_method: "cod",
        });
      }
      setCart([]);
      alert(t("checkoutSuccess"));
      await reload();
    } catch (e) {
      setErr(e?.message || t("checkoutFailed"));
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px", paddingBottom: 100 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 32 }}>
        <div>
           <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>{t("marketTitle")}</h1>
           <div style={{ fontSize: 14, color: "#64748b" }}>{t("marketSubtitle")}</div>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
           <button style={{ background: "#fff", color: "#1e293b", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 999, fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#f1f5f9"} onMouseLeave={e=>e.currentTarget.style.background="#fff"}>
             {t("sortRelevance")}
           </button>
           <button onClick={() => openProductSheet(null)} style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 999, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8, boxShadow: "0 4px 12px rgba(11, 194, 92, 0.2)" }}>
             {t("sellItem")}
           </button>
        </div>
      </div>

      {err ? <div style={{ padding: 16, background: "#fee2e2", color: "#ef4444", borderRadius: 12, marginBottom: 24, fontWeight: 600 }}>{err}</div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 32 }}>
        {/* Left Column (Main Content) */}
        <div>
           <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)", marginBottom: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 900, color: "#0f172a", margin: 0 }}>{t("featuredDeals")}</h2>
                  <div style={{ fontSize: 13, color: "#64748b" }}>{t("topRatedProducts")}</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                   <button style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t("all")}</button>
                   <button style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t("seeds")}</button>
                   <button style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t("tools")}</button>
                   <button style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "6px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer" }}>{t("fertilizer")}</button>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24 }}>
                {filteredProducts.slice(0, 4).map((p) => (
                  <div key={p.id} style={{ background: "#f8fafc", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", position: "relative" }}>
                     <div style={{ height: 160, borderRadius: 12, overflow: "hidden", marginBottom: 16, background: "#e2e8f0" }}>
                        {p.photo_url ? (
                          <img src={p.photo_url} alt={p.crop_name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40 }}>🌱</div>
                        )}
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                        <div style={{ fontSize: 16, fontWeight: 800, color: "#0f172a" }}>{p.crop_name}</div>
                        <button style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}><FiHeart size={18} /></button>
                     </div>
                     <div style={{ fontSize: 13, color: "#64748b", marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {p.description || `${t("highQuality")} ${p.crop_name} ${t("from")} ${p.seller_name || t("localFarmers")}.`}
                     </div>
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div>
                          <div style={{ fontSize: 16, fontWeight: 900, color: "#0bc25c" }}>LKR {Number(p.price_per_unit).toFixed(0)}</div>
                          <div style={{ fontSize: 11, color: "#94a3b8" }}>{t("freeDeliveryOver")}</div>
                        </div>
                        <button 
                          onClick={() => addToCart(p)}
                          style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "10px 16px", borderRadius: 999, fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "transform 0.1s" }}
                          onMouseDown={e=>e.currentTarget.style.transform="scale(0.95)"}
                          onMouseUp={e=>e.currentTarget.style.transform="scale(1)"}
                        >
                          {t("addToCart")}
                        </button>
                     </div>
                  </div>
                ))}
                {!filteredProducts.length && (
                  <div style={{ gridColumn: "1 / -1", padding: 40, textAlign: "center", color: "#94a3b8", fontWeight: 600 }}>{t("noProducts")}</div>
                )}
              </div>
           </div>

           {/* Bottom Stats Grid */}
           <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                   <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>{t("verifiedSellers")}</div>
                   <FiCheck color="#0bc25c" size={16} />
                 </div>
                 <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>248</div>
                 <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("acrossRegion")}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                   <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>{t("ordersToday")}</div>
                   <FiPackage color="#0bc25c" size={16} />
                 </div>
                 <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>36</div>
                 <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("pendingDispatch")}</div>
              </div>
              <div style={{ background: "#fff", borderRadius: 20, padding: 20, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                   <div style={{ fontSize: 13, color: "#64748b", fontWeight: 700 }}>{t("savings")}</div>
                   <FiPercent color="#0bc25c" size={16} />
                 </div>
                 <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", marginBottom: 4 }}>18%</div>
                 <div style={{ fontSize: 12, color: "#94a3b8" }}>{t("seasonalBundles")}</div>
              </div>
           </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
           {/* Filters */}
           <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                 <div>
                   <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{t("filters")}</h3>
                   <div style={{ fontSize: 13, color: "#64748b" }}>{t("refineProducts")}</div>
                 </div>
                 <FiFilter color="#0bc25c" size={18} />
              </div>

              <div style={{ marginBottom: 24 }}>
                 <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{t("category")}</div>
                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <button style={{ background: "#0bc25c", color: "#fff", border: "none", padding: "10px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{t("all")}</button>
                    <button style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{t("seeds")}</button>
                    <button style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{t("tools")}</button>
                    <button style={{ background: "#f8fafc", color: "#64748b", border: "1px solid #e2e8f0", padding: "10px", borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{t("inputs")}</button>
                 </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                 <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{t("delivery")}</div>
                 <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontWeight: 800, color: "#0f172a", fontSize: 14 }}>{t("fastDelivery")}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{t("arrives48h")}</div>
                    </div>
                    <button 
                      onClick={() => setFastDelivery(!fastDelivery)}
                      style={{ width: 44, height: 24, borderRadius: 12, background: fastDelivery ? "#0bc25c" : "#e2e8f0", border: "none", position: "relative", cursor: "pointer", transition: "all 0.2s" }}
                    >
                      <div style={{ width: 20, height: 20, background: "#fff", borderRadius: "50%", position: "absolute", top: 2, left: fastDelivery ? 22 : 2, transition: "all 0.2s", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />
                    </button>
                 </div>
              </div>

              <div>
                 <div style={{ fontSize: 11, fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "1px", marginBottom: 12 }}>{t("budget")}</div>
                 <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 16, padding: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 800, color: "#0f172a", marginBottom: 16 }}>
                      <span>LKR 0</span>
                      <span>LKR 25,000</span>
                    </div>
                    <div style={{ height: 6, background: "#e2e8f0", borderRadius: 3, position: "relative" }}>
                       <div style={{ position: "absolute", left: 0, width: "60%", height: "100%", background: "#0bc25c", borderRadius: 3 }}></div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Cart Summary */}
           <div style={{ background: "#fff", borderRadius: 24, padding: 24, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                 <div>
                   <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: 0 }}>{t("cartSummary")}</h3>
                   <div style={{ fontSize: 13, color: "#64748b" }}>{t("readyCheckout")}</div>
                 </div>
                 <FiShoppingCart color="#0bc25c" size={18} />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
                 <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#64748b" }}>
                   <span>{t("items")}</span>
                   <span style={{ color: "#0f172a", fontWeight: 800 }}>{cart.length}</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#64748b" }}>
                   <span>{t("subtotal")}</span>
                   <span style={{ color: "#0f172a", fontWeight: 800 }}>LKR {cartTotal.toFixed(0)}</span>
                 </div>
                 <div style={{ display: "flex", justifyContent: "space-between", background: "#f8fafc", padding: 16, borderRadius: 16, border: "1px solid #e2e8f0", fontSize: 14, fontWeight: 600, color: "#64748b" }}>
                   <span>{t("delivery")}</span>
                   <span style={{ color: "#0bc25c", fontWeight: 800 }}>{t("free")}</span>
                 </div>
              </div>

              <button 
                onClick={buyCart}
                disabled={cart.length === 0}
                style={{ width: "100%", background: "#0bc25c", color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: cart.length > 0 ? "pointer" : "not-allowed", opacity: cart.length > 0 ? 1 : 0.6, boxShadow: cart.length > 0 ? "0 8px 16px rgba(11, 194, 92, 0.2)" : "none", transition: "transform 0.1s" }}
                onMouseDown={e=>cart.length>0 && (e.currentTarget.style.transform="scale(0.98)")}
                onMouseUp={e=>cart.length>0 && (e.currentTarget.style.transform="scale(1)")}
              >
                {t("proceedCheckout")}
              </button>
           </div>
        </div>
      </div>

      {/* Sell Item Sheet Modal */}
      {sheetOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div style={{ background: "#fff", width: "100%", maxWidth: 600, height: "85vh", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, display: "flex", flexDirection: "column", boxShadow: "0 -10px 40px rgba(0,0,0,0.1)", animation: "slideUp 0.3s ease-out" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>{editingProduct ? t("updateListing") : t("addNewProduct")}</div>
                <div style={{ fontSize: 14, color: "#64748b" }}>{t("enterHarvest")}</div>
              </div>
              <button onClick={() => setSheetOpen(false)} style={{ background: "#f1f5f9", border: "none", width: 40, height: 40, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", cursor: "pointer" }}><FiX size={20} /></button>
            </div>
            
            <div style={{ flex: 1, overflowY: "auto", paddingRight: 8, display: "flex", flexDirection: "column", gap: 16 }}>
               <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t("productName")}</label>
                  <input value={crop_name} onChange={(e) => setCropName(e.target.value)} style={{ width: "100%", padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, outline: "none", fontSize: 14, fontWeight: 600 }} placeholder="E.g., Organic Tea Leaves" />
               </div>
               
               <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t("priceLkr")}</label>
                    <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, outline: "none", fontSize: 14, fontWeight: 600 }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t("qty")}</label>
                    <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} style={{ width: "100%", padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, outline: "none", fontSize: 14, fontWeight: 600 }} />
                  </div>
               </div>

               <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t("desc")}</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", padding: 16, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, outline: "none", fontSize: 14, fontWeight: 600 }} placeholder="Add product details..." />
               </div>

               <div>
                  <label style={{ fontSize: 12, fontWeight: 700, color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: 8 }}>{t("photo")}</label>
                  <input type="file" accept="image/*" onChange={(e) => onPickPhoto(e.target.files?.[0])} style={{ padding: 12, background: "#f8fafc", border: "1px dashed #cbd5e1", borderRadius: 12, width: "100%" }} />
               </div>
            </div>

            <div style={{ paddingTop: 24, borderTop: "1px solid #f1f5f9", marginTop: "auto" }}>
               <button onClick={saveProduct} style={{ width: "100%", background: "#0bc25c", color: "#fff", border: "none", padding: 16, borderRadius: 16, fontWeight: 800, fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                 <FiCheck size={18} /> {editingProduct ? t("updateProduct") : t("publishListing")}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

}
