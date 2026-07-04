"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { useToast } from "@/components/Toast";
import { getCurrentUser, type Session } from "@/lib/auth";
import { evalSystem, taxonomy, checklist } from "@/lib/criteria";
import { getCriteria, submitOkrs, recallOkrs, type CriteriaData } from "@/lib/dataAccess";
import {
  loadWizard,
  saveWizard,
  stepBlocker,
  anyDirty,
  commitDrafts,
  submitReadiness,
  writePeriodOver,
  WRITE_DEADLINE,
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
  const [submitting, setSubmitting] = useState(false);
  const [recalling, setRecalling] = useState(false);
  const [step6Focus, setStep6Focus] = useState<string | null>(null);
  const { showToast, toastNode } = useToast();
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

  // 스텝이 바뀌면 항상 화면 맨 위로 (RoleShell의 main이 스크롤 컨테이너)
  useEffect(() => {
    document.querySelector("main")?.scrollTo({ top: 0 });
    window.scrollTo({ top: 0 });
  }, [step]);

  // 스텝 이동 — 모든 이동에 안내 토스트 (순차 진행은 "넘어갈게요", 점프·복귀는 "다녀올게요")
  function goTo(n: number, opts?: { silent?: boolean }) {
    if (!opts?.silent && n !== step) {
      const forward = n === step + 1;
      showToast(
        forward
          ? `STEP ${n} · ${STEPS[n].label}(으)로 넘어갈게요!`
          : `잠시 STEP ${n} · ${STEPS[n].label}(으)로 다녀올게요!`,
        "info"
      );
    }
    set((s) => ({ ...s, step: n, maxStep: Math.max(s.maxStep, n) }));
  }

  function next() {
    if (!state) return;
    let effective = state;

    // STEP 5·7: 확정하지 않은 변경이 있으면 일괄 확정 여부 확인 후 진행
    if (step === 5 || step === 7) {
      const dirtyKrs = state.krs.filter(anyDirty);
      if (dirtyKrs.length > 0) {
        const names = dirtyKrs.map((k) => `KR ${String(k.num).padStart(2, "0")}`).join(", ");
        const ok = window.confirm(`${names}에 확정하지 않은 변경이 있어요.\n전부 확정 처리하고 다음으로 넘어갈까요?`);
        if (!ok) return;
        effective = { ...state, krs: state.krs.map(commitDrafts) };
        set(() => effective);
        showToast(`${names}의 변경 내용을 확정했어요 ✓`, "success");
      }
    }

    const blocker = stepBlocker(effective, step);
    if (blocker) {
      showToast(blocker, "warn");
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
    showToast("임시 저장했어요. 언제든 이어서 작성할 수 있어요 🙂", "success");
  }

  // 확인 다이얼로그를 거치는 스텝 이동 — 현재 위치·목적지·임시저장 안내 후 이동 (STEP 2 편집 등)
  function confirmGo(n: number) {
    if (!state) return;
    const ok = window.confirm(
      `지금은 STEP ${step} · ${STEPS[step].label} 단계예요.\nSTEP ${n} · ${STEPS[n].label}(으)로 이동할게요.\n현재 입력 내용은 임시저장해둘게요.\n\n이동할까요?`
    );
    if (!ok) return;
    set((s) => s); // 이동 전 임시저장 (saveWizard 경유)
    showToast(`임시 저장 완료! 잠시 STEP ${n} · ${STEPS[n].label}(으)로 다녀올게요!`, "success");
    goTo(n, { silent: true });
  }

  // STEP 7 미채택 KR → STEP 6 해당 KR 탭 바로 열기
  function pickKrInStep6(krId: string) {
    setStep6Focus(krId);
    const num = state?.krs.find((k) => k.id === krId)?.num;
    set((s) => ({ ...s, step: 6, maxStep: Math.max(s.maxStep, 6) }));
    showToast(`잠시 STEP 6 · AI 비교 검토로 다녀올게요! KR ${String(num ?? "").padStart(2, "0")}을 열었어요.`, "info");
  }

  const evaluatorName = "박정훈"; // 결제플랫폼팀 평가자 (프로토타입 — P2에서 결재라인 연동)
  const periodOver = writePeriodOver(); // 수립 기간 경과 시 작성·제출·회수 전부 잠금
  const locked = (state?.submitted ?? false) || periodOver;

  async function submit() {
    if (!state || !user || submitting) return;
    if (periodOver) {
      showToast("OKR 수립 기간이 종료되어 제출할 수 없어요. 인사담당자에게 문의해주세요.", "warn");
      return;
    }
    if (state.submitted) {
      showToast("이미 제출된 OKR이에요. 수정하려면 먼저 회수해주세요.", "warn");
      return;
    }
    // 최종 검증 ① — 프로필·기초정보 블로커
    for (const n of [0, 2]) {
      const blocker = stepBlocker(state, n);
      if (blocker) {
        showToast(`STEP ${n}을 먼저 완성해주세요 — ${blocker}`, "warn");
        goTo(n, { silent: true });
        return;
      }
    }
    // 최종 검증 ② — 확정하지 않은 변경이 있으면 일괄 확정 여부 확인 (거절 시 제출 중단)
    let effective = state;
    const dirtyKrs = state.krs.filter(anyDirty);
    if (dirtyKrs.length > 0) {
      const names = dirtyKrs.map((k) => `KR ${String(k.num).padStart(2, "0")}`).join(", ");
      const ok = window.confirm(`${names}에 확정하지 않은 변경이 있어요.\n전부 확정 처리하고 제출을 진행할까요?`);
      if (!ok) return;
      effective = { ...state, krs: state.krs.map(commitDrafts) };
      set(() => effective);
    }
    // 최종 검증 ③ — 제출 적합성 게이트 (가중치·형태·측정·등급·위험도)
    const readiness = submitReadiness(effective, criteria.system, criteria.checklist);
    if (!readiness.ok) {
      const fails = readiness.items.filter((i) => !i.pass);
      showToast(`제출 전에 보완이 필요해요:\n${fails.map((f) => `· ${f.label} — ${f.detail}`).join("\n")}`, "warn");
      return;
    }
    const { min, max } = criteria.system.krRange;
    const countHint = effective.krs.length < min || effective.krs.length > max ? `\n(참고: 운영안 권장 KR 개수는 ${min}~${max}개예요 — 현재 ${effective.krs.length}개)` : "";
    if (!window.confirm(`${evaluatorName} 팀장에게 OKR ${effective.krs.length}건을 제출할까요?${countHint}\n제출 후에도 조정 요청 시 수정할 수 있어요.`)) return;

    setSubmitting(true);
    try {
      const result = await submitOkrs(
        user.id,
        effective.krs.map((k) => ({
          obj: `Objective · ${k.objective}`,
          kr: k.kr,
          format: k.format,
          baseline: k.baseline,
          goal: k.goal,
          weight: k.weight,
        }))
      );
      set((s) => ({ ...s, submitted: true }));
      if (result.ok) {
        window.alert(`OKR이 ${evaluatorName} 팀장에게 제출되었어요! 🎉`);
      } else {
        const reason = result.error === "NO_DB" ? "Supabase 미연결" : result.error;
        window.alert(`제출 내용을 이 브라우저에 안전하게 보관했어요 🙂\n(서버 연결 후 자동 반영 예정 — ${reason})`);
      }
      router.push("/r1");
    } catch (e) {
      showToast(`제출 중 연결이 원활하지 않았어요. 내용은 임시 저장되어 있으니 잠시 후 다시 시도해주세요. (${e instanceof Error ? e.message : "unknown"})`, "warn");
    } finally {
      setSubmitting(false);
    }
  }

  // 제출 회수 — 회수해야 수정·재제출이 가능하다 (수립 기간 내에만)
  async function recall() {
    if (!state || !user || recalling) return;
    if (periodOver) {
      showToast("OKR 수립 기간이 종료되어 회수할 수 없어요. 조정이 필요하면 인사담당자에게 문의해주세요.", "warn");
      return;
    }
    const ok = window.confirm("제출한 OKR을 회수할까요?\n회수하면 다시 수정할 수 있고, 수정을 마친 뒤 재제출하면 돼요.\n(평가자 검토가 시작된 경우 회수 사실이 함께 표시돼요)");
    if (!ok) return;
    setRecalling(true);
    try {
      const result = await recallOkrs(user.id);
      set((s) => ({ ...s, submitted: false }));
      showToast(
        result.ok
          ? "OKR을 회수했어요. 수정 후 다시 제출해주세요 🙂"
          : "OKR을 회수했어요 (서버 연결 후 자동 반영). 수정 후 다시 제출해주세요 🙂",
        "success"
      );
    } finally {
      setRecalling(false);
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

      {toastNode}

      {/* 수립 기간 종료 배너 — 작성·제출·회수 전부 잠금 (조회만) */}
      {periodOver && (
        <div style={{ marginBottom: 16, padding: "16px 20px", background: "linear-gradient(135deg, #F1F3F8, #fff 70%)", border: "1px solid #C8CFDF", borderRadius: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "#5B6685", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>🔒</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#3A4565" }}>OKR 수립 기간이 종료되었어요 (마감 {WRITE_DEADLINE.getFullYear()}-{String(WRITE_DEADLINE.getMonth() + 1).padStart(2, "0")}-{String(WRITE_DEADLINE.getDate()).padStart(2, "0")} 18:00)</div>
            <div style={{ fontSize: 12, color: "#5B6685", marginTop: 3, lineHeight: 1.5 }}>지금은 열람만 가능하고 수정·제출·회수가 잠겨 있어요. 조정이 필요하면 인사담당자에게 문의해주세요.</div>
          </div>
        </div>
      )}

      {/* 제출 완료 잠금 배너 — 회수해야 수정 가능 (수립 기간 내에만) */}
      {!periodOver && state.submitted && (
        <div style={{ marginBottom: 16, padding: "16px 20px", background: "linear-gradient(135deg, #ECFAF1, #fff 70%)", border: "1px solid #BBE9CC", borderRadius: 14, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>✅</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#1F6B45" }}>제출 완료된 OKR이에요 — {evaluatorName} 팀장 검토 대기 중</div>
            <div style={{ fontSize: 12, color: "#2F6B48", marginTop: 3, lineHeight: 1.5 }}>내용은 열람만 가능해요. 수정하려면 회수한 뒤 수정 → 재제출해주세요.</div>
          </div>
          <Button variant="secondary" onClick={recall} disabled={recalling}>{recalling ? "회수 중…" : "↩ 회수하고 수정하기"}</Button>
        </div>
      )}

      {/* 제출 후·기간 종료 후에는 편집 잠금 (열람만) */}
      <div style={locked ? { pointerEvents: "none", opacity: 0.6 } : undefined}>
        {step === 0 && <Step0 state={state} set={set} user={user} />}
        {step === 1 && <Step1 state={state} set={set} criteria={criteria} />}
        {step === 2 && <Step2 state={state} set={set} user={user} criteria={criteria} onGo={confirmGo} />}
        {step === 3 && <Step3 state={state} set={set} user={user} criteria={criteria} />}
        {step === 4 && <Step4 state={state} set={set} />}
        {step === 5 && <Step5 state={state} set={set} />}
        {step === 6 && <Step6 state={state} set={set} focusKrId={step6Focus} />}
        {step === 7 && <Step7 state={state} set={set} criteria={criteria} evaluatorName={evaluatorName} onSubmit={submit} submitting={submitting} onPickKr={pickKrInStep6} />}
      </div>

      {/* Nav */}
      <div style={{ marginTop: 22, padding: "16px 22px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
        <Button variant="ghost" onClick={prev}>← {step === 0 ? "홈으로" : `이전 (STEP ${step - 1})`}</Button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: "#7C87A4", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: state.savedAt ? "#2F9E5E" : "#C8CFDF" }} />
          {state.savedAt ? `임시 저장됨 · ${savedAgo(state.savedAt)}` : "아직 저장 전"}
        </div>
        <Button variant="secondary" onClick={saveNow} disabled={locked}>임시 저장</Button>
        {step < 7 ? (
          <Button variant="primary" onClick={next}>다음 (STEP {step + 1}) →</Button>
        ) : (
          /* 제출 버튼은 STEP 7 제출 패널 하나로 통합 — 여기서는 안내만 */
          <span style={{ fontSize: 12.5, color: "#7C87A4", padding: "0 6px" }}>제출은 위 <b style={{ color: "#3A4565" }}>제출 패널</b>에서 진행해주세요 ↑</span>
        )}
      </div>

    </RoleShell>
  );
}
