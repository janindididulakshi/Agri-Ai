import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext.jsx";
import { useLang } from "../context/LanguageContext.jsx";

const LeafIcon = () => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#0bc25c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"></path>
    <path d="M2 22l10-10"></path>
  </svg>
);

export default function Login() {
  const { login } = useAuth();
  const { lang, setLang } = useLang();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");

  const canSubmit = useMemo(() => email.trim() && password.length > 0, [email, password]);

  return (
    <>
      <div style={{ position: "fixed", top: -30, left: -30, right: -30, bottom: -30, backgroundImage: "url('/sunset-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center", filter: "blur(16px)", zIndex: -2 }}></div>
      <div style={{ position: "fixed", inset: 0, background: "rgba(255, 255, 255, 0.15)", zIndex: -1 }}></div>
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "80px", padding: "60px 24px 24px", position: "relative" }}>
      
      {/* Language Switcher at Top */}
      <div style={{ display: "flex", background: "rgba(255, 255, 255, 0.5)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", borderRadius: "999px", border: "1px solid rgba(255, 255, 255, 0.4)", padding: "4px", marginBottom: "40px", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
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
      <img src="/logo.jpg" alt="Govi AI Logo" style={{ height: "72px", objectFit: "contain", marginBottom: "20px", borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }} />

      {/* Titles */}
      <h1 style={{ margin: "0 0 8px", fontSize: "36px", fontWeight: 900, color: "#fff", letterSpacing: "-0.03em", textShadow: "0 2px 8px rgba(0,0,0,0.4)" }}>Govi AI</h1>
      <p style={{ margin: "0 0 36px", fontSize: "16px", color: "#f1f5f9", fontWeight: 600, textShadow: "0 2px 4px rgba(0,0,0,0.4)" }}>A smart path to modern farming</p>

      {/* Form Card */}
      <div style={{ background: "rgba(255, 255, 255, 0.75)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)", borderRadius: "24px", padding: "40px", width: "100%", maxWidth: "480px", boxShadow: "0 12px 40px rgba(0,0,0,0.15)", border: "1px solid rgba(255, 255, 255, 0.4)", display: "flex", flexDirection: "column", gap: "24px" }}>
        
        {err && (
          <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#fff5f5", border: "1px solid #ffd1d1", color: "#e53e3e", padding: "18px 20px", borderRadius: "16px", fontSize: "14px", fontWeight: 600 }}>
            <FiAlertCircle size={20} />
            {err}
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "16px 20px", transition: "border 0.2s" }}>
          <FiMail size={20} color="#64748b" />
          <input 
            type="email" 
            placeholder="Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", color: "#1e293b", background: "transparent" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", border: "1px solid rgba(255, 255, 255, 0.6)", background: "rgba(255, 255, 255, 0.5)", borderRadius: "16px", padding: "16px 20px", transition: "border 0.2s" }}>
          <FiLock size={20} color="#64748b" />
          <input 
            type={show ? "text" : "password"}
            placeholder="Password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1, fontSize: "15px", color: "#1e293b", background: "transparent" }}
          />
          <button type="button" onClick={() => setShow(!show)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: "#64748b", padding: 0 }}>
            {show ? <FiEyeOff size={18} /> : <FiEye size={18} />}
          </button>
        </div>

        <button
          type="button"
          disabled={!canSubmit}
          onClick={async () => {
            setErr("");
            try {
              await login(email.trim(), password);
              nav("/app", { replace: true });
            } catch (e) {
              setErr("Login failed. Please check your email and password.");
            }
          }}
          style={{
            background: "#66e08c",
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
          Login →
        </button>

        <div style={{ textAlign: "center", marginTop: "16px" }}>
          <Link to="/register" style={{ textDecoration: "none", fontSize: "15px", color: "#22c55e", fontWeight: 800 }}>
            <span style={{ color: "#718096", fontWeight: 600 }}>New here?</span> Register
          </Link>
          <div style={{ marginTop: "24px" }}>
            <Link to="/" style={{ textDecoration: "none", fontSize: "14px", color: "#a0aec0", fontWeight: 600 }}>
              Back to Home / Landing
            </Link>
          </div>
        </div>

      </div>
    </div>
    </>
  );
}
