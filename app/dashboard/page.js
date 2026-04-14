import { prisma } from "../../lib/prisma";
import { cookies, headers } from "next/headers";
import { jwtVerify } from "jose";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "./LogoutButton";
import CopyLinkButton from "./CopyLinkButton";
import ShareStoryButton from "./ShareStoryButton";
import DeleteMessageButton from "./DeleteMessageButton";
import SettingsForm from "./SettingsForm";
import PublicReplyForm from "./PublicReplyForm";

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;

  if (!token) {
    redirect("/login");
  }

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

  const user = await prisma.user.findUnique({
    where: { id: userPayload.id },
    include: {
      messages: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!user) redirect("/login");

  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const personalLink = `${protocol}://${host}/u/${user.username}`;

  return (
    <div className="container" style={{ paddingTop: "4rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3rem" }}>
        <h2>أهلاً بك، <span style={{ color: "var(--accent-color)" }}>{user.username}</span></h2>
        <div style={{ display: "flex", gap: "1rem" }}>
          {user.isAdmin && (
            <Link href="/admin" className="btn" style={{ background: "#ef4444", color: "#fff", padding: "0.5rem 1rem", fontSize: "0.9rem" }}>
              👑 لوحة الإدارة
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <SettingsForm user={user} />

      <div className="glass-card" style={{ marginBottom: "3rem", textAlign: "center" }}>
        <h3>الرابط الخاص بك</h3>
        <p style={{ color: "#cbd5e1", marginBottom: "1rem" }}>شارك هذا الرابط مع أصدقائك أو في البايو الخاص بك لتلقي الرسائل</p>
        <div style={{ background: "rgba(0,0,0,0.3)", padding: "1rem", borderRadius: "12px", border: "1px dashed var(--accent-color)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <code style={{ fontSize: "1.1rem", color: "#fff" }}>{personalLink}</code>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: "1rem" }}>
          <CopyLinkButton link={personalLink} />
          <div style={{ background: "rgba(255,255,255,0.1)", padding: "0.5rem 1rem", borderRadius: "8px", color: "#fff" }}>
            👁️ عدد زوار الرابط: <strong style={{ color: "var(--accent-color)" }}>{user.viewCount || 0}</strong>
          </div>
        </div>
      </div>

      <h3 style={{ marginBottom: "1.5rem" }}>الرسائل الواردة ({user.messages.length})</h3>
      
      {user.messages.length === 0 ? (
        <div className="glass-card" style={{ textAlign: "center", padding: "4rem" }}>
          <p style={{ color: "#64748b", fontSize: "1.2rem" }}>لا توجد رسائل بعد. شارك رابطك لتبدأ في تلقي الرسائل!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {user.messages.map((msg) => (
            <div key={msg.id} className="glass-card" style={{ position: "relative" }} id={`msg-story-${msg.id}`}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", borderBottom: "1px solid var(--glass-border)", paddingBottom: "1rem" }}>
                <span style={{ fontWeight: "bold", color: "var(--accent-color)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  {msg.senderName ? `👤 ${msg.senderName}` : "🕵️ مجهول"}
                </span>
                <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  {new Date(msg.createdAt).toLocaleString("ar-EG")}
                </span>
              </div>
              
              <p style={{ fontSize: "1.3rem", lineHeight: "1.8", marginBottom: "2rem", color: "#fff" }}>{msg.content}</p>
              
              {/* Action Buttons for sharing or deleting */}
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }} data-html2canvas-ignore>
                <ShareStoryButton messageId={msg.id} />
                <DeleteMessageButton messageId={msg.id} />
              </div>

              {/* Public Reply Form */}
              <PublicReplyForm message={msg} />

              {user.isAdmin && (
                <div data-html2canvas-ignore style={{ marginTop: "1.5rem", background: "rgba(0,0,0,0.2)", padding: "1rem", borderRadius: "8px", fontSize: "0.85rem", color: "#94a3b8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                  <div style={{ gridColumn: "span 2", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", marginBottom: "0.5rem", color: "var(--accent-color)", fontWeight: "bold" }}>🌍 الموقع والشبكة</div>
                  <div><strong>📍 الموقع:</strong> <br/>{msg.country || "غير محدد"} {msg.city ? `- ${msg.city}` : ""}</div>
                  <div><strong>📡 مزود الخدمة:</strong> <br/>{msg.isp || "غير محدد"}</div>
                  <div><strong>🌍 IP Address:</strong> <br/>{msg.ipAddress}</div>
                  <div><strong>🌐 المتصفح:</strong> <br/>{msg.userAgent?.substring(0, 40)}...</div>
                  
                  <div style={{ gridColumn: "span 2", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", marginBottom: "0.5rem", marginTop: "0.5rem", color: "var(--accent-color)", fontWeight: "bold" }}>🖥️ مواصفات الجهاز</div>
                  <div><strong>📱 الجهاز:</strong> <br/>{msg.deviceType}</div>
                  <div><strong>🔋 البطارية:</strong> <br/>{msg.batteryInfo || "غير متاح"}</div>
                  <div><strong>🖥️ الشاشة:</strong> <br/>{msg.screenResolution || "غير متاح"}</div>
                  <div><strong>👆 دعم اللمس:</strong> <br/>{msg.isTouch || "غير متاح"}</div>
                  
                  <div style={{ gridColumn: "span 2", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "0.5rem", marginBottom: "0.5rem", marginTop: "0.5rem", color: "var(--accent-color)", fontWeight: "bold" }}>⚙️ العتاد (الهاردوير)</div>
                  <div><strong>🧠 الرامات:</strong> <br/>{msg.ramSize || "غير متاح"}</div>
                  <div><strong>⚙️ المعالج (Cores):</strong> <br/>{msg.cpuCores || "غير متاح"}</div>
                  <div style={{ gridColumn: "span 2" }}><strong>🎮 كارت الشاشة (GPU):</strong> <br/>{msg.gpuModel || "غير متاح"}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
