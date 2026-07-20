import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff, FiLock, FiBell, FiSmartphone, FiUser, FiPhone, FiMapPin, FiCamera, FiEdit2, FiMail, FiCheck } from "react-icons/fi";
import { api } from "../services/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

// Modern Toggle Switch Component
function ModernToggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        border: "none",
        backgroundColor: checked ? "#0bc25c" : "#e2e8f0",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        padding: "2px",
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: "50%",
          backgroundColor: "#fff",
          position: "absolute",
          left: checked ? 22 : 2,
          transition: "all 0.3s ease",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    </button>
  );
}

function MockupInput({ label, icon: Icon, value, onChange, placeholder, type = "text", actionIcon: ActionIcon, onActionClick }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px", gap: 12, transition: "border-color 0.2s" }}>
        {Icon && <Icon size={16} color="#94a3b8" />}
        <input 
          type={type} 
          value={value} 
          onChange={onChange} 
          placeholder={placeholder} 
          style={{ flex: 1, border: "none", outline: "none", background: "transparent", fontSize: 14, fontWeight: 600, color: "#1e293b" }} 
        />
        {ActionIcon && (
          <button type="button" onClick={onActionClick} style={{ background: "none", border: "none", padding: 0, color: "#94a3b8", cursor: "pointer", display: "flex" }}>
            <ActionIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

function ThemeCard({ theme, label, subtitle, gradient, active, onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      style={{
        background: "#fff",
        border: active ? "2px solid #0bc25c" : "1px solid #e2e8f0",
        borderRadius: 16,
        padding: 0,
        cursor: "pointer",
        transition: "all 0.2s ease",
        overflow: "hidden",
        boxShadow: active ? "0 4px 12px rgba(11, 194, 92, 0.1)" : "none",
        textAlign: "left",
      }}
    >
      <div style={{ background: gradient, height: 60, width: "100%" }} />
      <div style={{ padding: "12px 16px" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, color: "#64748b" }}>{subtitle}</div>
      </div>
      {active && (
        <div style={{ position: "absolute", top: 8, right: 8, width: 24, height: 24, background: "#0bc25c", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 14 }}>
          <FiCheck size={14} />
        </div>
      )}
    </button>
  );
}

const localTranslations = {
  EN: {
    profileSettings: "Profile & Settings",
    manageAccount: "Manage your account, security and app preferences",
    farmer: "Farmer",
    advisor: "Advisor",
    officer: "Officer",
    noEmail: "No email",
    sriLanka: "Sri Lanka",
    editProfile: "Edit Profile",
    personalInfo: "Personal Info",
    security: "Security",
    notifications: "Notifications",
    preferences: "Preferences",
    personalInformation: "Personal Information",
    updateContact: "Update your contact details and location",
    fullName: "Full Name",
    phone: "Phone Number",
    location: "Location / District",
    photoUrl: "Profile Photo URL",
    savingChanges: "Saving Changes...",
    saveChanges: "Save Changes",
    changesSaved: "Changes saved ✅",
    passwordSecurity: "Password & Security",
    updatePasswordDesc: "Update your password to keep your account secure",
    currentPassword: "Current Password",
    newPassword: "New Password",
    updatePassword: "Update Password",
    signOut: "Sign Out",
    passwordUpdated: "Password updated ✅",
    notificationSettings: "Notification Settings",
    controlComm: "Control how we communicate with you",
    pushNotifications: "Push Notifications",
    pushDesc: "Receive alerts for urgent weather and crop advisories",
    smsAlerts: "SMS Alerts",
    smsDesc: "Get critical market price updates via text message",
    appPreferences: "App Preferences",
    customizeThemes: "Customize your language and visual themes",
    displayLanguage: "Display Language",
    colorTheme: "Color Theme",
    default: "Default", goviLight: "Govi light",
    natural: "Natural", warmDaylight: "Warm daylight",
    dark: "Dark", lowLight: "Low-light",
    technical: "Technical", highContrast: "High contrast",
    user: "User",
    errorSaving: "Error saving profile.",
    errorPw: "Error updating password."
  },
  SI: {
    profileSettings: "පැතිකඩ සහ සැකසුම්",
    manageAccount: "ඔබගේ ගිණුම, ආරක්ෂාව සහ යෙදුම් සැකසුම් කළමනාකරණය කරන්න",
    farmer: "ගොවියා",
    advisor: "උපදේශක",
    officer: "නිලධාරී",
    noEmail: "විද්‍යුත් තැපෑලක් නැත",
    sriLanka: "ශ්‍රී ලංකාව",
    editProfile: "පැතිකඩ සංස්කරණය",
    personalInfo: "පුද්ගලික තොරතුරු",
    security: "ආරක්ෂාව",
    notifications: "දැනුම්දීම්",
    preferences: "සැකසුම්",
    personalInformation: "පුද්ගලික තොරතුරු",
    updateContact: "ඔබගේ සම්බන්ධතා තොරතුරු සහ ස්ථානය යාවත්කාලීන කරන්න",
    fullName: "සම්පූර්ණ නම",
    phone: "දුරකථන අංකය",
    location: "ස්ථානය / දිස්ත්‍රික්කය",
    photoUrl: "පැතිකඩ ඡායාරූප URL",
    savingChanges: "සුරකිමින්...",
    saveChanges: "වෙනස්කම් සුරකින්න",
    changesSaved: "වෙනස්කම් සුරැකිණි ✅",
    passwordSecurity: "මුරපදය සහ ආරක්ෂාව",
    updatePasswordDesc: "ඔබගේ ගිණුම සුරක්ෂිතව තබා ගැනීමට මුරපදය යාවත්කාලීන කරන්න",
    currentPassword: "වත්මන් මුරපදය",
    newPassword: "නව මුරපදය",
    updatePassword: "මුරපදය යාවත්කාලීන කරන්න",
    signOut: "ඉවත් වන්න",
    passwordUpdated: "මුරපදය යාවත්කාලීන කළා ✅",
    notificationSettings: "දැනුම්දීම් සැකසුම්",
    controlComm: "අප ඔබ හා සම්බන්ධ වන ආකාරය පාලනය කරන්න",
    pushNotifications: "Push දැනුම්දීම්",
    pushDesc: "හදිසි කාලගුණ සහ බෝග උපදෙස් සඳහා ඇඟවීම් ලබා ගන්න",
    smsAlerts: "SMS ඇඟවීම්",
    smsDesc: "කෙටි පණිවිඩ හරහා වෙළඳපල මිල යාවත්කාලීන කිරීම් ලබා ගන්න",
    appPreferences: "යෙදුම් සැකසුම්",
    customizeThemes: "ඔබගේ භාෂාව සහ දෘශ්‍ය තේමා අභිරුචිකරණය කරන්න",
    displayLanguage: "දර්ශන භාෂාව",
    colorTheme: "වර්ණ තේමාව",
    default: "පෙරනිමි", goviLight: "ගොවි ආලෝකය",
    natural: "ස්වභාවික", warmDaylight: "උණුසුම් දිවා ආලෝකය",
    dark: "අඳුරු", lowLight: "අඩු ආලෝකය",
    technical: "තාක්ෂණික", highContrast: "ඉහළ ප්‍රතිවිරෝධතාව",
    user: "පරිශීලක",
    errorSaving: "පැතිකඩ සුරැකීමේ දෝෂයක්.",
    errorPw: "මුරපදය යාවත්කාලීන කිරීමේ දෝෂයක්."
  },
  TA: {
    profileSettings: "சுயவிவரம் & அமைப்புகள்",
    manageAccount: "உங்கள் கணக்கு, பாதுகாப்பு மற்றும் பயன்பாட்டு விருப்பங்களை நிர்வகிக்கவும்",
    farmer: "விவசாயி",
    advisor: "ஆலோசகர்",
    officer: "அதிகாரி",
    noEmail: "மின்னஞ்சல் இல்லை",
    sriLanka: "இலங்கை",
    editProfile: "சுயவிவரத்தைத் திருத்து",
    personalInfo: "தனிப்பட்ட தகவல்",
    security: "பாதுகாப்பு",
    notifications: "அறிவிப்புகள்",
    preferences: "விருப்பங்கள்",
    personalInformation: "தனிப்பட்ட தகவல்",
    updateContact: "உங்கள் தொடர்பு விவரங்கள் மற்றும் இருப்பிடத்தை புதுப்பிக்கவும்",
    fullName: "முழு பெயர்",
    phone: "தொலைபேசி எண்",
    location: "இடம் / மாவட்டம்",
    photoUrl: "சுயவிவர புகைப்பட URL",
    savingChanges: "சேமிக்கிறது...",
    saveChanges: "மாற்றங்களைச் சேமி",
    changesSaved: "மாற்றங்கள் சேமிக்கப்பட்டன ✅",
    passwordSecurity: "கடவுச்சொல் & பாதுகாப்பு",
    updatePasswordDesc: "உங்கள் கணக்கை பாதுகாப்பாக வைத்திருக்க கடவுச்சொல்லை புதுப்பிக்கவும்",
    currentPassword: "தற்போதைய கடவுச்சொல்",
    newPassword: "புதிய கடவுச்சொல்",
    updatePassword: "கடவுச்சொல்லை புதுப்பி",
    signOut: "வெளியேறு",
    passwordUpdated: "கடவுச்சொல் புதுப்பிக்கப்பட்டது ✅",
    notificationSettings: "அறிவிப்பு அமைப்புகள்",
    controlComm: "நாங்கள் உங்களுடன் எவ்வாறு தொடர்பு கொள்கிறோம் என்பதைக் கட்டுப்படுத்தவும்",
    pushNotifications: "Push அறிவிப்புகள்",
    pushDesc: "அவசர வானிலை மற்றும் பயிர் ஆலோசனைகளுக்கான விழிப்பூட்டல்களைப் பெறவும்",
    smsAlerts: "SMS விழிப்பூட்டல்கள்",
    smsDesc: "குறுஞ்செய்தி மூலம் முக்கியமான சந்தை விலை புதுப்பிப்புகளைப் பெறவும்",
    appPreferences: "பயன்பாட்டு விருப்பங்கள்",
    customizeThemes: "உங்கள் மொழி மற்றும் காட்சி தீம்களைத் தனிப்பயனாக்குங்கள்",
    displayLanguage: "காட்சி மொழி",
    colorTheme: "வண்ண தீம்",
    default: "இயல்புநிலை", goviLight: "கோவி வெளிச்சம்",
    natural: "இயற்கை", warmDaylight: "சூடான பகல் வெளிச்சம்",
    dark: "இருண்ட", lowLight: "குறைந்த வெளிச்சம்",
    technical: "தொழில்நுட்பம்", highContrast: "உயர் மாறுபாடு",
    user: "பயனர்",
    errorSaving: "சுயவிவரத்தை சேமிப்பதில் பிழை.",
    errorPw: "கடவுச்சொல்லை புதுப்பிப்பதில் பிழை."
  }
};

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const { lang, setLang, t: globalT } = useLang();
  const t = (key) => localTranslations[lang?.toUpperCase()]?.[key] || globalT(key) || key;
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState("personalInfo");

  const [full_name, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [photo_url, setPhotoUrl] = useState("");

  const [curPw, setCurPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [showCurPw, setShowCurPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);

  const [pushOn, setPushOn] = useState(() => localStorage.getItem("sf_push") === "1");
  const [smsOn, setSmsOn] = useState(() => localStorage.getItem("sf_sms") === "1");

  const [stats, setStats] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFullName(user.full_name || "");
    setPhone(user.phone || "");
    setLocation(user.location || "");
    setPhotoUrl(user.photo_url || "");
    if (user.language) setLang(user.language);
    if (user.theme) setTheme(user.theme);
  }, [user]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const { data } = await api.get(`/reports/${user.id}/summary`);
        setStats(data);
      } catch {
        setStats(null);
      }
    };
    load().catch(() => {});
  }, [user?.id]);

  const roleBadge = useMemo(() => {
    if (!user) return t("farmer");
    if (user.role === "kushiadvisor") return t("advisor");
    if (user.role === "officer") return t("officer");
    return t("farmer");
  }, [user, lang]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      await api.patch("/auth/profile", {
        full_name: full_name.trim(),
        phone: phone.trim() || null,
        location: location.trim() || null,
        photo_url: photo_url || null,
        language: lang,
        theme,
      });
      await refreshProfile();
      alert(t("changesSaved"));
    } catch (e) {
      alert(e?.message || t("errorSaving"));
    } finally {
      setSaving(false);
    }
  };

  const changePw = async () => {
    try {
      await api.post("/auth/password", { current_password: curPw, new_password: newPw });
      setCurPw("");
      setNewPw("");
      setShowCurPw(false);
      setShowNewPw(false);
      alert(t("passwordUpdated"));
    } catch (e) {
      alert(e?.message || t("errorPw"));
    }
  };

  const onPhoto = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPhotoUrl(String(reader.result || ""));
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "40px 32px", paddingBottom: 100 }}>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>{t("profileSettings")}</h1>
        <div style={{ fontSize: 14, color: "#64748b" }}>{t("manageAccount")}</div>
      </div>

      {/* Hero Card */}
      <div style={{ background: "#fff", borderRadius: 24, overflow: "hidden", marginBottom: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
        {/* Cover Photo */}
        <div style={{ height: 160, background: "linear-gradient(135deg, #0bc25c 0%, #6edb9f 100%)", position: "relative" }}>
           <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "url('https://images.unsplash.com/photo-1592982537447-6f23f8b05615?auto=format&fit=crop&q=80&w=2000') center/cover", opacity: 0.8, mixBlendMode: "overlay" }} />
        </div>
        
        <div style={{ padding: "0 32px 32px 32px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -50 }}>
           <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
              {/* Avatar */}
              <label style={{ width: 110, height: 110, borderRadius: "50%", border: "4px solid #fff", background: "#f1f5f9", overflow: "hidden", flexShrink: 0, position: "relative", cursor: "pointer", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
                 <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => onPhoto(e.target.files?.[0])} />
                 {photo_url || user?.photo_url ? (
                   <img src={photo_url || user?.photo_url} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="avatar" />
                 ) : (
                   <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "#94a3b8" }}>
                     <FiCamera size={32} />
                   </div>
                 )}
              </label>
              
              <div style={{ paddingBottom: 6 }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>{user?.full_name || t("user")}</h2>
                    <div style={{ background: "#0bc25c", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.5px" }}>{roleBadge}</div>
                 </div>
                 <div style={{ display: "flex", gap: 20, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><FiMail size={14}/> {user?.email || t("noEmail")}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><FiMapPin size={14}/> {user?.location || t("sriLanka")}</div>
                 </div>
              </div>
           </div>
           
           <button style={{ background: "#f8fafc", color: "#0bc25c", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 999, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "#f8fafc"}>
             <FiEdit2 size={16} /> {t("editProfile")}
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {["personalInfo", "security", "notifications", "preferences"].map((tabKey) => (
          <button 
            key={tabKey} 
            onClick={() => setActiveTab(tabKey)}
            style={{ 
              padding: "10px 20px", 
              borderRadius: 999, 
              fontWeight: 700, 
              fontSize: 14, 
              cursor: "pointer", 
              border: activeTab === tabKey ? "none" : "1px solid #e2e8f0",
              background: activeTab === tabKey ? "#0f172a" : "#fff",
              color: activeTab === tabKey ? "#fff" : "#64748b",
              transition: "all 0.2s"
            }}
          >
            {t(tabKey)}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === "personalInfo" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>{t("personalInformation")}</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>{t("updateContact")}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
               <MockupInput label={t("fullName")} icon={FiUser} value={full_name} onChange={(e) => setFullName(e.target.value)} placeholder="Kasun Perera" />
               <MockupInput label={t("phone")} icon={FiPhone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 123 4567" type="tel" />
               <MockupInput label={t("location")} icon={FiMapPin} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kandy District" />
               <MockupInput label={t("photoUrl")} icon={FiCamera} value={photo_url} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>

            <button 
              onClick={saveProfile}
              disabled={saving}
              style={{ width: "100%", background: "#0bc25c", color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <FiCheck size={18} /> {saving ? t("savingChanges") : t("saveChanges")}
            </button>
         </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>{t("passwordSecurity")}</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>{t("updatePasswordDesc")}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
               <MockupInput label={t("currentPassword")} icon={FiLock} value={curPw} onChange={(e) => setCurPw(e.target.value)} type={showCurPw ? "text" : "password"} actionIcon={showCurPw ? FiEyeOff : FiEye} onActionClick={() => setShowCurPw(!showCurPw)} />
               <MockupInput label={t("newPassword")} icon={FiLock} value={newPw} onChange={(e) => setNewPw(e.target.value)} type={showNewPw ? "text" : "password"} actionIcon={showNewPw ? FiEyeOff : FiEye} onActionClick={() => setShowNewPw(!showNewPw)} />
            </div>

            <div style={{ display: "flex", gap: 16 }}>
               <button onClick={changePw} style={{ flex: 1, background: "#0bc25c", color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                 {t("updatePassword")}
               </button>
               <button onClick={() => { logout(); nav("/login", { replace: true }); }} style={{ flex: 1, background: "#fff0f0", color: "#ef4444", border: "1px solid #fee2e2", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                 {t("signOut")}
               </button>
            </div>
         </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>{t("notificationSettings")}</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>{t("controlComm")}</p>

            <div style={{ display: "grid", gap: 16 }}>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", color: "#0bc25c", display: "flex", alignItems: "center", justifyContent: "center" }}><FiBell size={24} /></div>
                   <div>
                     <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4, fontSize: 15 }}>{t("pushNotifications")}</div>
                     <div style={{ fontSize: 13, color: "#64748b" }}>{t("pushDesc")}</div>
                   </div>
                 </div>
                 <ModernToggle checked={pushOn} onChange={(v) => { setPushOn(v); localStorage.setItem("sf_push", v ? "1" : "0"); }} />
               </div>

               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", color: "#0bc25c", display: "flex", alignItems: "center", justifyContent: "center" }}><FiSmartphone size={24} /></div>
                   <div>
                     <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4, fontSize: 15 }}>{t("smsAlerts")}</div>
                     <div style={{ fontSize: 13, color: "#64748b" }}>{t("smsDesc")}</div>
                   </div>
                 </div>
                 <ModernToggle checked={smsOn} onChange={(v) => { setSmsOn(v); localStorage.setItem("sf_sms", v ? "1" : "0"); }} />
               </div>
            </div>
         </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "preferences" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>{t("appPreferences")}</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>{t("customizeThemes")}</p>

            <div style={{ marginBottom: 32 }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>{t("displayLanguage")}</div>
               <div style={{ display: "flex", gap: 12 }}>
                 {[ { code: "si", label: "සිංහල" }, { code: "en", label: "English" }, { code: "ta", label: "தமிழ்" } ].map((lng) => (
                   <button key={lng.code} onClick={() => setLang(lng.code)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: lang === lng.code ? "2px solid #0bc25c" : "1px solid #e2e8f0", background: lang === lng.code ? "#f0fdf4" : "#fff", color: lang === lng.code ? "#0bc25c" : "#64748b", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                     {lng.label}
                   </button>
                 ))}
               </div>
            </div>

         </div>
      )}

    </div>
  );
}
