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

export default function Profile() {
  const { user, logout, refreshProfile } = useAuth();
  const { lang, setLang, t } = useLang();
  const { theme, setTheme } = useTheme();
  const nav = useNavigate();

  const [activeTab, setActiveTab] = useState("Personal Info");

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
    if (!user) return "Farmer";
    if (user.role === "kushiadvisor") return "Advisor";
    if (user.role === "officer") return "Officer";
    return "Farmer";
  }, [user]);

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
      alert("Changes saved ✅");
    } catch (e) {
      alert(e?.message || "Error saving profile.");
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
      alert("Password updated ✅");
    } catch (e) {
      alert(e?.message || "Error updating password.");
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
        <h1 style={{ fontSize: 28, fontWeight: 900, color: "#0f172a", margin: "0 0 6px 0" }}>Profile & Settings</h1>
        <div style={{ fontSize: 14, color: "#64748b" }}>Manage your account, security and app preferences</div>
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
                    <h2 style={{ fontSize: 24, fontWeight: 900, color: "#0f172a", margin: 0 }}>{user?.full_name || "User"}</h2>
                    <div style={{ background: "#0bc25c", color: "#fff", fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.5px" }}>{roleBadge}</div>
                 </div>
                 <div style={{ display: "flex", gap: 20, color: "#64748b", fontSize: 13, fontWeight: 600 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><FiMail size={14}/> {user?.email || "No email"}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}><FiMapPin size={14}/> {user?.location || "Sri Lanka"}</div>
                 </div>
              </div>
           </div>
           
           <button style={{ background: "#f8fafc", color: "#0bc25c", border: "1px solid #e2e8f0", padding: "10px 20px", borderRadius: 999, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "#f8fafc"}>
             <FiEdit2 size={16} /> Edit Profile
           </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, marginBottom: 32 }}>
        {["Personal Info", "Security", "Notifications", "Preferences"].map(tab => (
          <button 
            key={tab} 
            onClick={() => setActiveTab(tab)}
            style={{ 
              padding: "10px 20px", 
              borderRadius: 999, 
              fontWeight: 700, 
              fontSize: 14, 
              cursor: "pointer", 
              border: activeTab === tab ? "none" : "1px solid #e2e8f0",
              background: activeTab === tab ? "#0f172a" : "#fff",
              color: activeTab === tab ? "#fff" : "#64748b",
              transition: "all 0.2s"
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Personal Info Tab */}
      {activeTab === "Personal Info" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>Personal Information</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>Update your contact details and location</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
               <MockupInput label="Full Name" icon={FiUser} value={full_name} onChange={(e) => setFullName(e.target.value)} placeholder="Kasun Perera" />
               <MockupInput label="Phone Number" icon={FiPhone} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+94 77 123 4567" type="tel" />
               <MockupInput label="Location / District" icon={FiMapPin} value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Kandy District" />
               <MockupInput label="Profile Photo URL" icon={FiCamera} value={photo_url} onChange={(e) => setPhotoUrl(e.target.value)} placeholder="https://..." />
            </div>

            <button 
              onClick={saveProfile}
              disabled={saving}
              style={{ width: "100%", background: "#0bc25c", color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: saving ? "wait" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
            >
              <FiCheck size={18} /> {saving ? "Saving Changes..." : "Save Changes"}
            </button>
         </div>
      )}

      {/* Security Tab */}
      {activeTab === "Security" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>Password & Security</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>Update your password to keep your account secure</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 32 }}>
               <MockupInput label="Current Password" icon={FiLock} value={curPw} onChange={(e) => setCurPw(e.target.value)} type={showCurPw ? "text" : "password"} actionIcon={showCurPw ? FiEyeOff : FiEye} onActionClick={() => setShowCurPw(!showCurPw)} />
               <MockupInput label="New Password" icon={FiLock} value={newPw} onChange={(e) => setNewPw(e.target.value)} type={showNewPw ? "text" : "password"} actionIcon={showNewPw ? FiEyeOff : FiEye} onActionClick={() => setShowNewPw(!showNewPw)} />
            </div>

            <div style={{ display: "flex", gap: 16 }}>
               <button onClick={changePw} style={{ flex: 1, background: "#0bc25c", color: "#fff", border: "none", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                 Update Password
               </button>
               <button onClick={() => { logout(); nav("/login", { replace: true }); }} style={{ flex: 1, background: "#fff0f0", color: "#ef4444", border: "1px solid #fee2e2", padding: "16px", borderRadius: 16, fontWeight: 700, fontSize: 15, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                 Sign Out
               </button>
            </div>
         </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "Notifications" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>Notification Settings</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>Control how we communicate with you</p>

            <div style={{ display: "grid", gap: 16 }}>
               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", color: "#0bc25c", display: "flex", alignItems: "center", justifyContent: "center" }}><FiBell size={24} /></div>
                   <div>
                     <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4, fontSize: 15 }}>Push Notifications</div>
                     <div style={{ fontSize: 13, color: "#64748b" }}>Receive alerts for urgent weather and crop advisories</div>
                   </div>
                 </div>
                 <ModernToggle checked={pushOn} onChange={(v) => { setPushOn(v); localStorage.setItem("sf_push", v ? "1" : "0"); }} />
               </div>

               <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "20px", background: "#f8fafc", borderRadius: 16, border: "1px solid #e2e8f0" }}>
                 <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                   <div style={{ width: 48, height: 48, borderRadius: 12, background: "#dcfce7", color: "#0bc25c", display: "flex", alignItems: "center", justifyContent: "center" }}><FiSmartphone size={24} /></div>
                   <div>
                     <div style={{ fontWeight: 700, color: "#1e293b", marginBottom: 4, fontSize: 15 }}>SMS Alerts</div>
                     <div style={{ fontSize: 13, color: "#64748b" }}>Get critical market price updates via text message</div>
                   </div>
                 </div>
                 <ModernToggle checked={smsOn} onChange={(v) => { setSmsOn(v); localStorage.setItem("sf_sms", v ? "1" : "0"); }} />
               </div>
            </div>
         </div>
      )}

      {/* Preferences Tab */}
      {activeTab === "Preferences" && (
         <div style={{ background: "#fff", borderRadius: 24, padding: 32, border: "1px solid #f1f5f9", boxShadow: "0 4px 20px rgba(0,0,0,0.02)" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#0f172a", margin: "0 0 6px 0" }}>App Preferences</h3>
            <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>Customize your language and visual themes</p>

            <div style={{ marginBottom: 32 }}>
               <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Display Language</div>
               <div style={{ display: "flex", gap: 12 }}>
                 {[ { code: "si", label: "සිංහල" }, { code: "en", label: "English" }, { code: "ta", label: "தமிழ்" } ].map((lng) => (
                   <button key={lng.code} onClick={() => setLang(lng.code)} style={{ flex: 1, padding: "14px", borderRadius: 12, border: lang === lng.code ? "2px solid #0bc25c" : "1px solid #e2e8f0", background: lang === lng.code ? "#f0fdf4" : "#fff", color: lang === lng.code ? "#0bc25c" : "#64748b", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }}>
                     {lng.label}
                   </button>
                 ))}
               </div>
            </div>

            <div>
               <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Color Theme</div>
               <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                 {[
                   { key: "green", label: "Default", sub: "Govi light", grad: "linear-gradient(135deg,#d8f3dc 0%,#95d5b2 100%)" },
                   { key: "gold", label: "Natural", sub: "Warm daylight", grad: "linear-gradient(135deg,#fff3e0 0%,#ffe0b2 100%)" },
                   { key: "night", label: "Dark", sub: "Low-light", grad: "linear-gradient(135deg,#1b4332 0%,#0d2818 100%)" },
                   { key: "contrast", label: "Technical", sub: "High contrast", grad: "linear-gradient(135deg,#ffff00 0%,#000 60%)" },
                 ].map((t) => (
                   <ThemeCard key={t.key} theme={t.key} label={t.label} subtitle={t.sub} gradient={t.grad} active={theme === t.key} onClick={() => setTheme(t.key)} />
                 ))}
               </div>
            </div>
         </div>
      )}

    </div>
  );
}
