"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { members as seedMembers, type Member } from "@/lib/mockData";
import { getMembers } from "@/lib/dataAccess";
import { getCurrentUser } from "@/lib/auth";

const STATUS: Record<Member["status"], { fg: string; bg: string; label: string }> = {
  approved: { fg: "#2F9E5E", bg: "#ECFAF1", label: "승인" },
  rejected: { fg: "#D14343", bg: "#FFF0F0", label: "반려" },
  adjustment: { fg: "#D98023", bg: "#FFF7EC", label: "조정요청" },
  pending: { fg: "#2B5DD9", bg: "#EFF4FE", label: "결재 요청" },
  draft: { fg: "#5B6685", bg: "#F1F3F8", label: "작성 중" },
};
const RISK: Record<string, { fg: string; label: string }> = {
  low: { fg: "#2F9E5E", label: "하" },
  mid: { fg: "#D98023", label: "중" },
  high: { fg: "#D14343", label: "상" },
};

// 현황 카드 6종 (D4) — key = 테이블 필터 값
const CARDS = [
  { key: "all", label: "전체 팀원", icon: "👥", bg: "#E0F7EC", fg: "#00A968", unit: "명" },
  { key: "approved", label: "수립 완료", icon: "✓", bg: "#ECFAF1", fg: "#2F9E5E", unit: "명" },
  { key: "draft", label: "작성 중", icon: "✏️", bg: "#F1F3F8", fg: "#5B6685", unit: "명" },
  { key: "pending", label: "결재 요청", icon: "📥", bg: "#EFF4FE", fg: "#2B5DD9", unit: "건", attention: true },
  { key: "rejected", label: "반려", icon: "↩", bg: "#FFF0F0", fg: "#D14343", unit: "건", attention: true },
  { key: "adjustment", label: "조정 요청", icon: "↻", bg: "#FFF7EC", fg: "#D98023", unit: "건", attention: true },
] as const;
type CardKey = (typeof CARDS)[number]["key"];

// 기본 정렬: 상태 우선순위 (결재요청 > 반려 > 조정 > 작성중 > 완료)
const STATUS_PRIORITY: Record<Member["status"], number> = { pending: 0, rejected: 1, adjustment: 2, draft: 3, approved: 4 };
const RISK_PRIORITY: Record<string, number> = { high: 0, mid: 1, low: 2 };

type SortKey = "grade" | "name" | "series" | "submitDate" | "status" | "risk" | "coaching";
const COLUMNS: { key: SortKey; label: string }[] = [
  { key: "grade", label: "직급" },
  { key: "name", label: "이름" },
  { key: "series", label: "직군" },
  { key: "submitDate", label: "제출일" },
  { key: "status", label: "상태" },
  { key: "risk", label: "AI 위험도" },
  { key: "coaching", label: "코칭등록" },
];

const PAGE_SIZE = 5;

export default function R2HomePage() {
  const router = useRouter();
  const user = useMemo(() => getCurrentUser(), []);
  const [members, setMembers] = useState<Member[]>(seedMembers);
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(false);
  const [filter, setFilter] = useState<CardKey>("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null); // null = 기본(상태 우선순위)
  const [page, setPage] = useState(1);

  useEffect(() => {
    // 평가 라인: 로그인한 R2의 전속 팀원만 조회
    getMembers(user?.id).then((m) => {
      if (m) setMembers(m);
      else setDemoMode(true);
      setLoading(false);
    });
  }, [user?.id]);

  const count = (k: CardKey) => (k === "all" ? members.length : members.filter((m) => m.status === k).length);

  // 카드 필터 → 정렬 → 페이징
  const rows = useMemo(() => {
    const filtered = filter === "all" ? members : members.filter((m) => m.status === filter);
    const sorted = [...filtered].sort((a, b) => {
      if (!sort) return STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      const { key, dir } = sort;
      let cmp = 0;
      if (key === "status") cmp = STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status];
      else if (key === "risk") cmp = (a.risk ? RISK_PRIORITY[a.risk] : 9) - (b.risk ? RISK_PRIORITY[b.risk] : 9);
      else if (key === "coaching") cmp = Number(b.coaching) - Number(a.coaching);
      else cmp = String(a[key] ?? "").localeCompare(String(b[key] ?? ""), "ko");
      return cmp * dir;
    });
    return sorted;
  }, [members, filter, sort]);

  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  function clickCard(k: CardKey) {
    setFilter((cur) => (cur === k ? "all" : k)); // 재클릭 시 해제
    setPage(1);
  }

  function clickHeader(k: SortKey) {
    setSort((cur) => (cur?.key === k ? (cur.dir === 1 ? { key: k, dir: -1 } : null) : { key: k, dir: 1 }));
    setPage(1);
  }

  const goReview = (memberId?: string) => router.push(memberId ? `/r2/review?member=${memberId}` : "/r2/review");

  const coachingCandidates = members.filter((m) => m.risk === "high" || m.risk === "mid");
  const pendingCnt = count("pending");

  return (
    <RoleShell role="R2" title="평가자 대시보드" subtitle={user ? `${user.name} ${user.grade} · ${user.dept} · ${user.team}` : "평가자"}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · 팀 OKR 검토 기간</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>팀원 {members.length}명의 OKR을 함께 정제합니다 🌱</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14.5, color: "#5B6685" }}>
          {pendingCnt > 0 ? `검토 대기 ${pendingCnt}건이 기다리고 있어요. AI 코칭으로 함께 정제해볼까요?` : "지금 검토 대기 건이 없어요. 팀원 현황을 살펴보세요 🙂"}
        </p>
      </div>

      {demoMode && (
        <div style={{ marginBottom: 14, padding: "9px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12, color: "#7A4A14" }}>
          지금은 데모 데이터로 보여드리고 있어요. Supabase 연결(.env.local) 후 실제 데이터로 확인할 수 있어요 🙂
        </div>
      )}

      {/* 현황 카드 6종 (D4) — 클릭 시 하단 테이블 필터, 재클릭 해제 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12, marginBottom: 24 }}>
        {CARDS.map((c) => {
          const n = count(c.key);
          const active = filter === c.key && c.key !== "all";
          const highlight = "attention" in c && c.attention && n > 0;
          return (
            <div
              key={c.key}
              onClick={() => clickCard(c.key)}
              title={c.key === "all" ? "필터 해제" : `${c.label} 상태만 보기 (재클릭 시 해제)`}
              style={{
                background: "#fff", borderRadius: 14, padding: "16px 16px 14px", cursor: "pointer",
                border: `1.5px solid ${active ? c.fg : highlight ? `${c.fg}55` : "var(--ink-200)"}`,
                boxShadow: active ? `0 0 0 3px ${c.fg}22` : "var(--shadow-xs)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <div style={{ width: 30, height: 30, borderRadius: 9, background: c.bg, color: c.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{c.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-600)" }}>{c.label}</div>
              </div>
              <div className="ds-num" style={{ fontSize: 26, fontWeight: 700, color: highlight ? c.fg : "var(--ink-900)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {loading ? "…" : n}
                <span style={{ fontSize: 13, color: "var(--ink-500)", fontWeight: 500, marginLeft: 3 }}>{c.unit}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20 }}>
        {/* 팀원 OKR 현황 테이블 — 헤더 정렬 + 페이징 + 행 클릭 이동(D1) */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, boxShadow: "var(--shadow-xs)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>팀원 OKR 현황</div>
            <span style={{ fontSize: 12, color: "#7C87A4" }}>
              {filter !== "all" ? `${STATUS[filter as Member["status"]].label} ${rows.length}명 · 카드 재클릭으로 해제` : `제출 ${rows.length}명`}
            </span>
          </div>
          <div style={{ overflowX: "auto", flex: 1 }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#7C87A4", fontSize: 11.5 }}>
                  {COLUMNS.map((col, i) => (
                    <th key={col.key} onClick={() => clickHeader(col.key)} title="클릭해서 정렬" style={{ padding: i === 0 ? "10px 8px 10px 22px" : "10px 8px", fontWeight: 600, cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" }}>
                      {col.label} <span style={{ color: sort?.key === col.key ? "#00A968" : "#C8CFDF", fontSize: 9 }}>{sort?.key === col.key ? (sort.dir === 1 ? "▲" : "▼") : "↕"}</span>
                    </th>
                  ))}
                  <th style={{ padding: "10px 22px 10px 8px", fontWeight: 600 }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} style={{ padding: "32px 22px", textAlign: "center", color: "#7C87A4", fontSize: 12.5 }}>팀원 현황을 불러오는 중이에요…</td></tr>
                ) : pageRows.length === 0 ? (
                  <tr><td colSpan={8} style={{ padding: "32px 22px", textAlign: "center", color: "#7C87A4", fontSize: 12.5 }}>이 상태의 팀원이 없어요 🙂</td></tr>
                ) : (
                  pageRows.map((m) => {
                    const s = STATUS[m.status];
                    const r = m.risk ? RISK[m.risk] : null;
                    return (
                      <tr key={m.id} onClick={() => goReview(m.id)} title={`${m.name} 님 검토 화면으로 이동`} style={{ borderTop: "1px solid #F1F3F8", cursor: "pointer" }}>
                        <td className="mono" style={{ padding: "12px 8px 12px 22px", color: "#5B6685", whiteSpace: "nowrap" }}>{m.grade}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#E0F7EC", color: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{m.name.charAt(0)}</div>
                            <div>
                              <div style={{ fontWeight: 600, color: "#0F1A36", whiteSpace: "nowrap" }}>{m.focus ? "🎯 " : ""}{m.name}</div>
                              <div className="mono" style={{ fontSize: 10, color: "#7C87A4" }}>{m.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="mono" style={{ padding: "12px 8px", color: "#5B6685" }}>{m.series}</td>
                        <td className="mono" style={{ padding: "12px 8px", color: "#5B6685" }}>{m.submitDate ?? "—"}</td>
                        <td style={{ padding: "12px 8px" }}>
                          <span style={{ padding: "3px 10px", borderRadius: 999, background: s.bg, color: s.fg, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap" }}>{s.label}</span>
                        </td>
                        <td style={{ padding: "12px 8px" }}>
                          {r ? <span style={{ color: r.fg, fontSize: 12, fontWeight: 700 }}>코칭 · {r.label}</span> : <span style={{ color: "#C8CFDF" }}>—</span>}
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: 12 }}>
                          {m.coaching ? <span style={{ color: "#2F9E5E", fontWeight: 600 }}>✓ 등록</span> : <span style={{ color: "#C8CFDF" }}>미등록</span>}
                        </td>
                        <td style={{ padding: "12px 22px 12px 8px" }}>
                          <button onClick={(e) => { e.stopPropagation(); goReview(m.id); }} style={{ padding: "5px 11px", borderRadius: 8, border: "1px solid #E1E5EF", background: "#fff", color: "#3A4565", fontSize: 11.5, fontWeight: 700, cursor: "pointer", whiteSpace: "nowrap" }}>검토 →</button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          {/* 페이징 */}
          <div style={{ padding: "10px 22px", borderTop: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 11.5, color: "#7C87A4", marginRight: "auto" }}>{rows.length}명 중 {rows.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, rows.length)}</span>
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #E1E5EF", background: "#fff", color: safePage <= 1 ? "#C8CFDF" : "#3A4565", fontSize: 11.5, cursor: safePage <= 1 ? "default" : "pointer" }}>이전</button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => setPage(p)} className="mono" style={{ width: 26, height: 26, borderRadius: 7, border: `1px solid ${p === safePage ? "#00A968" : "#E1E5EF"}`, background: p === safePage ? "#ECFAF1" : "#fff", color: p === safePage ? "#2F9E5E" : "#5B6685", fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>{p}</button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #E1E5EF", background: "#fff", color: safePage >= totalPages ? "#C8CFDF" : "#3A4565", fontSize: 11.5, cursor: safePage >= totalPages ? "default" : "pointer" }}>다음</button>
          </div>
        </div>

        {/* 함께 정제할 후보 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "linear-gradient(135deg, #0A1F17 0%, #14342B 100%)", color: "#fff", borderRadius: 16, padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 11, background: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>✨</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>함께 정제할 후보</div>
                <div style={{ fontSize: 11.5, color: "#7CE9BE", marginTop: 2 }}>AI 위험도 중·상 {coachingCandidates.length}건</div>
              </div>
            </div>
            {coachingCandidates.map((m) => (
              <div key={m.id} onClick={() => goReview(m.id)} title={`${m.name} 님 검토 화면으로 이동`} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>{m.name.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{m.name}</div>
                  <div style={{ fontSize: 11, color: "#9DB3A9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.obj}</div>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: m.risk === "high" ? "#FF9A9A" : "#FFD27A" }}>{m.risk && `코칭 · ${RISK[m.risk].label}`}</span>
              </div>
            ))}
            <button onClick={() => goReview()} style={{ marginTop: 14, background: "#fff", color: "#0A1F17", border: "none", borderRadius: 10, width: "100%", padding: 12, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              📥 검토 화면으로 이동
            </button>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
