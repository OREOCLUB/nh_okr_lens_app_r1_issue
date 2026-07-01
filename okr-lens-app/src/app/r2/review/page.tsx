"use client";

import { useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { members, type Member } from "@/lib/mockData";

const STATUS_CFG: Record<Member["status"], { label: string; bg: string; fg: string }> = {
  pending: { label: "결재 요청", bg: "#FFF0F0", fg: "#D14343" },
  rejected: { label: "반려", bg: "#FFF7EC", fg: "#D98023" },
  adjustment: { label: "조정", bg: "#FFFAE7", fg: "#C29017" },
  draft: { label: "작성 중", bg: "#F1F3F8", fg: "#5B6685" },
  approved: { label: "승인", bg: "#ECFAF1", fg: "#2F9E5E" },
};

// 브랜드 톤: fail = "코칭 후보" (원본 "위반"에서 변경)
const VERDICTS: Record<string, { bg: string; bd: string; fg: string; ico: string; label: string }> = {
  pass: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", ico: "✓", label: "통과" },
  warn: { bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023", ico: "!", label: "주의" },
  fail: { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", ico: "○", label: "코칭 후보" },
};

interface Check { no: number; text: string; verdict: "pass" | "warn" | "fail"; reason?: string; edited?: boolean }

const INITIAL_CHECKS: Check[] = [
  { no: 1, text: "수치로 측정 가능한가?", verdict: "pass" },
  { no: 2, text: "외부 의존성 없이 통제 가능한가?", verdict: "pass" },
  { no: 3, text: "유지형이 아닌 도전적인 목표인가?", verdict: "pass", reason: "재상신 시 baseline·target 명시되어 도전성 확보됨", edited: true },
  { no: 4, text: "시간 내 현실적으로 달성 가능한가?", verdict: "warn", reason: "6개월 내 41% 개선은 도전적 — 분기 마일스톤 권장" },
  { no: 5, text: "명확한 언어인가?", verdict: "pass" },
  { no: 6, text: "타 팀 KR과 겹치지 않는가?", verdict: "pass" },
  { no: 7, text: "신기술/새 도구에 과도히 의존하지 않는가?", verdict: "pass" },
  { no: 8, text: "단순 건수형이 아닌 질적 지표인가?", verdict: "pass" },
  { no: 9, text: "평가자가 확인 가능한 증거가 있는가?", verdict: "fail", reason: "APM 캡처·리포트 첨부가 필요해요" },
];

function CheckItem({ check, onChange }: { check: Check; onChange: (v: Check["verdict"]) => void }) {
  const v = VERDICTS[check.verdict];
  return (
    <div style={{ padding: "11px 14px", background: "#fff", border: `1px solid ${check.edited ? "#FFE0BA" : "#ECEFF5"}`, borderRadius: 10, display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, background: v.bg, color: v.fg, border: `1px solid ${v.bd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{v.ico}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: check.reason ? 4 : 0, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "#A4ADC4", fontWeight: 600 }}>{check.no.toString().padStart(2, "0")}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{check.text}</span>
          {check.edited && <span style={{ fontSize: 10, color: "#D98023", fontWeight: 600 }}>✏️ 수정됨</span>}
        </div>
        {check.reason && <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.5 }}>{check.reason}</div>}
      </div>
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {(["pass", "warn", "fail"] as const).map((k) => {
          const vv = VERDICTS[k];
          const active = check.verdict === k;
          return (
            <button key={k} onClick={() => onChange(k)} title={vv.label} style={{ width: 26, height: 26, borderRadius: 6, background: active ? vv.bg : "#fff", border: `1px solid ${active ? vv.bd : "#E1E5EF"}`, color: active ? vv.fg : "#A4ADC4", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{vv.ico}</button>
          );
        })}
      </div>
    </div>
  );
}

export default function R2ReviewPage() {
  const reviewMembers = members.filter((m) => ["pending", "rejected", "adjustment"].includes(m.status));
  const [selectedId, setSelectedId] = useState(reviewMembers[0]?.id ?? members[0].id);
  const [checks, setChecks] = useState(INITIAL_CHECKS);
  const [verdict, setVerdict] = useState<"approve" | "adjust" | "reject">("adjust");

  const violations = checks.filter((c) => c.verdict === "fail").length;
  const warns = checks.filter((c) => c.verdict === "warn").length;
  const risk = violations >= 4 ? { fg: "#D14343", ico: "🔴", label: "상" } : violations >= 2 ? { fg: "#D98023", ico: "🟡", label: "중" } : { fg: "#2F9E5E", ico: "🟢", label: "하" };

  function updateCheck(i: number, v: Check["verdict"]) {
    setChecks((cs) => cs.map((c, idx) => (idx === i ? { ...c, verdict: v, edited: true } : c)));
  }

  return (
    <RoleShell role="R2" title="OKR 검토" subtitle="박정훈 팀장 · 결재요청 4건 / 반려 2건 / 조정 1건">
      <div style={{ display: "flex", height: "calc(100vh - var(--topbar-h) - 96px)", minHeight: 560, border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        {/* Left — member list */}
        <div style={{ width: 260, minWidth: 260, borderRight: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>검토 대상</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>{reviewMembers.length}명 · 결재요청 우선</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {reviewMembers.map((m) => {
              const sc = STATUS_CFG[m.status];
              const sel = selectedId === m.id;
              return (
                <div key={m.id} onClick={() => setSelectedId(m.id)} style={{ padding: "11px 14px", background: sel ? "#F1F4FD" : "transparent", borderLeft: m.focus ? "3px solid #D98023" : sel ? "3px solid #3B5BDB" : "3px solid transparent", borderBottom: "1px solid #ECEFF5", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.focus ? "#FFF7EC" : "#E5EBFB", color: m.focus ? "#D98023" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{m.name[0]}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      {m.focus && <span style={{ fontSize: 11 }}>🎯</span>}
                      <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{m.name}</span>
                      <span className="mono" style={{ fontSize: 10.5, color: "#A4ADC4", fontWeight: 500 }}>{m.grade}·{m.series}</span>
                    </div>
                    <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.group} · {m.submitDate || "—"}</div>
                  </div>
                  <span style={{ padding: "2px 7px", borderRadius: 999, background: sc.bg, color: sc.fg, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{sc.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center — KR detail + AI Validation */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FFF7EC", color: "#D98023", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>강</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>🎯 강동우</h2>
                <span className="mono" style={{ fontSize: 12, color: "#7C87A4" }}>차장 · SE</span>
                <span style={{ padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", border: "1px solid #FFE0BA", color: "#D98023", fontSize: 11, fontWeight: 600 }}>재상신 · 2차 검토</span>
              </div>
              <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 3 }}>운영본부 · 결제플랫폼팀 · 시운영 · 제출일 05/24</div>
            </div>
            <Button variant="secondary" size="sm" leftIcon={<span>📂</span>} onClick={() => alert("작년 OKR 보기는 준비 중이에요 🙂")}>작년 OKR 보기</Button>
          </div>

          {/* KR card */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "18px 20px", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="mono" style={{ fontSize: 11.5, color: "#7C87A4" }}>KR_2026_002</span>
              <span style={{ padding: "2px 9px", borderRadius: 999, background: "#E5EBFB", color: "#213A8C", fontSize: 11, fontWeight: 600 }}>난이도 · 중</span>
              <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "var(--page-bg)", color: "#5B6685", fontSize: 11, fontWeight: 600 }}>KR · 수치</span>
              <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "#7C87A4" }}>가중치 30%</span>
            </div>
            <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 4 }}>Objective · 핵심 서비스 응답속도 개선</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0F1A36", lineHeight: 1.55, marginBottom: 14, letterSpacing: "-0.01em" }}>결제 게이트웨이 APM p95 응답속도를 850ms → 500ms로 단축한다.</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingTop: 12, borderTop: "1px solid #ECEFF5" }}>
              {[["측정 방법", "APM p95 월평균"], ["Baseline → Goal", "850ms → 500ms"], ["실행 계획", "3건 · 캐시·인덱스·튜닝"]].map(([l, val]) => (
                <div key={l}><div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500 }}>{val}</div></div>
              ))}
            </div>
          </div>

          {/* AI Validation */}
          <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 40%)", border: "1px solid #B9F1D8", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>AI Validation · 9항목 자동 검토</div>
                <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 2 }}>
                  위험도 <b style={{ color: risk.fg }}>{risk.ico} {risk.label}</b> · 코칭 후보 <b style={{ color: "#D14343" }}>{violations}건</b> · 주의 <b style={{ color: "#D98023" }}>{warns}건</b>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={() => setChecks((cs) => cs.map((c) => ({ ...c, edited: false })))}>🔄 AI 재검토</Button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {checks.map((c, i) => <CheckItem key={c.no} check={c} onChange={(v) => updateCheck(i, v)} />)}
            </div>
          </div>
        </div>

        {/* Right — actions */}
        <div style={{ width: 300, minWidth: 300, borderLeft: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>검토 처리</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>의견을 작성하고 처리해주세요.</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#3A4565", marginBottom: 8 }}>처리 방향</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {[
                  { key: "approve", label: "✓ 승인", desc: "KR이 충분히 정제되었어요", color: "#2F9E5E", bg: "#ECFAF1" },
                  { key: "adjust", label: "↻ 조정 요청", desc: "함께 보완할 부분이 있어요", color: "#D98023", bg: "#FFF7EC" },
                  { key: "reject", label: "↩ 반려", desc: "전체 재작성이 필요해요", color: "#D14343", bg: "#FFF0F0" },
                ].map((v) => {
                  const active = verdict === v.key;
                  return (
                    <div key={v.key} onClick={() => setVerdict(v.key as typeof verdict)} style={{ padding: "11px 13px", background: active ? v.bg : "#fff", border: `1.5px solid ${active ? v.color : "#E1E5EF"}`, borderRadius: 10, cursor: "pointer" }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? v.color : "#0F1A36" }}>{v.label}</div>
                      <div style={{ fontSize: 11.5, color: active ? v.color : "#7C87A4", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {verdict !== "approve" && (
              <div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#3A4565", marginBottom: 6 }}>{verdict === "reject" ? "조정 의견" : "조정 요청 메시지"}</div>
                <textarea defaultValue={"강동우 님, 재상신해주신 부분 잘 확인했어요. 두 가지만 함께 보완해볼까요?\n\n1. APM 캡처·리포트를 주간 코칭 메모에 첨부해주세요\n2. 6개월 41% 개선은 도전적이에요. 분기 마일스톤을 추가하면 진행 점검이 수월할 거예요.\n\n화요일 1on1에서 함께 정리해요 :)"} style={{ width: "100%", minHeight: 130, padding: "10px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36", outline: "none", resize: "vertical", lineHeight: 1.55 }} />
              </div>
            )}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid #ECEFF5", display: "flex", flexDirection: "column", gap: 8 }}>
            <Button variant="primary" fullWidth style={{ padding: 12 }} onClick={() => alert(`처리되었습니다: ${verdict === "approve" ? "승인" : verdict === "reject" ? "반려" : "조정요청"} (프로토타입)`)}>
              {verdict === "approve" ? "승인하기" : verdict === "reject" ? "반려 보내기" : "조정요청 보내기"} →
            </Button>
            <Button variant="ghost" fullWidth style={{ padding: 9, fontSize: 12 }} onClick={() => alert("임시 저장되었습니다 🙂")}>임시 저장 후 다음 팀원 →</Button>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
