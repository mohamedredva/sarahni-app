"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PublicReplyForm({ message }) {
  const [replyText, setReplyText] = useState(message.replyText || "");
  const [isPublic, setIsPublic] = useState(message.isPublic || false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/messages/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageId: message.id, replyText, isPublic })
    });

    if (res.ok) {
      router.refresh();
    } else {
      alert("حدث خطأ أثناء حفظ الرد");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSave} style={{ marginTop: "1rem", background: "rgba(255,255,255,0.05)", padding: "1rem", borderRadius: "8px" }} data-html2canvas-ignore>
      <div style={{ marginBottom: "1rem" }}>
        <textarea 
          className="input-field" 
          rows="2" 
          placeholder="اكتب ردك هنا..." 
          value={replyText} 
          onChange={(e) => setReplyText(e.target.value)}
        />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", color: "#cbd5e1" }}>
          <input 
            type="checkbox" 
            checked={isPublic} 
            onChange={(e) => setIsPublic(e.target.checked)} 
            style={{ width: "18px", height: "18px" }}
          />
          نشر الرد ليظهر للعامة في صفحتك
        </label>
        <button type="submit" className="btn" style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }} disabled={loading}>
          {loading ? "..." : "حفظ الرد"}
        </button>
      </div>
    </form>
  );
}
