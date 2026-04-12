import { prisma } from "../../lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminPanel() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) redirect("/login");

  let userPayload;
  try {
    const verified = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET || "supersecretkeywow1234")
    );
    userPayload = verified.payload;
  } catch (err) {
    redirect("/login");
  }

  const currentUser = await prisma.user.findUnique({ where: { id: userPayload.id } });
  
  if (!currentUser || !currentUser.isAdmin) {
    redirect("/dashboard"); // Kick out non-admins
  }

  // Fetch all stats
  const totalUsers = await prisma.user.count();
  const totalMessages = await prisma.message.count();
  const publicMessages = await prisma.message.count({ where: { isPublic: true } });

  // Fetch all users with basic info
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { messages: true }
      }
    }
  });

  // Fetch latest globally sent messages
  const latestMessages = await prisma.message.findMany({
    take: 20,
    orderBy: { createdAt: "desc" },
    include: {
      receiver: { select: { username: true } }
    }
  });

  return (
    <div className="container" style={{ paddingTop: "3rem", paddingBottom: "5rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <h2 style={{ color: "#ef4444" }}>🛡️ لوحة الإدارة السرية العليا</h2>
        <Link href="/dashboard" className="btn" style={{ background: "rgba(255,255,255,0.1)", color: "#fff" }}>
          العودة للوحة التحكم
        </Link>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem", marginBottom: "3rem", textAlign: "center" }}>
        <div className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ fontSize: "2.5rem", color: "var(--accent-color)" }}>{totalUsers}</div>
          <p style={{ color: "#cbd5e1" }}>المستخدمين المسجلين</p>
        </div>
        <div className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ fontSize: "2.5rem", color: "#4ade80" }}>{totalMessages}</div>
          <p style={{ color: "#cbd5e1" }}>الرسائل المرسلة كلياً</p>
        </div>
        <div className="glass-card" style={{ padding: "2rem" }}>
          <div style={{ fontSize: "2.5rem", color: "#facc15" }}>{publicMessages}</div>
          <p style={{ color: "#cbd5e1" }}>الردود العلنية</p>
        </div>
      </div>

      <h3 style={{ marginBottom: "1rem" }}>👥 المستخدمين ({users.length})</h3>
      <div className="glass-card" style={{ marginBottom: "3rem", overflowX: "auto" }}>
        <table style={{ width: "100%", textAlign: "right", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <th style={{ padding: "1rem", color: "var(--accent-color)" }}>المستخدم</th>
              <th style={{ padding: "1rem", color: "var(--accent-color)" }}>تاريخ التسجيل</th>
              <th style={{ padding: "1rem", color: "var(--accent-color)" }}>الزيارات</th>
              <th style={{ padding: "1rem", color: "var(--accent-color)" }}>الرسائل المستلمة</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <td style={{ padding: "1rem" }}>{u.isAdmin ? "👑 " : ""}{u.username}</td>
                <td style={{ padding: "1rem" }}>{u.createdAt.toLocaleDateString("ar-EG")}</td>
                <td style={{ padding: "1rem" }}>{u.viewCount}</td>
                <td style={{ padding: "1rem" }}>{u._count.messages}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 style={{ marginBottom: "1rem", color: "#ef4444" }}>🕵️ المركز العالي: أحدث الرسائل الخفية</h3>
      <div style={{ display: "grid", gap: "1rem" }}>
        {latestMessages.map(msg => (
          <div key={msg.id} className="glass-card" style={{ borderLeft: "4px solid #ef4444", padding: "1rem" }}>
            <p style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>{msg.content}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", fontSize: "0.85rem", color: "#94a3b8" }}>
              <span><strong>المستقبل:</strong> {msg.receiver.username}</span>
              <span><strong>المرسل المزعوم:</strong> {msg.senderName || "?"}</span>
              <span><strong>IP:</strong> {msg.ipAddress}</span>
              <span><strong>الموقع:</strong> {msg.country} - {msg.city}</span>
              <span><strong>جهاز:</strong> {msg.deviceType}</span>
            </div>
          </div>
        ))}
      </div>
      
    </div>
  );
}
