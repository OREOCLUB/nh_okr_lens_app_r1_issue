"use client";

import { useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "./Logo";
import { ROLE_LABEL, ROLE_HOME, logout, type Role } from "@/lib/auth";

const COLLAPSE_KEY = "okrlens_sidebar_collapsed";
// 라우트 이동 시 컴포넌트가 재마운트되어도 접힘 상태를 즉시 알 수 있게 모듈 캐시 유지
// (localStorage는 effect 이후에만 읽을 수 있어 첫 프레임 플래시의 원인이 됨)
let collapsedCache: boolean | null = null;

interface NavItem {
  label: string;
  icon: string;
  href?: string; // 없으면 준비 중
}
interface NavGroup {
  header: string;
  items: NavItem[];
}

// SKILL.md §9 사이드바 그룹핑 — 홈만 실제 라우트, 나머지는 준비 중
const NAV: Record<Role, NavGroup[]> = {
  R1: [
    { header: "개인 · MY", items: [
      { label: "홈", icon: "🏠", href: "/r1" },
      { label: "마이페이지", icon: "👤", href: "/r1/mypage" },
      { label: "이전 평가", icon: "🗂️", href: "/r1/history" },
    ]},
    { header: "OKR", items: [
      { label: "나의 OKR", icon: "🎯", href: "/r1/my-okr" },
      { label: "OKR 작성", icon: "✏️", href: "/r1/write" },
      { label: "AI 코칭", icon: "✨", href: "/r1/coaching" },
    ]},
    { header: "일정 · 피드백", items: [
      { label: "평가 캘린더", icon: "📅", href: "/r1/calendar" },
      { label: "피드백", icon: "💬", href: "/r1/feedback" },
    ]},
  ],
  R2: [
    { header: "팀 관리", items: [
      { label: "대시보드", icon: "📊", href: "/r2" },
      { label: "팀원 관리", icon: "👥", href: "/r2/member" },
    ]},
    { header: "평가 · 코칭", items: [
      { label: "OKR 검토", icon: "📥", href: "/r2/review" },
      { label: "코칭 캘린더", icon: "📅", href: "/r2/calendar" },
      { label: "피드백 작성", icon: "💬", href: "/r2/feedback" },
      { label: "이전 평가", icon: "🗂️", href: "/r2/history" },
    ]},
  ],
  R3: [
    { header: "기준 정보", items: [
      { label: "평가 기준", icon: "⚖️", href: "/r3/criteria" },
      { label: "마스터 데이터", icon: "🗃️", href: "/r3/master" },
      { label: "평가 일정 관리", icon: "📅", href: "/r3/schedule" },
    ]},
    { header: "평가 인사이트", items: [
      { label: "캘리브레이션", icon: "📊", href: "/r3" },
      { label: "표준 지표", icon: "🧭", href: "/r3/metrics" },
    ]},
    { header: "운영", items: [
      { label: "AI 코치 관리", icon: "🤖", href: "/r3/coach" },
      { label: "산출물", icon: "📤", href: "/r3/export" },
      { label: "환경 설정", icon: "⚙️", href: "/r3/env" },
    ]},
  ],
};

const ROLE_CHIP: Record<Role, { bg: string; fg: string }> = {
  R1: { bg: "#E5EBFB", fg: "#3B5BDB" },
  R2: { bg: "#E0F7EC", fg: "#00A968" },
  R3: { bg: "#FFEDE2", fg: "#E07A3C" },
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const chip = ROLE_CHIP[role];
  // 재마운트 시 캐시로 즉시 올바른 폭 렌더 (모든 라우트에서 플래시 없음)
  const [collapsed, setCollapsed] = useState(() => collapsedCache ?? false);
  const [mounted, setMounted] = useState(false);

  // 최초 로드 1회: 페인트 전에 localStorage 값을 적용하고 캐시에 채운다
  useLayoutEffect(() => {
    if (collapsedCache === null) {
      try {
        collapsedCache = localStorage.getItem(COLLAPSE_KEY) === "1";
      } catch {
        collapsedCache = false;
      }
      setCollapsed(collapsedCache);
    }
    setMounted(true);
  }, []);

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c;
      collapsedCache = next;
      try {
        localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      } catch {
        /* noop */
      }
      return next;
    });
  }

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <aside
      style={{
        width: collapsed ? 72 : "var(--sidebar-w)",
        flexShrink: 0,
        background: "var(--ink-brand)",
        color: "#C7D6CE",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        transition: mounted ? "width 180ms ease-out" : "none",
        overflow: "hidden",
      }}
    >
      {/* Brand + 접기 토글 */}
      <div style={{ padding: collapsed ? "18px 12px 14px" : "22px 20px 16px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {!collapsed && <Logo size={20} dark />}
          <button
            onClick={toggleCollapse}
            title={collapsed ? "사이드바 펼치기" : "사이드바 접기"}
            style={{ marginLeft: collapsed ? 0 : "auto", width: collapsed ? "100%" : 28, height: 28, borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.06)", color: "#9DB3A9", cursor: "pointer", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: 8, marginTop: 12 }}>
          <span
            title={`${role} · ${ROLE_LABEL[role]}`}
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: "3px 9px",
              borderRadius: 999,
              background: chip.bg,
              color: chip.fg,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {collapsed ? role : `${role} · ${ROLE_LABEL[role]}`}
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, overflowY: "auto", padding: collapsed ? "14px 10px" : "14px 12px" }}>
        {NAV[role].map((group) => (
          <div key={group.header} style={{ marginBottom: collapsed ? 10 : 18 }}>
            {!collapsed && (
              <div
                style={{
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                  color: "#5F7C6E",
                  fontSize: 10.5,
                  fontWeight: 700,
                  padding: "6px 14px 8px",
                }}
              >
                {group.header}
              </div>
            )}
            {group.items.map((item) => {
              const active = item.href === pathname;
              const inner = (
                <div
                  title={item.label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: collapsed ? "center" : "flex-start",
                    gap: collapsed ? 0 : 10,
                    padding: collapsed ? "10px 0" : "9px 14px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: active ? 700 : 500,
                    color: active ? "#FFFFFF" : "#9DB3A9",
                    background: active ? "rgba(0,169,104,0.16)" : "transparent",
                    boxShadow: active ? "inset 3px 0 0 #3EDDA1" : "none",
                    cursor: "pointer",
                    transition: "background 140ms",
                  }}
                >
                  <span style={{ fontSize: 15, width: 18, textAlign: "center" }}>{item.icon}</span>
                  {!collapsed && <span>{item.label}</span>}
                  {!collapsed && !item.href && (
                    <span style={{ marginLeft: "auto", fontSize: 9.5, color: "#5F7C6E", fontWeight: 600 }}>
                      곧
                    </span>
                  )}
                </div>
              );
              return item.href ? (
                <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                  {inner}
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => alert(`"${item.label}" 화면은 준비 중이에요 🙂\n(현재 프로토타입은 로그인·역할선택·역할별 홈만 구현됨)`)}
                  style={{ display: "block", width: "100%", background: "none", border: "none", padding: 0, textAlign: "left" }}
                >
                  {inner}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer — 역할 전환 · 로그아웃 */}
      <div style={{ padding: "12px", borderTop: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 4 }}>
        <Link href="/role-select" style={{ textDecoration: "none" }}>
          <div title="역할 전환" style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 10, padding: collapsed ? "9px 0" : "9px 14px", borderRadius: 10, fontSize: 13, color: "#9DB3A9", cursor: "pointer" }}>
            <span>🔄</span> {!collapsed && "역할 전환"}
          </div>
        </Link>
        <button onClick={handleLogout} title="로그아웃" style={{ display: "flex", alignItems: "center", justifyContent: collapsed ? "center" : "flex-start", gap: collapsed ? 0 : 10, padding: collapsed ? "9px 0" : "9px 14px", borderRadius: 10, fontSize: 13, color: "#9DB3A9", cursor: "pointer", background: "none", border: "none", width: "100%", textAlign: "left" }}>
          <span>↩</span> {!collapsed && "로그아웃"}
        </button>
      </div>
    </aside>
  );
}

// href를 role에 맞춰 홈으로 (미사용 시 참고)
export function roleHomeHref(role: Role) {
  return ROLE_HOME[role];
}
