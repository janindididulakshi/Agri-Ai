import { useEffect, useMemo, useRef, useState } from "react";
import { FiMic, FiMoreHorizontal, FiSend, FiPaperclip } from "react-icons/fi";
import { api } from "../services/api.js";

export default function Chat() {
  const [history, setHistory] = useState([]);
  const [msg, setMsg] = useState("");
  const [typing, setTyping] = useState(false);
  const [wxTop, setWxTop] = useState("");
  const [coords, setCoords] = useState(null);
  const [isListening, setIsListening] = useState(false);
  
  const bottomRef = useRef(null);
  const imageInputRef = useRef(null);
  const recognitionRef = useRef(null);
  
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'si-LK'; // default to Sinhala
      
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');
        setMsg(transcript);
      };

      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
      
      recognitionRef.current = recognition;
    }
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (p) => {
      try {
        setCoords({ lat: p.coords.latitude, lon: p.coords.longitude });
        const { data } = await api.get("/weather/gps", { params: { lat: p.coords.latitude, lon: p.coords.longitude } });
        setWxTop(`${data.location || ""} - ${Math.round(data.temperature_c ?? 0)}°C`);
      } catch {
        setWxTop("කාලගුණය ලබා ගත නොහැක");
      }
    }, () => setWxTop("GPS අවසරය ලබා ගත නොහැක"));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, typing]);

  const chips = useMemo(() => ["පොහොර", "රෝග", "කාලගුණය", "වෙළඳ මිල"], []);

  const handleAttachClick = () => {
    imageInputRef.current?.click();
  };

  const handleImageSelected = (file) => {
    if (!file) return;
    send(msg, file);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("ඔබේ බ්‍රව්සරය මයික්‍රෆෝනය සඳහා සහය නොදක්වයි. (Speech recognition is not supported in this browser.)");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setMsg(""); // Clear previous message when starting new speech
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const send = async (text, imageFile = null) => {
    const t = text.trim();
    if (!t && !imageFile) return;
    
    // Immediately clear input and show user message
    setMsg("");
    if (imageInputRef.current) imageInputRef.current.value = null;
    
    const userMsgObj = {
      role: "user",
      content: t || "[Image attached]",
      image: imageFile ? URL.createObjectURL(imageFile) : undefined,
    };
    
    // Keep a reference to the old history to send to backend
    const historyToBackend = history;
    
    // Update UI immediately
    setHistory(prev => [...prev, userMsgObj]);
    setTyping(true);

    try {
      let lat = coords?.lat;
      let lon = coords?.lon;

      const payload = new FormData();
      payload.append("chat_history", JSON.stringify(historyToBackend));
      if (lat) payload.append("lat", lat);
      if (lon) payload.append("lon", lon);
      if (t) payload.append("message", t);
      if (imageFile) payload.append("image", imageFile);

      const { data } = await api.post("/chat/message", payload);

      const updated = data.updated_history || [];
      if (imageFile) {
        const mapped = updated.map((item) =>
          item.role === "user" && item.image?.startsWith("uploaded:")
            ? { ...item, image: userMsgObj.image } // reuse the object url
            : item
        );
        setHistory(mapped);
      } else {
        setHistory(updated);
      }
    } catch (e) {
      setHistory((h) => [
        ...h,
        { role: "assistant", content: e?.message || "දෝෂයක්." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <div style={{ padding: "24px", height: "100%", boxSizing: "border-box" }}>
      <div style={{ 
        maxWidth: "900px", 
        margin: "0 auto", 
        background: "#fff", 
        borderRadius: "24px", 
        border: "1px solid #f1f5f9", 
        display: "flex", 
        flexDirection: "column", 
        height: "100%",
        boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
      }}>
        {/* Chat Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px", borderBottom: "1px solid #f1f5f9" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <img src="/logo.jpg" alt="Govi AI" style={{ height: "48px", width: "auto", borderRadius: "12px", objectFit: "contain" }} />
            <div>
            <div style={{ fontWeight: 900, fontSize: "20px", color: "#0f172a", marginBottom: "6px" }}>Govi AI Assistant</div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#64748b", fontWeight: 500 }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0bc25c" }} />
              Active - {wxTop}
            </div>
          </div>
          </div>
          <button type="button" style={{ width: "40px", height: "40px", minWidth: "40px", minHeight: "40px", padding: 0, borderRadius: "50%", background: "#fff", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#64748b" }}>
            <FiMoreHorizontal size={20} />
          </button>
        </div>

        {/* Chat Messages */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          {!history.length && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ background: "#f1f5f9", padding: "16px 20px", borderRadius: "20px 20px 20px 4px", color: "#334155", fontSize: "14px", lineHeight: 1.6, maxWidth: "80%" }}>
                Hello! I&apos;m Govi AI Assistant. Ask about crop diseases, fertilizers, weather, or market prices — I&apos;ll answer in Sinhala or English to match you.
              </div>
            </div>
          )}

          {history.map((m, idx) => {
            const mine = m.role === "user";
            return (
              <div key={idx} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start" }}>
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "16px 20px",
                    borderRadius: mine ? "20px 20px 4px 20px" : "20px 20px 20px 4px",
                    background: mine ? "#0bc25c" : "#f1f5f9",
                    color: mine ? "#ffffff" : "#334155",
                    fontSize: "14px",
                    lineHeight: 1.6,
                    fontWeight: mine ? 600 : 500,
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {m.content}
                  {m.image && (
                    <div style={{ marginTop: 12 }}>
                      <img
                        src={m.image}
                        alt="attached"
                        style={{ maxWidth: "100%", borderRadius: "12px", border: mine ? "2px solid rgba(255,255,255,0.2)" : "2px solid rgba(0,0,0,0.05)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {typing && (
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
               <div style={{ background: "#f1f5f9", padding: "12px 20px", borderRadius: "20px 20px 20px 4px", color: "#64748b", fontSize: "13px", fontWeight: 600 }}>
                Typing...
               </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Chat Input Area */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid #f1f5f9", background: "#fff", borderRadius: "0 0 24px 24px" }}>
          
          {/* Quick Action Chips */}
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
            {chips.map((c) => (
              <button key={c} type="button" onClick={() => send(c)} style={{ background: "#f8fafc", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "999px", fontSize: "13px", fontWeight: 700, color: "#334155", cursor: "pointer", transition: "all 0.2s" }}>
                {c}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div style={{ display: "flex", alignItems: "center", border: "1px solid #e2e8f0", borderRadius: "999px", padding: "8px 8px 8px 16px", gap: "12px", background: "#fff" }}>
            <button type="button" title="Attach" onClick={handleAttachClick} style={{ width: "42px", height: "42px", minWidth: "42px", minHeight: "42px", padding: 0, borderRadius: "50%", background: "#f1f5f9", border: "none", color: "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiPaperclip size={20} />
            </button>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => handleImageSelected(e.target.files?.[0])}
            />
            
            <input
              style={{ flex: 1, border: "none", outline: "none", background: "#f8fafc", padding: "12px 20px", borderRadius: "999px", fontSize: "14px", color: "#334155" }}
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              placeholder="Type your message in Sinhala..."
              onKeyDown={(e) => e.key === "Enter" && send(msg)}
            />
            
            <button type="button" title="Voice" onClick={toggleListening} style={{ width: "42px", height: "42px", minWidth: "42px", minHeight: "42px", padding: 0, borderRadius: "50%", background: isListening ? "#ef4444" : "#f1f5f9", border: "none", color: isListening ? "#fff" : "#64748b", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <FiMic size={20} />
            </button>
            
            <button type="button" onClick={() => send(msg)} style={{ width: "42px", height: "42px", minWidth: "42px", minHeight: "42px", padding: 0, borderRadius: "50%", background: "#0bc25c", border: "none", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", cursor: "pointer", flexShrink: 0 }}>
              <FiSend size={18} style={{ transform: "translateX(-1px) translateY(1px)" }} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
