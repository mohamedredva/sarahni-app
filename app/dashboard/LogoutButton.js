"use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <button onClick={handleLogout} className="btn" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#fca5a5" }}>
      تسجيل الخروج
    </button>
  );
}
