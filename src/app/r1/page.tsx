"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { StatCard } from "@/components/StatCard";
import { r1Okrs, type OKR } from "@/lib/mockData";
import { getR1Okrs } from "@/lib/dataAccess";
import { getCurrentUser, type Session } from "@/lib/auth";
import { loadWizard, type WizardState } from "@/lib/wizard";

// OKR 등록 마감일 (eval_phases 'lock' 시드 기준 — P2에서 일정 테이블 연동)
const DEADLINE = new Date("2026-07-15");

const STATUS: Record<OKR["status"], { bg: string; bd: string; fg: string; label: string }> = {
  submitted: { bg: "#EFF4FE", bd: "#C5D5F7", fg: "#2B5DD9", label: "제출 · 검토 대기" },
  approved: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", label: "승인 완료" },
  draft: { bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685", label: "작성 중" },
  rejected: { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", label: "함께 정제" },
};

// OKR 카테고리 배지 — 신규 카테고리가 생겨도 폴백 스타일로 자동 표시 (확장형)
const CATEGORY_META: Record<string, { bg: string; bd: string; fg: string; ico: string }> = {
  "운영": { bg: "#E5EBFB", bd: "#C5D0F7", fg: "#213A8C", ico: "⚙️" },
  "전략혁신": { bg: "#F0E9FB", bd: "#DCC9F4", fg: "#7C4DD9", ico: "🚀" },
  "사후평가": { bg: "#FFEDE2", bd: "#F5CDB2", fg: "#B85C1F", ico: "🔍" },
};
const FALLBACK_CATEGORY = { bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685", ico: "🏷️" };

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null;
  const m = CATEGORY_META[category] ?? FALLBACK_CATEGORY;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 999, background: m.bg, border: `1px solid ${m.bd}`, color: m.fg, fontSize: 11.5, fontWeight: 700 }}>
      <span style={{ fontSize: 10 }}>{m.ico}</span>{category}
    </span>
  );
}

function OKRItem({ okr }: { okr: OKR }) {
  const s = STATUS[okr.status];
  const barColor = okr.progress >= 70 ? "#2F9E5E" : okr.progress >= 40 ? "#3B5BDB" : "#D98023";
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
        <CategoryBadge category={okr.category} />
        <span className="mono" style={{ padding: "3px 10px", borderRadius: 999, background: "var(--page-bg)", border: "1px solid #E1E5EF", color: "#5B6685", fontSize: 11.5, fontWeight: 600 }}>KR · {okr.format}</span>
        <span style={{ padding: "3px 10px", borderRadius: 999, background: s.bg, border: `1px solid ${s.bd}`, color: s.fg, fontSize: 11.5, fontWeight: 600 }}>{s.label}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "baseline", gap: 5, padding: "3px 11px", borderRadius: 8, background: "#F4F6FB", border: "1px solid #E8ECF5" }}>
          <span style={{ fontSize: 10, color: "#7C87A4", fontWeight: 600 }}>가중치</span>
          <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{okr.weight}%</span>
        </span>
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

function AICoachingCard({ onOpen }: { onOpen: () => void }) {
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
      <button onClick={onOpen} style={{ background: "#fff", color: "#0A1F17", border: "none", borderRadius: 10, width: "100%", padding: 12, fontSize: 13.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
        ✨ 더 자세한 코칭 받기
      </button>
    </div>
  );
}

export default function R1HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [okrs, setOkrs] = useState<OKR[]>(r1Okrs);
  const [loading, setLoading] = useState(true);
  const [wizard, setWizard] = useState<WizardState | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return; // RoleShell이 리다이렉트
    setUser(u);
    setWizard(loadWizard(u.id));
    getR1Okrs(u.id)
      .then((o) => o && setOkrs(o))
      .finally(() => setLoading(false));
  }, []);

  const dday = Math.max(0, Math.ceil((DEADLINE.getTime() - Date.now()) / 86_400_000));
  const totalWeight = okrs.reduce((a, o) => a + o.weight, 0);
  const avgProgress = okrs.length ? Math.round(okrs.reduce((a, o) => a + o.progress, 0) / okrs.length) : 0;
  const activeCount = okrs.filter((o) => o.status === "approved" || o.status === "submitted").length;
  const draftCount = okrs.filter((o) => o.status === "draft").length;

  const wizardStep = wizard?.step ?? 0;
  const wizardSubmitted = wizard?.submitted ?? false;
  const name = user?.name ?? "";

  return (
    <RoleShell role="R1" title="피평가자 홈" subtitle={user ? `${user.name} · ${user.dept} · ${user.team}` : ""}>
      {/* Greeting + 마감 요약카드 (마감 안내는 이 카드 한 곳으로 통일) */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 20, marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · OKR 등록 진행 중</div>
          <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>안녕하세요, {name} 님 👋</h1>
          <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#5B6685" }}>
            {draftCount > 0 ? `KR ${okrs.length}개 중 ${draftCount}개는 아직 작성 중이네요.` : `KR ${okrs.length}개가 진행 중이에요.`}
          </p>
        </div>
        <div style={{ flexShrink: 0, display: "flex", alignItems: "center", gap: 14, padding: "14px 20px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, boxShadow: "var(--shadow-xs)" }}>
          <div style={{ width: 46, height: 46, borderRadius: 12, background: dday <= 7 ? "#FFF0F0" : "#EFF4FE", color: dday <= 7 ? "#D14343" : "#2B5DD9", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, opacity: 0.8 }}>D-</span>
            <span className="mono" style={{ fontSize: 18, fontWeight: 800 }}>{dday}</span>
          </div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>OKR 등록 마감</div>
            <div className="mono" style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>
              {DEADLINE.getFullYear()}-{String(DEADLINE.getMonth() + 1).padStart(2, "0")}-{String(DEADLINE.getDate()).padStart(2, "0")} 18:00 까지
            </div>
          </div>
        </div>
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
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.3, marginBottom: 4 }}>
            {wizardSubmitted ? "제출 완료! 검토 결과를 기다리는 중이에요" : "이번 반기 OKR을 작성해볼까요?"}
          </div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>
            8단계 위저드로 KR을 정제하고 AI 코칭과 함께 완성해요 · <b>{wizardSubmitted ? "제출됨" : `${wizardStep}/8 단계 진행 중`}</b>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#fff", color: "#2C49B8", padding: "14px 22px", borderRadius: 12, fontSize: 14.5, fontWeight: 800, flexShrink: 0 }}>
          {wizardSubmitted ? "제출 내용 보기" : wizardStep > 0 ? "OKR 이어서 작성" : "OKR 작성 시작"} <span style={{ fontSize: 16 }}>→</span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard icon="🎯" iconBg="#E5EBFB" iconFg="#3B5BDB" label="OKR 평균 달성률" value={String(avgProgress)} unit="%" sub={loading ? "불러오는 중…" : "진행 중"} subTone={avgProgress >= 50 ? "ok" : undefined} />
        <StatCard icon="✓" iconBg="#ECFAF1" iconFg="#2F9E5E" label="나의 핵심결과" value={String(activeCount)} unit={`/ ${okrs.length}`} sub="승인·제출됨" />
        <StatCard icon="⚖️" iconBg="#FFEDE2" iconFg="#E07A3C" label="가중치 합산" value={String(totalWeight)} unit="/ 110" sub="상한 기준" />
        <StatCard icon="✨" iconBg="#F0E9FB" iconFg="#7C4DD9" label="AI 코칭 제안" value="3" unit="건" sub="새로운 제안" subTone="ok" />
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 0 }}>
          <div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>나의 OKR</div>
            <div style={{ fontSize: 12.5, color: "#7C87A4", marginTop: 3 }}>
              2026 하반기 · 총 {okrs.length}개 · 가중치 {totalWeight} / 110{loading && " · 불러오는 중…"}
            </div>
          </div>
          {okrs.map((o, i) => <OKRItem key={o.dbId ?? i} okr={o} />)}
        </div>
        <div><AICoachingCard onOpen={() => router.push("/r1/coaching")} /></div>
      </div>

      <div style={{ marginTop: 28, padding: "14px 18px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, display: "flex", alignItems: "center", gap: 10, fontSize: 12.5, color: "#5B6685", lineHeight: 1.55 }}>
        <span style={{ fontSize: 16 }}>💡</span>
        AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
      </div>
    </RoleShell>
  );
}
