"use client";

import { useState } from "react";
import Link from "next/link";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { Step0 } from "./_steps/Step0";
import { Step1 } from "./_steps/Step1";
import { Step2 } from "./_steps/Step2";
import { Step3 } from "./_steps/Step3";
import { Step4 } from "./_steps/Step4";
import { Step5 } from "./_steps/Step5";
import { Step6 } from "./_steps/Step6";
import { Step7 } from "./_steps/Step7";

// ── 8단계 정의 (WizardShared.jsx 기준) ──
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
  "Claude·GPT·Gemini 3개 AI의 검토 결과를 나란히 비교하고 채택할 의견을 골라요.",
  "인라인 편집으로 최종 수정하고, 채택한 AI 의견을 반영해 평가자에게 제출해요.",
];

// ── STEP 헤더 (8 dot progress) ──
function StepHeader({ current, onJump }: { current: number; onJump: (n: number) => void }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 4, overflowX: "auto" }}>
      {STEPS.map((s, i) => {
        const done = s.num < current;
        const cur = s.num === current;
        const next = s.num > current;
        return (
          <div key={s.num} style={{ display: "contents" }}>
            <button
              onClick={() => !next && onJump(s.num)}
              title={`STEP ${s.num} · ${s.label}`}
              style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0, padding: cur ? "5px 11px 5px 5px" : 5, background: cur ? "#F1F4FD" : "transparent", borderRadius: 10, border: "none", cursor: next ? "default" : "pointer", opacity: next ? 0.55 : 1, fontFamily: "var(--font-sans)" }}
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

export default function R1WritePage() {
  const [step, setStep] = useState(0);
  const [type, setType] = useState("ops");

  function submit() {
    alert("OKR이 정태영 팀장에게 제출되었습니다! 🎉 (프로토타입)");
  }

  return (
    <RoleShell role="R1" title="OKR 작성" subtitle="정태영 · 2026 하반기 · 8단계 위저드">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "#5B6685" }}>
        <Link href="/r1" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><span>←</span> 피평가자 홈</Link>
        <span style={{ color: "#C8CFDF" }}>/</span>
        <span style={{ color: "#0F1A36", fontWeight: 600 }}>OKR 작성</span>
      </div>

      <StepHeader current={step} onJump={setStep} />
      {step !== 5 && <Hero num={step} title={STEPS[step].label} desc={DESC[step]} />}

      {step === 0 && <Step0 />}
      {step === 1 && <Step1 type={type} setType={setType} />}
      {step === 2 && <Step2 />}
      {step === 3 && <Step3 />}
      {step === 4 && <Step4 />}
      {step === 5 && <Step5 />}
      {step === 6 && <Step6 />}
      {step === 7 && <Step7 onSubmit={submit} />}

      {/* Nav */}
      <div style={{ marginTop: 22, padding: "16px 22px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "var(--shadow-xs)" }}>
        <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))}>← {step === 0 ? "홈으로" : `이전 (STEP ${step - 1})`}</Button>
        <div style={{ flex: 1 }} />
        <div style={{ fontSize: 12, color: "#7C87A4", display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }} />임시 저장됨 · 방금 전</div>
        <Button variant="secondary" onClick={() => alert("임시 저장되었습니다 🙂")}>임시 저장</Button>
        {step < 7 ? (
          <Button variant="primary" onClick={() => setStep((s) => Math.min(7, s + 1))}>다음 (STEP {step + 1}) →</Button>
        ) : (
          <Button variant="primary" onClick={submit}>제출하기 →</Button>
        )}
      </div>

      <div style={{ marginTop: 18, padding: "12px 16px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#5B6685" }}>
        <span style={{ fontSize: 14 }}>💡</span>
        AI 코칭은 참고용 신호입니다. 평가에 직접 반영되지 않으며, 더 좋은 KR을 함께 만들기 위한 제안이에요.
      </div>
    </RoleShell>
  );
}
