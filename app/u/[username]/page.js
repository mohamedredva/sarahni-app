"use client";
import { useState, use, useEffect } from "react";
import Link from "next/link";

export default function SendMessagePage({ params }) {
  const resolvedParams = use(params);
  const username = resolvedParams.username;
  
  const [content, setContent] = useState("");
  const [senderName, setSenderName] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // Increment view count when page loads
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username })
    }).catch(e => console.error("Could not record view", e));

    // Fetch user public profile
    fetch(`/api/user/${username}`)
      .then(res => res.json())
      .then(data => {
        if(!data.error) setProfile(data);
      })
      .catch(e => console.error(e));
  }, [username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");

    try {
      let batteryInfo = "غير متاح";
      if (navigator.getBattery) {
        const battery = await navigator.getBattery();
        batteryInfo = `🔋 ${Math.round(battery.level * 100)}% ${battery.charging ? '(يشحن)' : '(على البطارية)'}`;
      }

      const screenResolution = `${window.screen.width}x${window.screen.height}`;
      const browserLanguage = navigator.language || navigator.userLanguage || "غير محدد";

      let ramSize = "غير متاح";
      let cpuCores = "غير متاح";
      if (navigator.deviceMemory) ramSize = `${navigator.deviceMemory}GB`;
      if (navigator.hardwareConcurrency) cpuCores = `${navigator.hardwareConcurrency}`;
      
      const isTouch = navigator.maxTouchPoints > 0 ? "نعم" : "لا";
      
      let gpuModel = "غير متاح";
      try {
        const canvas = document.createElement("canvas");
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        if (gl) {
          const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
          if (debugInfo) {
            gpuModel = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          }
        }
      } catch (e) { }

      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          content, 
          senderName, 
          receiverUsername: username,
          batteryInfo,
          screenResolution,
          browserLanguage,
          ramSize,
          cpuCores,
          isTouch,
          gpuModel
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg(data.error);
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("حدث خطأ في الاتصال");
    }
  };

  if (status === "success") {
    return (
      <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ width: "100%", maxWidth: "500px", textAlign: "center" }}>
          <h2 style={{ color: "#4ade80", marginBottom: "1rem" }}>تم إرسال رسالتك بنجاح! ✅</h2>
          <p style={{ marginBottom: "2rem", color: "#cbd5e1" }}>شكراً لصدقك. هل تريد أنت أيضاً استقبال رسائل؟</p>
          <Link href="/" className="btn">
            أنشئ حسابك الخاص
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ display: "flex",flexDirection: "column", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "2rem 0" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "500px", marginBottom: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          {profile?.avatarUrl && (
            <img 
              src={profile.avatarUrl} 
              alt="Avatar" 
              style={{ width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", margin: "0 auto 1rem auto", border: "3px solid var(--accent-color)" }}
            />
          )}
          <h2>أرسل سراً إلى <span style={{ color: "var(--accent-color)" }}>{username}</span></h2>
          <p style={{ color: "#cbd5e1", fontSize: "0.95rem", marginTop: "0.5rem" }}>
            {profile?.bio ? profile.bio : "اكتب رسالتك وسنوصلها له بأمان"}
          </p>
        </div>

        {status === "error" && <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", textAlign: "center" }}>{errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>الرسالة (مطلوب)</label>
            <textarea 
              className="input-field" 
              rows="5"
              placeholder="اكتب كل ما في قلبك..." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{ resize: "none" }}
            />
          </div>
          <div className="input-group">
            <label className="input-label" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>اسمك (مطلوب)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="اكتب اسمك وسيبقى هذا في سرية تامة" 
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              required
            />
            <small style={{ color: "#4ade80", marginTop: "0.4rem", fontWeight: "bold" }}>🔒 رسالتك سوف تصل في سرية تامة</small>
          </div>
          <button type="submit" className="btn" style={{ width: "100%", marginTop: "1rem", padding: "1rem" }} disabled={status === "loading"}>
            {status === "loading" ? "جاري الإرسال..." : "إرسال الرسالة 🚀"}
          </button>
        </form>
      </div>

      {/* Public Replies Section */}
      {profile?.messages?.length > 0 && (
        <div style={{ width: "100%", maxWidth: "500px" }}>
          <h3 style={{ marginBottom: "1rem", color: "#fff" }}>الردود العلنية 💬</h3>
          <div style={{ display: "grid", gap: "1rem" }}>
            {profile.messages.map(msg => (
              <div key={msg.id} className="glass-card" style={{ padding: "1.5rem" }}>
                <p style={{ color: "#cbd5e1", fontStyle: "italic", marginBottom: "1rem", borderRight: "3px solid var(--accent-color)", paddingRight: "1rem" }}>
                  " {msg.content} "
                </p>
                <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "8px" }}>
                  <strong style={{ color: "var(--accent-color)" }}>رد {username}:</strong>
                  <p style={{ marginTop: "0.5rem", color: "#fff" }}>{msg.replyText}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
