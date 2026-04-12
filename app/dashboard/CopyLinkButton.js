"use client";
import { useState } from "react";

export default function CopyLinkButton({ link }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button onClick={handleCopy} className="btn" style={{ padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
      {copied ? "✅ تم النسخ!" : "📋 نسخ الرابط"}
    </button>
  );
}
