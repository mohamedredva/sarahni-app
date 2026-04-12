import Link from "next/link";

export default function Home() {
  return (
    <div className="container" style={{ textAlign: "center", marginTop: "10vh" }}>
      <div className="glass-card" style={{ padding: "4rem 2rem", maxWidth: "600px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>استقبل رسائل بأسلوب جديد</h1>
        <p style={{ fontSize: "1.2rem", lineHeight: "1.8", color: "#cbd5e1", marginBottom: "2.5rem" }}>
          احصل على آراء حقيقية من أصدقائك بخصوصية.. واعرف من يهتم بك!
          قم بإنشاء رابطك الخاص الآن وابدأ في استقبال الرسائل والمصارحات.
        </p>

        <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
          <Link href="/register" className="btn" style={{ padding: "1rem 2rem", fontSize: "1.1rem" }}>
            ⭐ أنشئ حسابك الآن
          </Link>
          <Link href="/login" className="btn" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "#fff" }}>
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  );
}
