"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { getCurrentUser, type Role, type Session } from "@/lib/auth";

// 역할별 화면의 공통 셸 — 사이드바 + 탑바 + 콘텐츠.
// 미인증이거나 역할 불일치면 로그인/역할선택으로 안내.
export function RoleShell({
  role,
  title,
  subtitle,
  actions,
  children,
}: {
  role: Role;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setChecked(true);
    if (!u) router.replace("/");
    else if (u.role !== role) router.replace("/role-select");
  }, [role, router]);

  if (!checked || !user || user.role !== role) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-500)", fontSize: 14 }}>
        불러오는 중…
      </div>
    );
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "var(--page-bg)" }}>
      <Sidebar role={role} />
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        {/* TopBar */}
        <header
          style={{
            height: "var(--topbar-h)",
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "0 40px",
            background: "#fff",
            borderBottom: "1px solid var(--ink-200)",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ minWidth: 0, overflow: "hidden" }}>
            <div style={{ fontSize: 17, fontWeight: 700, color: "var(--ink-900)", letterSpacing: "-0.015em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
            {subtitle && <div style={{ fontSize: 12.5, color: "var(--ink-500)", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{subtitle}</div>}
          </div>
          <div style={{ flex: 1, minWidth: 12 }} />
          {actions && <div style={{ flexShrink: 0 }}>{actions}</div>}
          {/* User chip */}
          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", background: "var(--page-bg)", borderRadius: 999 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: user.avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5 }}>
              {user.name.charAt(0)}
            </div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--ink-900)" }}>{user.name} 님</div>
              <div style={{ fontSize: 10.5, color: "var(--ink-500)" }}>{user.dept} · {user.team}</div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: "auto", padding: "32px 40px 48px" }}>{children}</main>
      </div>
    </div>
  );
}
