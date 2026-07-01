"use client";

import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { StatCard } from "@/components/StatCard";
import { r1Okrs, type OKR } from "@/lib/mockData";

const STATUS: Record<OKR["status"], { bg: string; bd: string; fg: string; label: string }> = {
  submitted: { bg: "#EFF4FE", bd: "#C5D5F7", fg: "#2B5DD9", label: "제출 · 검토 대기" },
  approved: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", label: "승인 완료" },
  draft: { bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685", label: "작성 중" },
  rejected: { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", label: "함께 정제" },
};

function OKRItem({ okr }: { okr: OKR }) {
  const s = STATUS[okr.status];
  const barColor = okr.progress >= 70 ? "#2F9E5E" : okr.progress >= 40 ? "#3B5BDB" : "#D98023";
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <span style={{ padding: "3px 10px", borderRadius: 999, background: s.bg, border: `1px solid ${s.bd}`, color: s.fg, fontSize: 11.5, fontWeight: 600 }}>{s.label}</span>
        <span className="mono" style={{ padding: "3px 10px", borderRadius: 999, background: "var(--page-bg)", border: "1px solid #E1E5EF", color: "#5B6685", fontSize: 11.5, fontWeight: 600 }}>KR · {okr.format}</span>
        <span className="mono" style={{ fontSize: 11.5, color: "#7C87A4", marginLeft: "auto" }}>가중치 {okr.weight}%</span>
      </div>
      <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 3 }}>{okr.obj}</div>
      <div style={{ fontSize: 16, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, letterSpacing: "-0.01em" }}>{okr.kr}</div>
      <div style={{ marginTop: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 500 }}>진행률</span>
          <div style={{ flex: 1, height: 8, background: "var(--page-bg)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${okr.progress}%`, background: barColor, borderRadius: 4 }} />
          </div>
          <span className="ds-num" style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", minWidth: 38, textAlign: "right" }}>{okr.progress}%</span>
        </div>
        <div className="mono" style={{ display: "flex", gap: 16, fontSize: 11.5, color: "#5B6685" }}>
          <div>Baseline: <span style={{ color: "#0F1A36", fontWeight: 600 }}>{okr.baseline}</span></div>
          <div>Goal: <span style={{ color: "#3B5BDB", fontWeight: 600 }}>{okr.goal}</span></div>
        </div>
      </div>
      {okr.evaluator && (
        <div style={{ marginTop: 14, padding: "10px 12px", background: "#F1F4FD", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12.5, color: "#3A4565", lineHeight: 1.55 }}>
          <span style={{ color: "#3B5BDB", fontSize: 14 }}>💬</span>
          <div><b style={{ color: "#1B2A4E" }}>{okr.evaluator.from} 팀장</b> · &ldquo;{okr.evaluator.msg}&rdquo;</div>
        </div>
      )}
    </div>
  );
}

function AICoachingCard() {
  const tips = [
    { tag: "측정 명확화", msg: "Baseline과 Goal에 동일 단위(ms)를 사용하면 진행률이 더 또렷해져요." },
    { tag: "도전성", msg: "전월 대비 8% 개선은 좋은 출발입니다. 마일스톤을 한 단계 더 잡아볼까요?" },
    { tag: "증빙", msg: "APM 캡처를 주간 코칭 메모에 첨부하면 평가 시 더 수월합니다." },
  ];
  return (
    <div style={{ background: "linear-gradient(135deg, #0A1F17 0%, #14342B 100%)", color: "#fff", borderRadius: 16, padding: 22, display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 11, background: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>✨</div>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>AI 코칭 인사이트</div>
          <div style={{ fontSize: 11.5, color: "#7CE9BE", marginTop: 2 }}>오늘의 맞춤 제안 3건</div>
        </div>
        <span style={{ marginLeft: "auto", padding: "3px 8px", borderRadius: 6, background: "rgba(124,233,190,0.18)", color: "#B9F1D8", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em" }}>NEW</span>
      </div>
      {tips.map((t) => (
        <div key={t.tag} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#3EDDA1", marginTop: 6, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7CE9BE", marginBottom: 3 }}>{t.tag}</div>
            <div style={{ fontSize: 12.5, color: "#D9F4E7", lineHeight: 1.55 }}>{t.msg}</div>
          </div>
        </div>
      ))}
      <button onClick={() => alert("AI 코칭 화면은 준비 중이에요 🙂")} style={{ background: "#fff", color: "#0A1F17", border: "none", borderRadius: 10, width: "100%", padding: 12, fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        ✨ 더 자세한 코칭 받기
      </button>
    </div>
  );
}

export default function R1HomePage() {
  const router = useRouter();
  return (
    <RoleShell role="R1" title="피평가자 홈" subtitle="정태영 · 운영본부 · 결제플랫폼팀">
      {/* Greeting */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · OKR 등록 진행 중</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>안녕하세요, 정태영 님 👋</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#5B6685" }}>마감까지 29일 남았어요. KR 3개 중 1개는 아직 작성 중이네요.</p>
      </div>

      {/* CTA banner */}
      <div
        onClick={() => router.push("/r1/write")}
        style={{ background: "linear-gradient(135deg, #3B5BDB 0%, #2C49B8 60%, #14342B 100%)", borderRadius: 16, padding: "24px 28px", color: "#fff", display: "flex", alignItems: "center", gap: 20, boxShadow: "0 12px 32px -12px rgba(59,91,219,.55)", position: "relative", overflow: "hidden", cursor: "pointer", marginBottom: 24 }}
      >
        <div style={{ width: 64, height: 64, borderRadius: 16, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, flexShrink: 0 }}>🎯</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, opacity: 0.85, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ padding: "3px 9px", background: "rgba(255,255,255,0.2)", borderRadius: 999 }}>지금 할 일</span>
            <span>D-29 · OKR 등록 마감까지</span>
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 4 }}>이번 반기 OKR을 작성해볼까요?</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>8단계 위저드로 KR을 정제하고 AI 코칭과 함께 완성해요 · <b>3/8 단계 진행 중</b></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#2C49B8", padding: "14px 22px", borderRadius: 12, fontSize: 14.5, fontWeight: 800, flexShrink: 0 }}>
          OKR 이어서 작성 <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🎯" iconBg="#E5EBFB" iconFg="#3B5BDB" label="OKR 달성률" value="72" unit="%" sub="↑ 8% 전월 대비" subTone="ok" />
        <StatCard icon="✓" iconBg="#ECFAF1" iconFg="#2F9E5E" label="나의 핵심결과" value="8" unit="/ 11" sub="진행 중" />
        <StatCard icon="💬" iconBg="#FFEDE2" iconFg="#E07A3C" label="받은 피드백" value="14" unit="건" sub="이번 분기" />
        <StatCard icon="✨" iconBg="#F0E9FB" iconFg="#7C4DD9" label="AI 코칭 제안" value="3" unit="건" sub="새로운 제안" subTone="ok" />
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>나의 OKR</div>
            <div style={{ fontSize: 12.5, color: "#7C87A4", marginTop: 3 }}>2026 하반기 · 총 3개 · 가중치 75 / 110</div>
          </div>
          {r1Okrs.map((o, i) => <OKRItem key={i} okr={o} />)}
        </div>
        <div><AICoachingCard /></div>
      </div>

      <div style={{ marginTop: 28, padding: "14px 18px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#5B6685", lineHeight: 1.55 }}>
        <span style={{ fontSize: 16 }}>💡</span>
        AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
      </div>
    </RoleShell>
  );
}
