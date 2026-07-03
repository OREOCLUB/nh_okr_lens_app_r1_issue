"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { getCurrentUser, type Session } from "@/lib/auth";
import { evalSystem, taxonomy, checklist } from "@/lib/criteria";
import { getCriteria, submitOkrs, type CriteriaData } from "@/lib/dataAccess";
import {
  loadWizard,
  saveWizard,
  stepBlocker,
  weightSum,
  type WizardState,
} from "@/lib/wizard";
import { Step0 } from "./_steps/Step0";
import { Step1 } from "./_steps/Step1";
import { Step2 } from "./_steps/Step2";
import { Step3 } from "./_steps/Step3";
import { Step4 } from "./_steps/Step4";
import { Step5 } from "./_steps/Step5";
import { Step6 } from "./_steps/Step6";
import { Step7 } from "./_steps/Step7";

// ── 8단계 정의 ──
const STEPS = [
  { num: 0, label: "프로필 세팅" },
  { num: 1, label: "OKR 유형" },
  { num: 2, label: "기초 정보" },
  { num: 3, label: "AI 정제 대화" },
  { num: 4, label: "KR 형태" },
  { num: 5, label: "상세 수립" },
  { num: 6, label: "AI 비교 검토" },
  { num: 7, label: "최종 수정·제출" },
];

const DESC = [
  "OKR 작성 진입 전 프로필을 입력·확인해요. 이 정보가 STEP 2 우측 패널과 STEP 3 객관성 검증에 연결됩니다.",
  "이번 분기 OKR의 성격을 선택하면, AI가 더 적절한 가이드를 드려요.",
  "대화형 또는 직접 작성 중 편한 방식으로 기초 정보를 입력하세요. AI가 핵심 키워드를 정리해 드려요.",
  "AI와 대화하며 KR의 객관성·주관성을 검증하고 표현을 함께 다듬어요.",
  "각 KR에 가장 잘 맞는 측정 형태를 4가지 중에서 골라주세요.",
  "각 KR의 측정 방법과 S/A/B/C/D 등급 기준을 정해요.",
  "AI 검토 결과를 나란히 비교하고 채택할 의견을 골라요.",
  "인라인 편집으로 최종 수정하고, 채택한 AI 의견을 반영해 평가자에게 제출해요.",
];

// ── STEP 헤더 (8 dot progress) ──
function StepHeader({ current, maxStep, onJump }: { current: number; maxStep: number; onJump: (n: number) => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
      {STEPS.map((s, i) => {
        const done = s.num < current;
        const cur = s.num === current;
        const locked = s.num > maxStep;
        return (
          <div key={s.num} style={{ display: "contents" }}>
            <button
              onClick={() => !locked && onJump(s.num)}
              title={`STEP ${s.num} · ${s.label}`}
              style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, padding: cur ? "5px 11px 5px 5px" : 5, background: cur ? "#F1F4FD" : "transparent", borderRadius: 10, border: "none", cursor: locked ? "default" : "pointer", opacity: locked ? 0.55 : 1, fontFamily: "var(--font-sans)" }}
            >
              <div className="mono" style={{ width: 28, height: 28, borderRadius: "50%", background: cur ? "#3B5BDB" : done ? "#ECFAF1" : "var(--page-bg)", color: cur ? "#fff" : done ? "#2F9E5E" : "#7C87A4", border: cur ? "none" : done ? "1px solid #BBE9CC" : "1px solid #E1E5EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11.5, fontWeight: 700, flexShrink: 0 }}>{done ? "✓" : s.num}</div>
              {cur && <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36", whiteSpace: "nowrap" }}>STEP {s.num} · {s.label}</div>}
            </button>
            {i < STEPS.length - 1 && <div style={{ flex: 1, minWidth: 8, height: 2, background: done ? "#BBE9CC" : "#ECEFF5", borderRadius: 1 }} />}
          </div>
        );
      })}
    </div>
  );
}

function Hero({ num, title, desc }: { num: number; title: string; desc: string }) {
  return (
    <div style={{ marginBottom: 22 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>STEP {num} / 7</div>
      <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>{title}</h1>
      <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.55, maxWidth: 720 }}>{desc}</p>
    </div>
  );
}

function savedAgo(savedAt: number | null): string {
  if (!savedAt) return "아직 저장 전";
  const sec = Math.floor((Date.now() - savedAt) / 1000);
  if (sec < 10) return "방금 전";
  if (sec < 60) return `${sec}초 전`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;
  return `${Math.floor(min / 60)}시간 전`;
}

export default function R1WritePage() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [state, setState] = useState<WizardState | null>(null);
  const [criteria, setCriteria] = useState<CriteriaData>({ system: evalSystem, taxonomy, checklist });
  const [notice, setNotice] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const userIdRef = useRef<string>("");

  // 세션 사용자 + 저장된 위저드 상태 복원 (RoleShell이 인증·역할 가드)
  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    userIdRef.current = u.id;
    setState(loadWizard(u.id));
    // 평가 기준은 DB(criteria_*)가 단일 소스 — 실패 시 lib/criteria 폴백 유지
    getCriteria().then((c) => c && setCriteria(c));
  }, []);

  // 상태 변경 시 자동 임시 저장 (localStorage)
  const set = useCallback((fn: (s: WizardState) => WizardState) => {
    setState((prev) => {
      if (!prev) return prev;
      return saveWizard(userIdRef.current, fn(prev));
    });
  }, []);

  const step = state?.step ?? 0;

  const goTo = useCallback(
    (n: number) => {
      setNotice(null);
      set((s) => ({ ...s, step: n, maxStep: Math.max(s.maxStep, n) }));
    },
    [set]
  );

  function next() {
    if (!state) return;
    const blocker = stepBlocker(state, step);
    if (blocker) {
      setNotice(blocker);
      return;
    }
    goTo(Math.min(7, step + 1));
  }

  function prev() {
    if (step === 0) router.push("/r1");
    else goTo(step - 1);
  }

  function saveNow() {
    set((s) => s);
    setNotice("임시 저장했어요. 언제든 이어서 작성할 수 있어요 🙂");
  }

  const evaluatorName = "박정훈"; // 결제플랫폼팀 평가자 (프로토타입 — P2에서 결재라인 연동)

  async function submit() {
    if (!state || !user || submitting) return;
    // 최종 검증 — 전 스텝 블로커 + 가중치 상한 (기준은 criteria에서)
    for (const n of [0, 2, 4, 5]) {
      const blocker = stepBlocker(state, n);
      if (blocker) {
        setNotice(`STEP ${n}을 먼저 완성해주세요 — ${blocker}`);
        goTo(n);
        return;
      }
    }
    const sum = weightSum(state.krs);
    if (sum > criteria.system.scoreCap) {
      setNotice(`KR 가중치 합이 ${sum}%예요. 상한 ${criteria.system.scoreCap}% 이하로 조정해주세요.`);
      return;
    }
    const { min, max } = criteria.system.krRange;
    const countHint = state.krs.length < min || state.krs.length > max ? `\n(참고: 운영안 권장 KR 개수는 ${min}~${max}개예요 — 현재 ${state.krs.length}개)` : "";
    if (!window.confirm(`${evaluatorName} 팀장에게 OKR ${state.krs.length}건을 제출할까요?${countHint}\n제출 후에도 조정 요청 시 수정할 수 있어요.`)) return;

    setSubmitting(true);
    setNotice(null);
    try {
      const result = await submitOkrs(
        user.id,
        state.krs.map((k) => ({
          obj: `Objective · ${k.objective}`,
          kr: k.kr,
          format: k.format,
          baseline: k.baseline,
          goal: k.goal,
          weight: k.weight,
        }))
      );
      set((s) => ({ ...s, submitted: true }));
      if (result.saved === "db") {
        window.alert(`OKR이 ${evaluatorName} 팀장에게 제출되었어요! 🎉`);
      } else {
        window.alert(`제출 내용을 이 브라우저에 안전하게 보관했어요 🙂\n(서버 연결 후 자동 반영 예정 — ${result.reason})`);
      }
      router.push("/r1");
    } catch (e) {
      setNotice(`제출 중 연결이 원활하지 않았어요. 내용은 임시 저장되어 있으니 잠시 후 다시 시도해주세요. (${e instanceof Error ? e.message : "unknown"})`);
    } finally {
      setSubmitting(false);
    }
  }

  const subtitle = useMemo(
    () => (user ? `${user.name} · 2026 하반기 · 8단계 위저드` : "2026 하반기 · 8단계 위저드"),
    [user]
  );

  if (!state || !user) {
    return (
      <RoleShell role="R1" title="OKR 작성" subtitle="불러오는 중…">
        <div style={{ padding: 60, textAlign: "center", color: "#7C87A4", fontSize: 14 }}>작성 내용을 불러오는 중이에요…</div>
      </RoleShell>
    );
  }

  return (
    <RoleShell role="R1" title="OKR 작성" subtitle={subtitle}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "#5B6685" }}>
        <Link href="/r1" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><span>←</span> 피평가자 홈</Link>
        <span style={{ color: "#C8CFDF" }}>/</span>
        <span style={{ color: "#0F1A36", fontWeight: 600 }}>OKR 작성</span>
      </div>

      <StepHeader current={step} maxStep={state.maxStep} onJump={goTo} />
      {step !== 5 && <Hero num={step} title={STEPS[step].label} desc={DESC[step]} />}

      {notice && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#7A4A14", lineHeight: 1.55 }}>
          <span style={{ fontSize: 15 }}>💡</span>
          <div style={{ flex: 1, whiteSpace: "pre-line" }}>{notice}</div>
          <button onClick={() => setNotice(null)} style={{ border: "none", background: "transparent", color: "#B98A4E", cursor: "pointer", fontSize: 15, lineHeight: 1 }}>×</button>
        </div>
      )}

      {step === 0 && <Step0 state={state} set={set} user={user} />}
      {step === 1 && <Step1 state={state} set={set} criteria={criteria} />}
      {step === 2 && <Step2 state={state} set={set} user={user} criteria={criteria} />}
      {step === 3 && <Step3 state={state} set={set} user={user} criteria={criteria} />}
      {step === 4 && <Step4 state={state} set={set} />}
      {step === 5 && <Step5 state={state} set={set} />}
      {step === 6 && <Step6 state={state} set={set} />}
      {step === 7 && <Step7 state={state} set={set} criteria={criteria} evaluatorName={evaluatorName} onSubmit={submit} submitting={submitting} onGoStep={goTo} />}

      {/* Nav */}
      <div style={{ marginTop: 22, padding: "16px 22px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
        <Button variant="ghost" onClick={prev}>← {step === 0 ? "홈으로" : `이전 (STEP ${step - 1})`}</Button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: "#7C87A4", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: state.savedAt ? "#2F9E5E" : "#C8CFDF" }} />
          {state.savedAt ? `임시 저장됨 · ${savedAgo(state.savedAt)}` : "아직 저장 전"}
        </div>
        <Button variant="secondary" onClick={saveNow}>임시 저장</Button>
        {step < 7 ? (
          <Button variant="primary" onClick={next}>다음 (STEP {step + 1}) →</Button>
        ) : (
          <Button variant="primary" onClick={submit} disabled={submitting}>{submitting ? "제출 중…" : "제출하기 →"}</Button>
        )}
      </div>

      <div style={{ marginTop: 18, padding: "12px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#5B6685" }}>
        <span style={{ fontSize: 14 }}>💡</span>
        AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
      </div>
    </RoleShell>
  );
}
