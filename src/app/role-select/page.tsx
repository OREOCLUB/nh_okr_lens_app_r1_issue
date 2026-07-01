"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { getCurrentUser, logout, type Session } from "@/lib/auth";

function RoleCardBig({
  icon, iconBg, iconFg, title, desc, features, accentColor, href, recommended,
}: {
  icon: string; iconBg: string; iconFg: string; title: string; desc: string;
  features: string[]; accentColor: string; href: string; recommended?: boolean;
}) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#fff",
          border: `1.5px solid ${hover ? accentColor : "#E1E5EF"}`,
          borderRadius: 20, padding: "32px 28px",
          display: "flex", flexDirection: "column", gap: 18, cursor: "pointer",
          transition: "all 220ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: hover ? `0 16px 40px -12px ${accentColor}30` : "0 1px 2px rgba(31,42,74,.04)",
          transform: hover ? "translateY(-4px)" : "translateY(0)",
          position: "relative", height: "100%",
        }}
      >
        {recommended && (
          <div style={{ position: "absolute", top: 16, right: 16, background: accentColor, color: "#fff", fontSize: 10.5, fontWeight: 700, padding: "3px 9px", borderRadius: 999 }}>추천</div>
        )}
        <div style={{ width: 68, height: 68, borderRadius: "50%", background: iconBg, color: iconFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>{icon}</div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "#5B6685", lineHeight: 1.6, marginTop: 6 }}>{desc}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 14, borderTop: "1px solid #ECEFF5" }}>
          {features.map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#3A4565" }}>
              <span style={{ color: accentColor, fontWeight: 700, fontSize: 13 }}>✓</span>
              {f}
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", paddingTop: 6, display: "flex", alignItems: "center", justifyContent: "space-between", color: accentColor, fontSize: 14, fontWeight: 600 }}>
          <span>이 역할로 시작하기</span>
          <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: "50%", background: hover ? accentColor : `${accentColor}15`, color: hover ? "#fff" : accentColor, transition: "all 180ms ease-out", fontSize: 14 }}>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function RoleSelectPage() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) router.replace("/");
    else setUser(u);
  }, [router]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", color: "#3A4565" }}>
      <header style={{ height: 64, padding: "0 40px", display: "flex", alignItems: "center", background: "#fff", borderBottom: "1px solid #E1E5EF" }}>
        <Link href="/" style={{ textDecoration: "none" }}><Logo size={22} /></Link>
        <div style={{ flex: 1 }} />
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 14px 6px 6px", background: "var(--page-bg)", borderRadius: 999 }}>
            <div style={{ width: 30, height: 30, borderRadius: "50%", background: user.avatarColor, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12.5 }}>{user.name.charAt(0)}</div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{user.name} 님</div>
              <div style={{ fontSize: 10.5, color: "#7C87A4" }}>{user.dept} · {user.team}</div>
            </div>
          </div>
        )}
        <button onClick={handleLogout} style={{ marginLeft: 14, fontSize: 12.5, color: "#5B6685", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
          <span>↩</span> 로그아웃
        </button>
      </header>

      <div style={{ flex: 1, padding: "56px", display: "flex", flexDirection: "column", alignItems: "center", maxWidth: 1280, margin: "0 auto", width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 44, maxWidth: 720 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ECFAF1", color: "#2F9E5E", padding: "6px 14px", borderRadius: 999, fontSize: 12.5, fontWeight: 600, marginBottom: 18 }}>
            <span>✓</span> 로그인 완료 · 환영합니다
          </div>
          <h1 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
            어떤 역할로 시작하시겠어요?
          </h1>
          <p style={{ marginTop: 14, fontSize: 15, color: "#5B6685", lineHeight: 1.65 }}>
            현재 권한으로 이용 가능한 서비스입니다. 역할에 따라 제공되는 기능이 달라요.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20, width: "100%", maxWidth: 1100 }}>
          <RoleCardBig icon="👤" iconBg="#E5EBFB" iconFg="#3B5BDB" accentColor="#3B5BDB" title="피평가자" desc="나의 OKR을 작성·관리하고 AI 코칭을 받습니다." features={["OKR 작성 위저드 · AI 정제", "달성 현황 대시보드", "평가자 피드백 확인"]} href="/r1" recommended />
          <RoleCardBig icon="👥" iconBg="#E0F7EC" iconFg="#00A968" accentColor="#00A968" title="평가자" desc="팀원의 OKR을 검토·승인하고 코칭합니다." features={["팀원 OKR 현황 대시보드", "AI Validation · 검토 의견", "승인 · 반려 · 조정요청"]} href="/r2" />
          <RoleCardBig icon="🛡️" iconBg="#FFEDE2" iconFg="#E07A3C" accentColor="#E07A3C" title="인사담당자" desc="전사 인사이트와 평가 기준을 관리합니다." features={["캘리브레이션 인사이트", "평가 기준 · 마스터 데이터", "표준 지표 라이브러리"]} href="/r3" />
        </div>

        <div style={{ marginTop: 32, padding: "14px 22px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#5B6685", lineHeight: 1.6, maxWidth: 720 }}>
          <span style={{ fontSize: 17 }}>💡</span>
          역할은 언제든 좌측 사이드바에서 전환할 수 있어요. 권한이 없는 역할은 안내 메시지로 표시됩니다.
        </div>
      </div>
    </div>
  );
}
