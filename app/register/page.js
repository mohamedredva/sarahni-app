"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (res.ok) {
        router.push("/dashboard");
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
      <div className="glass-card" style={{ width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>إنشاء حساب جديد</h2>
        {error && <div style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", textAlign: "center" }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="input-label">اسم المستخدم (بالإنجليزي - ليكون رابطك)</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="مثال: ahmed123" 
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
              required 
            />
          </div>
          <div className="input-group">
            <label className="input-label">كلمة المرور</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>
          <button type="submit" className="btn" style={{ width: "100%", marginTop: "1rem" }} disabled={loading}>
            {loading ? "جاري الإنشاء..." : "إنشاء حساب"}
          </button>
        </form>

        <div style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.9rem" }}>
          لديك حساب بالفعل؟ <Link href="/login" style={{ color: "var(--accent-color)", fontWeight: "bold" }}>تسجيل الدخول</Link>
        </div>
      </div>
    </div>
  );
}
