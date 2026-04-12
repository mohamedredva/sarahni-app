"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteMessageButton({ messageId }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه الرسالة نهائياً؟")) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("فشل الحذف. يرجى المحاولة لاحقاً.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDelete} disabled={loading} style={{ background: "transparent", border: "1px solid #ef4444", color: "#ef4444", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem" }}>
      {loading ? "..." : "🗑️ حذف"}
    </button>
  );
}
