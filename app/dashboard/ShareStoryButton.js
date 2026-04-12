"use client";
import * as htmlToImage from "html-to-image";
import { useState } from "react";

export default function ShareStoryButton({ messageId }) {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      const node = document.getElementById(`msg-story-${messageId}`);
      if (!node) return;
      
      const dataUrl = await htmlToImage.toPng(node, {
        backgroundColor: "#0f172a", // Match app dark theme
        style: {
          padding: "2rem",
          borderRadius: "16px",
          transform: "scale(1)",
        }
      });
      
      const link = document.createElement("a");
      link.download = `sarahni-message-${messageId.substring(0, 5)}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to capture image", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleShare} disabled={loading} style={{ background: "transparent", border: "1px solid #c084fc", color: "#c084fc", padding: "0.5rem 1rem", borderRadius: "8px", cursor: "pointer", fontSize: "0.9rem" }}>
      {loading ? "جاري الالتقاط..." : "📸 صورة للقصة"}
    </button>
  );
}
