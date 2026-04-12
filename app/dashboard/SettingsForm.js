"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsForm({ user }) {
  const [bio, setBio] = useState(user.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [telegramChatId, setTelegramChatId] = useState(user.telegramChatId || "");
  const [status, setStatus] = useState("idle");

  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/user/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bio, avatarUrl, telegramChatId })
    });
    
    if (res.ok) {
      setStatus("success");
      router.refresh();
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSave} className="glass-card" style={{ marginBottom: "3rem", textAlign: "right" }}>
      <h3 style={{ marginBottom: "1rem" }}>⚙️ تفضيلات الحساب وتليجرام</h3>
      
      <div className="input-group" style={{ marginBottom: "1rem" }}>
        <label className="input-label" style={{ display: "block", marginBottom: "0.5rem" }}>رابط صورة شخصية (اختياري)</label>
        <input type="text" className="input-field" placeholder="https://..." value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      </div>

      <div className="input-group" style={{ marginBottom: "1rem" }}>
        <label className="input-label" style={{ display: "block", marginBottom: "0.5rem" }}>نبذة عنك (تظهر للزوار)</label>
        <textarea className="input-field" rows="2" placeholder="اكتب شيئاً ترحيبياً..." value={bio} onChange={(e) => setBio(e.target.value)} />
      </div>

      <div className="input-group" style={{ marginBottom: "1rem" }}>
        <label className="input-label" style={{ display: "block", marginBottom: "0.5rem" }}>Telegram Chat ID (لإشعارات الرسائل)</label>
        <input type="text" className="input-field" placeholder="رقم الـ ID عبر بوت @userinfobot" value={telegramChatId} onChange={(e) => setTelegramChatId(e.target.value)} />
      </div>

      <button type="submit" className="btn" style={{ padding: "0.5rem 1rem" }} disabled={status === "loading"}>
        {status === "loading" ? "جاري الحفظ..." : "حفظ التعديلات"}
      </button>
      {status === "success" && <span style={{ color: "#4ade80", marginRight: "1rem" }}>تم الحفظ!</span>}
      {status === "error" && <span style={{ color: "#ef4444", marginRight: "1rem" }}>خطأ.</span>}
    </form>
  );
}
