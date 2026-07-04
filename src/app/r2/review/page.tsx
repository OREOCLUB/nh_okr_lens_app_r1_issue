"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { members as seedMembers, type Member, type RiskAnalysis } from "@/lib/mockData";
import { checklist as seedChecklist, type CheckItem as CriteriaItem } from "@/lib/criteria";
import {
  getMembers, getCriteria, getMemberOkrs, getMemberHistory, getMemberEvents,
  saveReviewDecision, saveReviewDraft,
  type ReviewOkr, type HistoryOkr, type HistoryEvent, type ReviewDecision,
} from "@/lib/dataAccess";
import { mockMemberOkrs, mockMemberHistory, mockMemberEvents } from "@/lib/mockReview";
import { runValidation, riskOf, draftMessageAI, type ValidationItem } from "@/lib/aiValidation";
import { getCurrentUser } from "@/lib/auth";

const STATUS_CFG: Record<Member["status"], { label: string; bg: string; fg: string }> = {
  pending: { label: "결재 요청", bg: "#FFF0F0", fg: "#D14343" },
  rejected: { label: "반려", bg: "#FFF7EC", fg: "#D98023" },
  adjustment: { label: "조정", bg: "#FFFAE7", fg: "#C29017" },
  draft: { label: "작성 중", bg: "#F1F3F8", fg: "#5B6685" },
  approved: { label: "승인", bg: "#ECFAF1", fg: "#2F9E5E" },
};

// 브랜드 톤: fail = "코칭 후보" (지적성 표현 금지)
const VERDICTS: Record<string, { bg: string; bd: string; fg: string; ico: string; label: string }> = {
  pass: { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E", ico: "✓", label: "통과" },
  warn: { bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023", ico: "!", label: "주의" },
  fail: { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343", ico: "○", label: "코칭 후보" },
};

const RISK_CFG = {
  high: { fg: "#D14343", ico: "🔴", label: "상" },
  mid: { fg: "#D98023", ico: "🟡", label: "중" },
  low: { fg: "#2F9E5E", ico: "🟢", label: "하" },
} as const;

// 검토 대상 상태 우선순위 (결재요청 > 반려 > 조정)
const TARGET_ORDER: Partial<Record<Member["status"], number>> = { pending: 0, rejected: 1, adjustment: 2 };
const isTarget = (m: Member) => m.status in TARGET_ORDER;
const sortTargets = (list: Member[]) =>
  [...list].sort((a, b) => (TARGET_ORDER[a.status] ?? 9) - (TARGET_ORDER[b.status] ?? 9));

function CheckRow({ item, onChange }: { item: ValidationItem; onChange: (v: ValidationItem["verdict"]) => void }) {
  const v = VERDICTS[item.verdict];
  return (
    <div style={{ padding: "11px 14px", background: "#fff", border: `1px solid ${item.edited ? "#FFE0BA" : "#ECEFF5"}`, borderRadius: 10, display: "flex", gap: 11, alignItems: "flex-start" }}>
      <div style={{ width: 24, height: 24, borderRadius: 7, background: v.bg, color: v.fg, border: `1px solid ${v.bd}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{v.ico}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: item.reason ? 4 : 0, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 10.5, color: "#A4ADC4", fontWeight: 600 }}>{item.no.toString().padStart(2, "0")}</span>
          <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{item.text}</span>
          {item.edited && <span style={{ fontSize: 10, color: "#D98023", fontWeight: 600 }}>✏️ 수정됨</span>}
        </div>
        {item.reason && <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.5 }}>{item.reason}</div>}
      </div>
      <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
        {(["pass", "warn", "fail"] as const).map((k) => {
          const vv = VERDICTS[k];
          const active = item.verdict === k;
          return (
            <button key={k} onClick={() => onChange(k)} title={vv.label} style={{ width: 26, height: 26, borderRadius: 6, background: active ? vv.bg : "#fff", border: `1px solid ${active ? vv.bd : "#E1E5EF"}`, color: active ? vv.fg : "#A4ADC4", fontSize: 11.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{vv.ico}</button>
          );
        })}
      </div>
    </div>
  );
}

// 작년 OKR 팝업 — okr_history 연도 적재분 + 💡 참고 자동 코멘트
function HistoryModal({ member, history, currentOkrs, onClose }: { member: Member; history: HistoryOkr[]; currentOkrs: ReviewOkr[]; onClose: () => void }) {
  const years = useMemo(() => [...new Set(history.map((h) => h.year))].sort((a, b) => b - a), [history]);
  const [year, setYear] = useState(years[0]);
  const rows = history.filter((h) => h.year === year);

  // 💡 참고 코멘트: 난이도 상향 · 미달성 · 초과달성
  const notes = useMemo(() => {
    const out: string[] = [];
    const rank = (d: string | null) => (d === "상" ? 3 : d === "중" ? 2 : d === "하" ? 1 : 0);
    const prevMax = Math.max(0, ...rows.map((h) => rank(h.difficulty)));
    const curMax = Math.max(0, ...currentOkrs.map((o) => rank(o.difficulty)));
    if (curMax > prevMax && prevMax > 0) out.push("올해 난이도를 작년보다 높여 잡았어요. 분기 마일스톤으로 진행 점검을 도와주세요.");
    if (rows.some((h) => (h.achievement ?? 100) < 100)) out.push("작년 미달성 KR이 있어요. 올해 KR의 현실성을 함께 점검해보면 좋아요.");
    if (rows.some((h) => (h.achievement ?? 0) > 100)) out.push("작년 초과 달성 경험이 있어요. 올해 목표를 한 단계 더 도전적으로 잡아도 좋겠어요.");
    return out;
  }, [rows, currentOkrs]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,26,54,0.45)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "min(720px, 100%)", maxHeight: "80vh", background: "#fff", borderRadius: 16, display: "flex", flexDirection: "column", overflow: "hidden", boxShadow: "0 24px 64px rgba(15,26,54,0.25)" }}>
        <div style={{ padding: "16px 22px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 16 }}>📂</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>{member.name} 님의 이전 OKR</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 1 }}>okr_history 적재분 · 검토 참고용</div>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#5B6685", fontSize: 13, cursor: "pointer" }}>✕</button>
        </div>
        {history.length === 0 ? (
          <div style={{ padding: "48px 22px", textAlign: "center", color: "#7C87A4", fontSize: 13 }}>아직 적재된 이전 OKR이 없어요. Import 후 다시 확인해주세요 🙂</div>
        ) : (
          <div style={{ padding: "16px 22px", overflowY: "auto" }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
              {years.map((y) => (
                <button key={y} onClick={() => setYear(y)} className="mono" style={{ padding: "6px 14px", borderRadius: 999, border: `1px solid ${year === y ? "#00A968" : "#E1E5EF"}`, background: year === y ? "#ECFAF1" : "#fff", color: year === y ? "#2F9E5E" : "#5B6685", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{y}</button>
              ))}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {rows.map((h, i) => (
                <div key={i} style={{ border: "1px solid #ECEFF5", borderRadius: 12, padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 12, color: "#7C87A4" }}>{h.obj}</span>
                    <span style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                      {h.difficulty && <span style={{ padding: "2px 8px", borderRadius: 999, background: "#E5EBFB", color: "#213A8C", fontSize: 10.5, fontWeight: 600 }}>난이도 {h.difficulty}</span>}
                      <span style={{ padding: "2px 8px", borderRadius: 999, background: "#F0E9FB", color: "#7C4DD9", fontSize: 10.5, fontWeight: 700 }}>등급 {h.grade}</span>
                      {h.achievement != null && <span className="mono" style={{ padding: "2px 8px", borderRadius: 999, background: h.achievement >= 100 ? "#ECFAF1" : "#FFF7EC", color: h.achievement >= 100 ? "#2F9E5E" : "#D98023", fontSize: 10.5, fontWeight: 700 }}>달성 {h.achievement}%</span>}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5 }}>{h.kr}</div>
                  {h.result && <div style={{ marginTop: 6, fontSize: 12, color: "#5B6685" }}>결과 · {h.result}</div>}
                </div>
              ))}
            </div>
            {notes.length > 0 && (
              <div style={{ marginTop: 14, padding: "12px 14px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10 }}>
                {notes.map((n, i) => (
                  <div key={i} style={{ fontSize: 12, color: "#1F6E4A", lineHeight: 1.6, display: "flex", gap: 6 }}><span>💡</span><span>{n}</span></div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// 반려 이력 타임라인 — 재상신 건의 1차 제출 → 반려(사유) → 2차 제출
function EventTimeline({ events }: { events: HistoryEvent[] }) {
  const CFG = {
    submit: { ico: "📤", fg: "#2B5DD9", bg: "#EFF4FE", label: "제출" },
    reject: { ico: "↩", fg: "#D98023", bg: "#FFF7EC", label: "반려" },
    resubmit: { ico: "📤", fg: "#2B5DD9", bg: "#EFF4FE", label: "재상신" },
  } as const;
  return (
    <div style={{ background: "#fff", border: "1px solid #ECEFF5", borderRadius: 12, padding: "14px 16px", marginBottom: 14 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3A4565", marginBottom: 10 }}>반려 이력</div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {events.map((e, i) => {
          const c = CFG[e.event];
          const last = i === events.length - 1;
          return (
            <div key={i} style={{ display: "flex", gap: 10 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 24, height: 24, borderRadius: 8, background: c.bg, color: c.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{c.ico}</div>
                {!last && <div style={{ width: 2, flex: 1, background: "#ECEFF5", minHeight: 10 }} />}
              </div>
              <div style={{ paddingBottom: last ? 0 : 12, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: c.fg }}>{c.label}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "#A4ADC4" }}>{e.at}</span>
                </div>
                {e.note && <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.55, marginTop: 2 }}>{e.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ReviewContent() {
  const searchParams = useSearchParams();
  const user = useMemo(() => getCurrentUser(), []);

  // ── 목록·기준 로드 ─────────────────────────────────────────
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [checklist, setChecklist] = useState<CriteriaItem[]>(seedChecklist);
  const [listLoading, setListLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false); // DB 미연결 → 더미 폴백

  useEffect(() => {
    // 평가 라인: 로그인한 R2의 전속 팀원만 조회
    Promise.all([getMembers(user?.id), getCriteria()]).then(([m, c]) => {
      if (m) setMembers(m);
      if (c) setChecklist(c.checklist);
      if (!m) setDemoMode(true);
      setListLoading(false);
    });
  }, [user?.id]);

  // ── 선택 (D1: ?member= 수신) ───────────────────────────────
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    // 실데이터 로드 완료 후에만 선택 — 더미 목록 기준으로 먼저 선택하면
    // 팀이 다른 계정(예: 최민경)에서 ?member= 자동 선택이 무효화됨
    if (listLoading) return;
    if (selectedId && members.some((m) => m.id === selectedId)) return;
    const param = searchParams.get("member");
    if (param && members.some((m) => m.id === param)) setSelectedId(param);
    else {
      const first = sortTargets(members.filter(isTarget))[0];
      if (first) setSelectedId(first.id);
    }
  }, [members, searchParams, selectedId, listLoading]);

  const selected = members.find((m) => m.id === selectedId) ?? null;

  // 열람 전용 상태 — 재처리 금지. AI 검토 실행은 열람 참고용으로 허용
  //   approved: 승인 완료 건 (QA REV-02 · Q2 확정)
  //   rejected: 반려 건 — R1이 OKR을 수정해 다시 결재요청해야 검토 가능 (조정요청은 처리 가능 유지)
  const RO_CFG: Partial<Record<Member["status"], { notice: string; btn: string; bg: string; fg: string }>> = {
    approved: { notice: "이미 승인된 OKR이에요. 열람만 가능해요 🙂", btn: "승인 완료 · 열람 전용", bg: "#ECFAF1", fg: "#1F6E4A" },
    rejected: { notice: "반려한 OKR이에요. 팀원이 수정해서 다시 결재요청하면 검토할 수 있어요 🙂", btn: "반려 완료 · 열람 전용", bg: "#FFF7EC", fg: "#7A4A14" },
  };
  const roCfg = selected ? RO_CFG[selected.status] : undefined;
  const readOnly = !!roCfg;

  // ── 좌측 필터 ──────────────────────────────────────────────
  const [fStatus, setFStatus] = useState("all");
  const [fGrade, setFGrade] = useState("all");
  const [fSeries, setFSeries] = useState("all");
  const targets = sortTargets(members.filter(isTarget)).filter(
    (m) => (fStatus === "all" || m.status === fStatus) && (fGrade === "all" || m.grade === fGrade) && (fSeries === "all" || m.series === fSeries),
  );
  const grades = [...new Set(members.filter(isTarget).map((m) => m.grade))];
  const seriesList = [...new Set(members.filter(isTarget).map((m) => m.series))];

  // ── 선택 팀원 상세 (okrs · 작년 OKR · 반려 이력) ────────────
  const [okrs, setOkrs] = useState<ReviewOkr[]>([]);
  const [history, setHistory] = useState<HistoryOkr[]>([]);
  const [events, setEvents] = useState<HistoryEvent[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // ── 검토 상태 (선택 변경 시 리셋) ──────────────────────────
  const [items, setItems] = useState<ValidationItem[] | null>(null); // null = AI 검토 전
  const [aiComment, setAiComment] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<"gemini" | "mock" | null>(null);
  const [aiRunning, setAiRunning] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [decision, setDecision] = useState<ReviewDecision | null>(null);
  const [message, setMessage] = useState("");
  const [msgError, setMsgError] = useState(false);
  const [saving, setSaving] = useState<"decision" | "draft" | null>(null);
  const [notice, setNotice] = useState<{ text: string; tone: "ok" | "warn" | "err" } | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [collapsedObjs, setCollapsedObjs] = useState<Set<string>>(new Set()); // 아코디언 접힘 상태 (QA REV-04 — 기본 전체 펼침)
  const membersRef = useRef(members);
  membersRef.current = members;

  useEffect(() => {
    if (!selectedId) return;
    let alive = true;
    setDetailLoading(true);
    setOkrs([]); setHistory([]); setEvents([]);
    // 임시 저장분 복원 (D9 — 이탈 대비)
    const saved = membersRef.current.find((m) => m.id === selectedId)?.analysis;
    setItems(saved?.items ?? null);
    setAiComment(saved ? "임시 저장된 검토 내용을 불러왔어요. 이어서 진행해주세요 🙂" : null);
    setAiSource(null);
    // notice는 여기서 지우지 않는다 — 처리 성공 후 자동 이동 시 성공 알림이 유지되어야 함
    setDecision(null); setMessage(""); setMsgError(false); setHistoryOpen(false); setCollapsedObjs(new Set());
    Promise.all([getMemberOkrs(selectedId), getMemberHistory(selectedId), getMemberEvents(selectedId)]).then(([o, h, e]) => {
      if (!alive) return;
      setOkrs(o ?? mockMemberOkrs[selectedId] ?? []);
      setHistory(h ?? mockMemberHistory[selectedId] ?? []);
      setEvents(e ?? mockMemberEvents[selectedId] ?? []);
      setDetailLoading(false);
    });
    return () => { alive = false; };
  }, [selectedId]);

  // ── AI Validation (목업 — 판정 생성은 aiValidation.ts 단일 지점, D2) ──
  async function runAi() {
    if (!selected) return;
    setAiRunning(true);
    const res = await runValidation(checklist, okrs, selected.id, selected.name);
    setItems(res.items);
    setAiComment(res.comment);
    setAiSource(res.source);
    setAiRunning(false);
  }

  async function fillDraft() {
    if (!selected || !decision || decision === "approved") return;
    setDrafting(true);
    const res = await draftMessageAI(decision, selected.name, items ?? [], okrs);
    setMessage(res.message);
    setMsgError(false);
    setDrafting(false);
  }

  function updateItem(no: number, v: ValidationItem["verdict"]) {
    setItems((cur) => cur?.map((it) => (it.no === no ? { ...it, verdict: v, edited: true } : it)) ?? null);
  }

  const fails = items?.filter((i) => i.verdict === "fail").length ?? 0;
  const warns = items?.filter((i) => i.verdict === "warn").length ?? 0;
  const risk = items ? riskOf(items) : null;
  const riskCfg = risk ? RISK_CFG[risk] : null;

  function snapshot(): RiskAnalysis {
    return { risk: risk ?? "low", items: items ?? [], savedAt: new Date().toISOString() };
  }

  // ── 처리 저장 (D9 통합형 · D7 Confirm) ─────────────────────
  async function handleDecision() {
    if (!selected || !items || !decision || readOnly) return; // 승인 건 재처리 금지 (REV-02 이중 방어)
    if (decision !== "approved" && message.trim() === "") {
      setMsgError(true);
      setNotice({ text: "팀원에게 전할 메시지를 함께 남겨주세요 🙂", tone: "warn" });
      return;
    }
    const labels: Record<ReviewDecision, string> = { approved: "승인", rejected: "반려", adjustment: "조정요청" };
    // D7: 반려·조정요청은 Confirm 경유, 승인은 즉시 처리
    if (decision !== "approved" && !window.confirm(`${selected.name} 님에게 ${labels[decision]}을(를) 보낼까요?\n작성한 메시지가 함께 전달돼요.`)) return;

    setSaving("decision");
    setNotice(null);
    const analysis = snapshot();
    const res = await saveReviewDecision({
      employeeId: selected.id,
      decision,
      message: message.trim(),
      evaluatorName: user?.name ?? "평가자",
      analysis,
    });
    setSaving(null);
    if (!res.ok && res.error !== "NO_DB") {
      setNotice({ text: `저장이 잘 안 됐어요. 잠시 후 다시 시도해주세요. (${res.error})`, tone: "err" });
      return;
    }
    // 성공 (NO_DB면 데모 모드 — 화면에만 반영)
    const updated = membersRef.current.map((m) => (m.id === selected.id ? { ...m, status: decision, risk: analysis.risk, analysis } : m));
    setMembers(updated);
    setNotice({
      text: res.ok ? `${labels[decision]} 처리했어요 ✓` : `${labels[decision]} 처리했어요 ✓ (데모 모드 — DB 미연결이라 화면에만 반영)`,
      tone: "ok",
    });
    // 다음 검토 대상으로 자동 이동 (승인이면 대상에서 빠지고, 반려·조정은 다음 건으로)
    const next = sortTargets(updated.filter(isTarget)).find((m) => m.id !== selected.id);
    if (next) setSelectedId(next.id);
  }

  // ── 임시 저장 (D9: risk_analysis만) ─────────────────────────
  async function handleDraft() {
    if (!selected || !items || readOnly) return; // 승인 건 재처리 금지 (REV-02 이중 방어)
    setSaving("draft");
    const analysis = snapshot();
    const res = await saveReviewDraft(selected.id, analysis);
    setSaving(null);
    if (!res.ok && res.error !== "NO_DB") {
      setNotice({ text: `임시 저장이 잘 안 됐어요. 잠시 후 다시 시도해주세요. (${res.error})`, tone: "err" });
      return;
    }
    setMembers((ms) => ms.map((m) => (m.id === selected.id ? { ...m, risk: analysis.risk, analysis } : m)));
    setNotice({ text: res.ok ? "검토 내용을 임시 저장했어요 ✓" : "임시 저장했어요 ✓ (데모 모드 — 화면에만 반영)", tone: "ok" });
  }

  // ── 부제 (세션 사용자 + 실데이터 건수) ──────────────────────
  const cnt = (s: Member["status"]) => members.filter((m) => m.status === s).length;
  const subtitle = `${user?.name ?? ""} ${user?.grade ?? ""} · 결재요청 ${cnt("pending")}건 / 반려 ${cnt("rejected")}건 / 조정 ${cnt("adjustment")}건`;

  // Objective별 그룹 (아코디언)
  const objGroups = useMemo(() => {
    const map = new Map<string, ReviewOkr[]>();
    okrs.forEach((o) => map.set(o.obj, [...(map.get(o.obj) ?? []), o]));
    return [...map.entries()];
  }, [okrs]);

  const resubmitted = events.some((e) => e.event === "resubmit");

  const selectStyle: React.CSSProperties = { flex: 1, minWidth: 0, padding: "6px 8px", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 11.5, color: "#3A4565", background: "#fff", outline: "none" };

  return (
    <RoleShell role="R2" title="OKR 검토" subtitle={subtitle}>
      {demoMode && (
        <div style={{ marginBottom: 12, padding: "9px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12, color: "#7A4A14" }}>
          지금은 데모 데이터로 보여드리고 있어요. Supabase 연결(.env.local) 후 실제 데이터로 검토할 수 있어요 🙂
        </div>
      )}
      <div style={{ display: "flex", height: "calc(100vh - var(--topbar-h) - 96px)", minHeight: 560, border: "1px solid #E1E5EF", borderRadius: 14, overflow: "hidden", background: "#fff" }}>
        {/* Left — 검토 대상 리스트 + 필터 */}
        <div style={{ width: 270, minWidth: 270, borderRight: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "14px 14px 10px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>검토 대상</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>{targets.length}명 · 결재요청 우선</div>
            <div style={{ display: "flex", gap: 5, marginTop: 9 }}>
              <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} style={selectStyle}>
                <option value="all">상태 전체</option>
                <option value="pending">결재 요청</option>
                <option value="rejected">반려</option>
                <option value="adjustment">조정</option>
              </select>
              <select value={fGrade} onChange={(e) => setFGrade(e.target.value)} style={selectStyle}>
                <option value="all">직급 전체</option>
                {grades.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
              <select value={fSeries} onChange={(e) => setFSeries(e.target.value)} style={selectStyle}>
                <option value="all">직군 전체</option>
                {seriesList.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ flex: 1, overflowY: "auto" }}>
            {listLoading ? (
              <div style={{ padding: "28px 14px", textAlign: "center", color: "#7C87A4", fontSize: 12 }}>팀원 목록을 불러오는 중이에요…</div>
            ) : targets.length === 0 ? (
              <div style={{ padding: "28px 14px", textAlign: "center", color: "#7C87A4", fontSize: 12, lineHeight: 1.6 }}>조건에 맞는 검토 대상이 없어요.<br />모두 정리됐다면 수고하셨어요 🎉</div>
            ) : (
              targets.map((m) => {
                const sc = STATUS_CFG[m.status];
                const sel = selectedId === m.id;
                return (
                  <div key={m.id} onClick={() => { setSelectedId(m.id); setNotice(null); }} style={{ padding: "11px 14px", background: sel ? "#F1F4FD" : "transparent", borderLeft: m.focus ? "3px solid #D98023" : sel ? "3px solid #3B5BDB" : "3px solid transparent", borderBottom: "1px solid #ECEFF5", cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: m.focus ? "#FFF7EC" : "#E5EBFB", color: m.focus ? "#D98023" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{m.name[0]}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        {m.focus && <span style={{ fontSize: 11 }} title="집중 코칭 대상">🎯</span>}
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{m.name}</span>
                        <span className="mono" style={{ fontSize: 10.5, color: "#A4ADC4", fontWeight: 500 }}>{m.grade}·{m.series}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.group} · {m.submitDate || "—"}</div>
                    </div>
                    <span style={{ padding: "2px 7px", borderRadius: 999, background: sc.bg, color: sc.fg, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }}>{sc.label}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Center — OKR 상세 + AI Validation */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px", minWidth: 0 }}>
          {!selected ? (
            <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#7C87A4", fontSize: 13 }}>좌측에서 검토할 팀원을 선택해주세요 🙂</div>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: selected.focus ? "#FFF7EC" : "#E5EBFB", color: selected.focus ? "#D98023" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 16, flexShrink: 0 }}>{selected.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>{selected.focus ? "🎯 " : ""}{selected.name}</h2>
                    <span className="mono" style={{ fontSize: 12, color: "#7C87A4" }}>{selected.grade} · {selected.series}</span>
                    <span style={{ padding: "2px 9px", borderRadius: 999, background: STATUS_CFG[selected.status].bg, color: STATUS_CFG[selected.status].fg, fontSize: 11, fontWeight: 600 }}>{STATUS_CFG[selected.status].label}</span>
                    {resubmitted && <span style={{ padding: "2px 9px", borderRadius: 999, background: "#FFF7EC", border: "1px solid #FFE0BA", color: "#D98023", fontSize: 11, fontWeight: 600 }}>재상신 · 2차 검토</span>}
                  </div>
                  <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 3 }}>{selected.group} · 제출일 {selected.submitDate || "—"}</div>
                </div>
                <Button variant="secondary" size="sm" leftIcon={<span>📂</span>} onClick={() => setHistoryOpen(true)}>작년 OKR 보기</Button>
              </div>

              {events.length > 0 && <EventTimeline events={events} />}

              {detailLoading ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#7C87A4", fontSize: 13 }}>OKR을 불러오는 중이에요…</div>
              ) : okrs.length === 0 ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#7C87A4", fontSize: 13 }}>아직 제출된 OKR이 없어요. 작성이 끝나면 여기서 검토할 수 있어요 🙂</div>
              ) : (
                objGroups.map(([obj, krs]) => {
                  const isCollapsed = collapsedObjs.has(obj);
                  return (
                  <div key={obj} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: isCollapsed ? "14px 20px" : "16px 20px", marginBottom: 14 }}>
                    {/* Objective 헤더 클릭 시 접기/펼치기 (QA REV-04 — 기본 펼침) */}
                    <div
                      onClick={() => setCollapsedObjs((cur) => { const next = new Set(cur); if (next.has(obj)) next.delete(obj); else next.add(obj); return next; })}
                      title={isCollapsed ? "펼치기" : "접기"}
                      style={{ fontSize: 12, color: "#7C87A4", marginBottom: isCollapsed ? 0 : 10, display: "flex", alignItems: "center", gap: 8, cursor: "pointer", userSelect: "none" }}
                    >
                      <span style={{ fontSize: 10, color: "#A4ADC4" }}>{isCollapsed ? "▶" : "▼"}</span>
                      <span style={{ fontWeight: 700, color: "#3A4565" }}>{obj}</span>
                      <span className="mono" style={{ fontSize: 10.5 }}>KR {krs.length}건</span>
                    </div>
                    {!isCollapsed && krs.map((o, i) => (
                      <div key={o.id} style={{ paddingTop: i === 0 ? 0 : 14, marginTop: i === 0 ? 0 : 14, borderTop: i === 0 ? "none" : "1px solid #ECEFF5" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                          <span className="mono" style={{ fontSize: 11.5, color: "#7C87A4" }}>KR_{String(o.id).padStart(3, "0")}</span>
                          {o.difficulty && <span style={{ padding: "2px 9px", borderRadius: 999, background: "#E5EBFB", color: "#213A8C", fontSize: 11, fontWeight: 600 }}>난이도 · {o.difficulty}</span>}
                          <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "var(--page-bg)", color: "#5B6685", fontSize: 11, fontWeight: 600 }}>KR · {o.format}</span>
                          <span className="mono" style={{ marginLeft: "auto", fontSize: 12, color: "#7C87A4" }}>가중치 {o.weight}%</span>
                        </div>
                        <div style={{ fontSize: 15.5, fontWeight: 600, color: "#0F1A36", lineHeight: 1.55, marginBottom: 12, letterSpacing: "-0.01em" }}>{o.kr}</div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, paddingTop: 10, borderTop: "1px dashed #ECEFF5" }}>
                          {[["측정 방법", o.measure ?? "—"], ["Baseline → Goal", `${o.baseline} → ${o.goal}`], ["실행 계획", o.plan ?? "—"]].map(([l, val]) => (
                            <div key={l}><div style={{ fontSize: 10.5, color: "#7C87A4", fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 3 }}>{l}</div><div style={{ fontSize: 12.5, color: "#0F1A36", fontWeight: 500 }}>{val}</div></div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  );
                })
              )}

              {/* AI Validation — 항목은 criteria 테이블, 판정은 aiValidation.ts 목업 (D2) */}
              <div style={{ background: "linear-gradient(135deg, #F1FBF6, #fff 40%)", border: "1px solid #B9F1D8", borderRadius: 12, padding: "18px 20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: items ? 14 : 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>✨</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36", display: "flex", alignItems: "center", gap: 7 }}>
                      AI Validation · {checklist.length}항목 자동 검토
                      {items && aiSource === "gemini" && <span style={{ padding: "2px 8px", borderRadius: 999, background: "#ECFAF1", border: "1px solid #BBE9CC", color: "#2F9E5E", fontSize: 10, fontWeight: 700 }}>📖 2026 가이드 기반</span>}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 2 }}>
                      {items && riskCfg ? (
                        <>위험도 <b style={{ color: riskCfg.fg }}>{riskCfg.ico} {riskCfg.label}</b> · 코칭 후보 <b style={{ color: "#D14343" }}>{fails}건</b> · 주의 <b style={{ color: "#D98023" }}>{warns}건</b></>
                      ) : (
                        "AI 검토를 실행하면 항목별 판정과 코칭 포인트를 보여드려요"
                      )}
                    </div>
                  </div>
                  <Button variant="secondary" size="sm" onClick={runAi} disabled={aiRunning || detailLoading}>
                    {aiRunning ? "검토 중…" : items ? "🔄 AI 재검토" : "🤖 AI 검토 실행"}
                  </Button>
                </div>
                {aiComment && items && (
                  <div style={{ padding: "10px 13px", background: "rgba(0,169,104,0.07)", borderRadius: 10, fontSize: 12, color: "#1F6E4A", lineHeight: 1.55, marginBottom: 10 }}>💬 {aiComment}</div>
                )}
                {items && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {items.map((it) => <CheckRow key={it.no} item={it} onChange={(v) => updateItem(it.no, v)} />)}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Right — 검토 처리 (D9 통합형) */}
        <div style={{ width: 300, minWidth: 300, borderLeft: "1px solid #E1E5EF", display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #ECEFF5" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>검토 처리</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>의견을 작성하고 처리해주세요.</div>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "#3A4565", marginBottom: 8 }}>처리 방향</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {([
                  { key: "approved", label: "✓ 승인", desc: "KR이 충분히 정제되었어요", color: "#2F9E5E", bg: "#ECFAF1" },
                  { key: "adjustment", label: "↻ 조정 요청", desc: "함께 보완할 부분이 있어요", color: "#D98023", bg: "#FFF7EC" },
                  { key: "rejected", label: "↩ 반려", desc: "전체 재작성이 필요해요", color: "#D14343", bg: "#FFF0F0" },
                ] as const).map((v) => {
                  const active = decision === v.key;
                  return (
                    // 승인 건은 처리 방향 선택 비활성 (QA REV-02)
                    <div key={v.key} onClick={() => { if (readOnly) return; setDecision(v.key); setMsgError(false); }} style={{ padding: "11px 13px", background: active ? v.bg : "#fff", border: `1.5px solid ${active ? v.color : "#E1E5EF"}`, borderRadius: 10, cursor: readOnly ? "not-allowed" : "pointer", opacity: readOnly ? 0.45 : 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: active ? v.color : "#0F1A36" }}>{v.label}</div>
                      <div style={{ fontSize: 11.5, color: active ? v.color : "#7C87A4", marginTop: 1 }}>{v.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {decision && decision !== "approved" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#3A4565" }}>{decision === "rejected" ? "반려 사유" : "조정 요청 메시지"} <span style={{ color: "#D14343" }}>*</span></span>
                  <button
                    onClick={fillDraft}
                    disabled={drafting}
                    style={{ marginLeft: "auto", padding: "3px 9px", borderRadius: 7, border: "1px solid #B9F1D8", background: "#F1FBF6", color: "#1F6E4A", fontSize: 10.5, fontWeight: 700, cursor: drafting ? "wait" : "pointer", opacity: drafting ? 0.6 : 1 }}
                  >{drafting ? "✨ 생성 중…" : "✨ AI 초안"}</button>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); if (e.target.value.trim()) setMsgError(false); }}
                  placeholder="팀원에게 전할 메시지를 작성해주세요 (필수)"
                  style={{ width: "100%", minHeight: 130, padding: "10px 12px", background: "#F9FAFC", border: `1px solid ${msgError ? "#D14343" : "#E1E5EF"}`, borderRadius: 10, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36", outline: "none", resize: "vertical", lineHeight: 1.55 }}
                />
                {msgError && <div style={{ fontSize: 11, color: "#D14343", marginTop: 4 }}>메시지를 입력하면 처리할 수 있어요 🙂</div>}
              </div>
            )}
            {notice && (
              <div style={{ padding: "9px 12px", borderRadius: 10, fontSize: 11.5, lineHeight: 1.5, background: notice.tone === "ok" ? "#ECFAF1" : notice.tone === "warn" ? "#FFF7EC" : "#FFF0F0", color: notice.tone === "ok" ? "#1F6E4A" : notice.tone === "warn" ? "#7A4A14" : "#D14343" }}>
                {notice.text}
              </div>
            )}
            {roCfg && (
              <div style={{ padding: "9px 12px", borderRadius: 10, fontSize: 11.5, lineHeight: 1.5, background: roCfg.bg, color: roCfg.fg }}>
                {roCfg.notice}
              </div>
            )}
            {!items && selected && !readOnly && (
              <div style={{ padding: "9px 12px", borderRadius: 10, fontSize: 11.5, lineHeight: 1.5, background: "#F1F4FD", color: "#3A4565" }}>
                먼저 <b>AI 검토 실행</b>으로 체크 결과를 만들어주세요. 처리 시 체크 결과와 위험도가 함께 저장돼요.
              </div>
            )}
          </div>
          <div style={{ padding: "14px 20px", borderTop: "1px solid #ECEFF5", display: "flex", flexDirection: "column", gap: 8 }}>
            <Button variant="primary" fullWidth style={{ padding: 12 }} disabled={readOnly || !selected || !items || !decision || saving !== null} onClick={handleDecision}>
              {roCfg ? roCfg.btn : saving === "decision" ? "처리 중…" : !decision ? "처리 방향을 선택해주세요" : decision === "approved" ? "승인하기 →" : decision === "rejected" ? "반려 보내기 →" : "조정요청 보내기 →"}
            </Button>
            <Button variant="ghost" fullWidth style={{ padding: 9, fontSize: 12 }} disabled={readOnly || !selected || !items || saving !== null} onClick={handleDraft}>
              {saving === "draft" ? "저장 중…" : "임시 저장 (검토 내용만)"}
            </Button>
          </div>
        </div>
      </div>

      {historyOpen && selected && <HistoryModal member={selected} history={history} currentOkrs={okrs} onClose={() => setHistoryOpen(false)} />}
    </RoleShell>
  );
}

export default function R2ReviewPage() {
  // useSearchParams는 Suspense 경계 안에서 사용 (Next.js 가이드)
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#5B6685", fontSize: 14 }}>불러오는 중…</div>}>
      <ReviewContent />
    </Suspense>
  );
}
