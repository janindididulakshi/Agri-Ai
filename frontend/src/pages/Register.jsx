import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiUser, FiMapPin, FiMail, FiPhone, FiLock, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";

const LeafIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0bc25c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
    <path d="M2 22l10-10"></path>
  </svg>
);

const RadioChecked = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0bc25c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <circle cx="12" cy="12" r="4" fill="#0bc25c"></circle>
  </svg>
);

const RadioUnchecked = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a0aec0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

export default function Register() {
  const { register } = useAuth();
  const { lang, setLang } = useLang();
  const nav = useNavigate();

  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [role, setRole] = useState("farmer");
  const [location, setLocation] = useState("");
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => {
    return (
      full_name.trim().length > 1 &&
      email.includes("@") &&
      password.length >= 6 &&
      password === password2
    );
  }, [full_name, email, password, password2]);

  const detectGps = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setLocation(`${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}`);
      },
      () => {},
      { enableHighAccuracy: true, timeout: 12000 }
    );
  };

  return (
    <>
      <div style={{ position: "fixed", top: -30, left: -30, right: -30, bottom: -30, backgroundImage: "url('/sunset-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(16px)", zIndex: -2 }}></div>
      <div style={{ position: "fixed", inset: 0, background: "rgba(255, 255, 255, 0.15)", zIndex: -1 }}></div>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px 40px", position: "relative", width: "100%" }}>
      
      {/* Language Switcher */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: "999px", border: "1px solid rgba(255, 255, 255, 0.4)", padding: "4px", marginBottom: "24px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
        {[
          { code: "si", label: "Sinhala" },
          { code: "en", label: "English" },
          { code: "ta", label: "Tamil" },
        ].map((l) => (
          <button
            key={l.code}
            type="button"
            style={{
              padding: "10px 24px",
              borderRadius: "999px",
              border: "none",
              fontWeight: 700,
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s",
              backgroundColor: lang === l.code ? "#0bc25c" : "transparent",
              color: lang === l.code ? "#fff" : "#444",
            }}
            onClick={() => setLang(l.code)}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Logo */}
      <img src="/logo.jpg" alt="Govi AI Logo" style={{ height: "64px", width: "auto", objectFit: "contain", marginBottom: "16px", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />

      {/* Titles */}
      <h1 style={{ margin: "0 0 8px", fontSize: "clamp(28px, 5vw, 36px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Govi AI</h1>
      <p style={{ margin: "0 0 24px", fontSize: "clamp(14px, 2.5vw, 16px)", color: "#f1f5f9", fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>A smart path to modern farming</p>

      {/* Form Card */}
      <div style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "24px", padding: "clamp(20px, 4vw, 36px)", width: "100%", maxWidth: "520px", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", border: "1px solid rgba(255, 255, 255, 0.4)", display: "flex", flexDirection: "column", gap: "20px" }}>
        
        {err && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff5f5", border: "1px solid #ffd1d1", color: "#e53e3e", padding: "16px 20px", borderRadius: "16px", fontSize: "14px", fontWeight: 600 }}>
            <FiAlertCircle size={20} />
            {err}
          </div>
        )}

        {/* Role Selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {/* Farmer */}
          <button
            type="button"
            onClick={() => setRole("farmer")}
            style={{
              display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", textAlign: "left",
              border: role === "farmer" ? "1px solid #0bc25c" : "1px solid rgba(255, 255, 255, 0.6)",
              background: role === "farmer" ? "rgba(0, 200, 83, 0.15)" : "rgba(255, 255, 255, 0.5)",
            }}
          >
            <div style={{ marginTop: "2px" }}>
              {role === "farmer" ? <RadioChecked /> : <RadioUnchecked />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "#111", marginBottom: "4px" }}>Farmer (ගොවියා)</div>
              <div style={{ fontSize: "13px", color: "#475569" }}>Register as a farmer to manage your land</div>
            </div>
          </button>

          {/* Kushi Advisor */}
          <button
            type="button"
            onClick={() => setRole("kushiadvisor")}
            style={{
              display: "flex", alignItems: "flex-start", gap: "16px", padding: "20px", borderRadius: "16px", cursor: "pointer", transition: "all 0.2s", textAlign: "left",
              border: role === "kushiadvisor" ? "1px solid #0bc25c" : "1px solid rgba(255, 255, 255, 0.6)",
              background: role === "kushiadvisor" ? "rgba(0, 200, 83, 0.15)" : "rgba(255, 255, 255, 0.5)",
            }}
          >
            <div style={{ marginTop: "2px" }}>
              {role === "kushiadvisor" ? <RadioChecked /> : <RadioUnchecked />}
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: "16px", color: "#111", marginBottom: "4px" }}>Kushi Advisor (කෘෂි උපදේශක)</div>
              <div style={{ fontSize: "13px", color: "#718096" }}>Register as an agricultural advisor</div>
            </div>
          </button>
        </div>

        {/* Inputs */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "14px 20px" }}>
            <FiUser size={20} color="#475569" />
            <input type="text" placeholder="Full Name" value={full_name} onChange={(e) => setFullName(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", background: "transparent", color: "#1e293b" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "14px 20px" }}>
            <FiMail size={20} color="#475569" />
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", background: "transparent", color: "#1e293b" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "14px 20px" }}>
            <FiPhone size={20} color="#475569" />
            <input type="text" placeholder="Phone Number (Optional)" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", background: "transparent", color: "#1e293b" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "14px 20px" }}>
            <FiLock size={20} color="#475569" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", background: "transparent", color: "#1e293b" }} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "14px 20px" }}>
            <FiLock size={20} color="#475569" />
            <input type="password" placeholder="Confirm Password" value={password2} onChange={(e) => setPassword2(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", background: "transparent", color: "#1e293b" }} />
          </div>
        </div>

        {/* Location Field */}
        <div>
          <label style={{ display: "block", fontSize: "14px", fontWeight: 700, color: "#111", marginBottom: "12px" }}>Location</label>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "14px 20px", flex: 1 }}>
              <FiMapPin size={20} color="#475569" />
              <input type="text" placeholder="Enter your location" value={location} onChange={(e) => setLocation(e.target.value)} style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", background: "transparent", color: "#1e293b" }} />
            </div>
            <button type="button" onClick={detectGps} style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid rgba(255, 255, 255, 0.6)", borderRadius: "16px", padding: "0 24px", fontSize: "14px", fontWeight: 700, color: "#1e293b", cursor: "pointer", transition: "all 0.2s" }}>
              Auto-detect
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={async () => {
            setErr("");
            try {
              await register({
                full_name: full_name.trim(),
                email: email.trim(),
                password,
                phone: phone.trim() || null,
                role,
                location: location.trim() || null,
              });
              nav("/app", { replace: true });
            } catch (e) {
              setErr(e?.message || "Registration failed. Please try again.");
            }
          }}
          style={{
            background: "#0bc25c",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "18px",
            fontSize: "17px",
            fontWeight: 800,
            cursor: canSubmit ? "pointer" : "not-allowed",
            opacity: canSubmit ? 1 : 0.7,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginTop: "12px",
            transition: "all 0.2s"
          }}
        >
          Register →
        </button>

        {/* Footer Links */}
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <Link to="/login" style={{ textDecoration: "none", fontSize: "14px", color: "#0bc25c", fontWeight: 800 }}>
            <span style={{ color: "#718096", fontWeight: 500 }}>Already have an account? </span>
            Login
          </Link>
          <div style={{ marginTop: "16px" }}>
            <Link to="/" style={{ textDecoration: "none", fontSize: "13px", color: "#718096", fontWeight: 500 }}>
              Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
