"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { r1Okrs, type OKR } from "@/lib/mockData";
import { getR1Okrs, updateOkrProgress } from "@/lib/dataAccess";
import { getCurrentUser, type Session } from "@/lib/auth";

const STATUS_META: Record<OKR["status"], { label: string; bg: string; bd: string; fg: string }> = {
  approved: { label: "승인 완료", bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E" },
  submitted: { label: "제출 · 검토 대기", bg: "#EFF4FE", bd: "#C5D5F7", fg: "#2B5DD9" },
  draft: { label: "작성 중", bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685" },
  rejected: { label: "함께 정제", bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343" },
};

function ProgressChart({ avg }: { avg: number }) {
  const data = [12, 15, 18, 22, 28, 32, 38, 42, 48, 52, 58, 62, 65, 68, 70, avg];
  const max = 100;
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>주간 달성률 추이</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3 }}>2026 하반기 · 16주차</div>
        </div>
        <div style={{ display: "flex", gap: 14, fontSize: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 3, background: "#3B5BDB" }} />달성률</div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 2, background: "#D14343" }} />목표선</div>
        </div>
      </div>
      <div style={{ position: "relative", height: 180, paddingBottom: 22 }}>
        {[0, 25, 50, 75, 100].map((v) => (
          <div key={v} style={{ position: "absolute", left: 30, right: 0, bottom: 22 + (v / max) * 158, height: 1, background: "#ECEFF5" }}>
            <span className="mono" style={{ position: "absolute", left: -28, top: -7, fontSize: 10, color: "#A4ADC4" }}>{v}</span>
          </div>
        ))}
        <div style={{ position: "absolute", left: 30, right: 0, bottom: 22 + (70 / max) * 158, borderTop: "1.5px dashed #D14343", opacity: 0.6 }} />
        <div style={{ position: "absolute", left: 32, right: 0, bottom: 22, top: 0, display: "flex", alignItems: "flex-end", gap: 4 }}>
          {data.map((v, i) => (
            <div key={i} style={{ flex: 1, height: `${(v / max) * 100}%`, background: i === data.length - 1 ? "#3B5BDB" : v >= 70 ? "#5C7AE6" : "#91A6F0", borderRadius: "4px 4px 0 0", position: "relative" }}>
              {i === data.length - 1 && (
                <div className="mono" style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", background: "#0F1A36", color: "#fff", fontSize: 10, fontWeight: 700, padding: "2px 6px", borderRadius: 4, whiteSpace: "nowrap" }}>{v}%</div>
              )}
            </div>
          ))}
        </div>
        <div className="mono" style={{ position: "absolute", left: 32, right: 0, bottom: 0, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#A4ADC4" }}>
          <span>W1</span><span>W4</span><span>W8</span><span>W12</span><span>W16</span>
        </div>
      </div>
    </div>
  );
}

const detailBox: CSSProperties = { padding: "14px 16px", background: "#fff", border: "1px solid #ECEFF5", borderRadius: 10 };
const detailLabel: CSSProperties = { fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase" };
const detailVal: CSSProperties = { fontSize: 18, fontWeight: 700, color: "#0F1A36", marginTop: 5, fontFamily: "var(--font-mono)", fontVariantNumeric: "tabular-nums" };

// ── 진행률 업데이트 모달 ────────────────────────────────────
function ProgressModal({ okr, onClose, onSave, saving }: { okr: OKR & { idx: number }; onClose: () => void; onSave: (progress: number) => void; saving: boolean }) {
  const [value, setValue] = useState(okr.progress);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,26,54,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 460, background: "#fff", borderRadius: 16, padding: "26px 28px", boxShadow: "0 24px 60px -12px rgba(15,26,54,.35)" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>📈 진행률 업데이트</div>
        <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.5, marginBottom: 18 }}>{okr.kr}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 8 }}>
          <input type="range" min={0} max={100} value={value} onChange={(e) => setValue(Number(e.target.value))} style={{ flex: 1, accentColor: "#3B5BDB" }} />
          <input
            className="mono"
            type="number"
            min={0}
            max={100}
            value={value}
            onChange={(e) => setValue(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
            onKeyDown={(e) => { if (e.key === "Enter") onSave(value); }}
            style={{ width: 72, padding: "9px 10px", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 15, fontWeight: 700, textAlign: "right", outline: "none" }}
          />
          <span style={{ fontSize: 14, color: "#7C87A4" }}>%</span>
        </div>
        <div style={{ fontSize: 11.5, color: "#7C87A4", marginBottom: 20 }}>이전: {okr.progress}% → 변경: <b style={{ color: value >= okr.progress ? "#2F9E5E" : "#D98023" }}>{value}%</b></div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" onClick={() => onSave(value)} disabled={saving}>{saving ? "저장 중…" : "저장하기"}</Button>
        </div>
      </div>
    </div>
  );
}

function OKRDetailItem({ okr, idx, onUpdate, onCoach, onEdit }: { okr: OKR; idx: number; onUpdate: () => void; onCoach: () => void; onEdit: () => void }) {
  const [open, setOpen] = useState(idx === 0);
  const meta = STATUS_META[okr.status];
  const c = okr.progress >= 70 ? "#2F9E5E" : okr.progress >= 40 ? "#3B5BDB" : "#D98023";
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, boxShadow: "var(--shadow-xs)", overflow: "hidden" }}>
      <div onClick={() => setOpen(!open)} style={{ padding: "20px 24px", cursor: "pointer", display: "flex", alignItems: "center", gap: 14 }}>
        <div className="mono" style={{ width: 38, height: 38, borderRadius: 10, background: "#F1F4FD", color: "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>{String(idx + 1).padStart(2, "0")}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <span style={{ padding: "2px 9px", borderRadius: 999, background: meta.bg, border: `1px solid ${meta.bd}`, color: meta.fg, fontSize: 11, fontWeight: 600 }}>{meta.label}</span>
            <span className="mono" style={{ padding: "2px 9px", borderRadius: 999, background: "var(--page-bg)", color: "#5B6685", fontSize: 10.5, fontWeight: 600 }}>{okr.format}</span>
            <span className="mono" style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4" }}>가중치 {okr.weight}%</span>
          </div>
          <div style={{ fontSize: 12.5, color: "#7C87A4", marginBottom: 4 }}>{okr.obj}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#0F1A36", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{okr.kr}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div className="ds-num" style={{ fontSize: 22, fontWeight: 700, color: c, letterSpacing: "-0.02em" }}>{okr.progress}%</div>
          <div style={{ width: 100, height: 6, background: "var(--page-bg)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${okr.progress}%`, background: c, borderRadius: 3 }} />
          </div>
        </div>
        <span style={{ color: "#A4ADC4", transform: open ? "rotate(180deg)" : "none", transition: "transform 180ms ease-out" }}>▾</span>
      </div>

      {open && (
        <div style={{ borderTop: "1px solid #ECEFF5", padding: "22px 24px", background: "#F9FAFC" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 18 }}>
            <div style={detailBox}><div style={detailLabel}>Baseline</div><div style={detailVal}>{okr.baseline}</div></div>
            <div style={detailBox}><div style={detailLabel}>진행률</div><div style={{ ...detailVal, color: "#3B5BDB" }}>{okr.progress}%</div></div>
            <div style={detailBox}><div style={detailLabel}>Goal</div><div style={{ ...detailVal, color: "#2F9E5E" }}>{okr.goal}</div></div>
          </div>
          {okr.evaluator && (
            <div style={{ padding: "14px 16px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>{okr.evaluator.from.charAt(0)}</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#1B2A4E", marginBottom: 3 }}>{okr.evaluator.from} 팀장 · 평가자 코멘트</div>
                <div style={{ fontSize: 12.5, color: "#3A4565", lineHeight: 1.55 }}>{okr.evaluator.msg}</div>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 16, flexWrap: "wrap" }}>
            <Button variant="primary" size="sm" leftIcon={<span>📈</span>} onClick={onUpdate}>진행률 업데이트</Button>
            <Button variant="ai" size="sm" leftIcon={<span>✨</span>} onClick={onCoach}>AI 코칭 받기</Button>
            <Button variant="secondary" size="sm" leftIcon={<span>✏️</span>} onClick={onEdit}>KR 수정</Button>
          </div>
        </div>
      )}
    </div>
  );
}

const WEIGHT_COLORS = ["#3B5BDB", "#5C7AE6", "#7C4DD9", "#E07A3C", "#2F9E5E", "#D98023"];

export default function R1MyOKRPage() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [okrs, setOkrs] = useState<OKR[]>(r1Okrs);
  const [loading, setLoading] = useState(true);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) return;
    setUser(u);
    getR1Okrs(u.id)
      .then((o) => o && setOkrs(o))
      .finally(() => setLoading(false));
  }, []);

  async function saveProgress(idx: number, progress: number) {
    const target = okrs[idx];
    setSaving(true);
    try {
      if (target.dbId != null) {
        const result = await updateOkrProgress(target.dbId, progress);
        if (result.saved === "local") setNotice(`진행률을 화면에 반영했어요. 서버 연결 후 자동 저장될 예정이에요 (${result.reason}).`);
        else setNotice("진행률을 저장했어요 ✅");
      } else {
        setNotice("진행률을 화면에 반영했어요. 서버 연결 후 자동 저장될 예정이에요.");
      }
      setOkrs((list) => list.map((o, i) => (i === idx ? { ...o, progress } : o)));
      setModalIdx(null);
    } finally {
      setSaving(false);
    }
  }

  const avgProgress = okrs.length ? Math.round(okrs.reduce((a, o) => a + o.progress, 0) / okrs.length) : 0;
  const totalWeight = okrs.reduce((a, o) => a + o.weight, 0);
  const best = okrs.reduce((a, o, i) => (o.progress > okrs[a].progress ? i : a), 0);
  const worst = okrs.reduce((a, o, i) => (o.progress < okrs[a].progress ? i : a), 0);

  return (
    <RoleShell
      role="R1"
      title="나의 OKR"
      subtitle={user ? `${user.name} · 2026 하반기 · 진행률 ${avgProgress}%` : ""}
      actions={<Button variant="primary" size="sm" leftIcon={<span>📈</span>} onClick={() => setModalIdx(0)}>진행률 업데이트</Button>}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>2026 하반기 · OKR {okrs.length}건{loading && " · 불러오는 중…"}</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          {avgProgress >= 50 ? "순조롭게 나아가고 있어요 ✨" : "함께 진척을 만들어봐요 💪"}
        </h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>평균 달성률 <b style={{ color: "#0F1A36" }}>{avgProgress}%</b> · KR {okrs.length}개 진행 중</p>
      </div>

      {notice && (
        <div style={{ marginBottom: 16, padding: "12px 16px", background: "#ECFAF1", border: "1px solid #BBE9CC", borderRadius: 10, display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#1F6B45" }}>
          <span>💡</span><div style={{ flex: 1 }}>{notice}</div>
          <button onClick={() => setNotice(null)} style={{ border: "none", background: "transparent", color: "#6BA98A", cursor: "pointer", fontSize: 15 }}>×</button>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, marginBottom: 20 }}>
        <ProgressChart avg={avgProgress} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 11.5, color: "#7CE9BE", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>이번 분기 종합</div>
            <div className="ds-num" style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.1 }}>{avgProgress}<span style={{ fontSize: 18, color: "#7CE9BE", fontWeight: 500, marginLeft: 2 }}>%</span></div>
            <div style={{ fontSize: 12, color: "#9DB3A9", marginTop: 6 }}>평균 달성률 · 가중치 반영</div>
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", gap: 16, fontSize: 11.5 }}>
              <div><div style={{ color: "#7CE9BE" }}>최고</div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 2 }}>KR {String(best + 1).padStart(2, "0")} · {okrs[best]?.progress ?? 0}%</div></div>
              <div><div style={{ color: "#7CE9BE" }}>지원 필요</div><div style={{ color: "#fff", fontWeight: 700, fontSize: 14, marginTop: 2 }}>KR {String(worst + 1).padStart(2, "0")} · {okrs[worst]?.progress ?? 0}%</div></div>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "18px 20px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>KR별 가중치</div>
            <div style={{ display: "flex", height: 14, borderRadius: 7, overflow: "hidden", marginBottom: 12 }}>
              {okrs.map((o, i) => <div key={i} style={{ flex: o.weight, background: WEIGHT_COLORS[i % WEIGHT_COLORS.length] }} />)}
              {totalWeight < 110 && <div style={{ flex: 110 - totalWeight, background: "#ECEFF5" }} />}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11.5 }}>
              {okrs.map((o, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#3A4565", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>
                    <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 2, background: WEIGHT_COLORS[i % WEIGHT_COLORS.length], marginRight: 6 }} />
                    KR {String(i + 1).padStart(2, "0")} · {o.obj.replace(/^Objective · /, "")}
                  </span>
                  <b className="mono" style={{ color: "#0F1A36" }}>{o.weight}%</b>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, paddingTop: 7, borderTop: "1px dashed #ECEFF5" }}>
                <span style={{ color: "#7C87A4" }}>합산 / 상한</span><b className="mono" style={{ color: "#0F1A36" }}>{totalWeight} / 110</b>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", margin: "8px 0 14px" }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>OKR 상세</div>
          <div style={{ fontSize: 12.5, color: "#7C87A4", marginTop: 3 }}>각 KR을 클릭하면 상세 정보와 평가자 코멘트를 볼 수 있어요.</div>
        </div>
        <Button variant="primary" size="sm" leftIcon={<span>+</span>} onClick={() => router.push("/r1/write")}>KR 추가</Button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {okrs.map((o, i) => (
          <OKRDetailItem
            key={o.dbId ?? i}
            okr={o}
            idx={i}
            onUpdate={() => setModalIdx(i)}
            onCoach={() => router.push("/r1/coaching")}
            onEdit={() => router.push("/r1/write")}
          />
        ))}
      </div>

      {modalIdx !== null && okrs[modalIdx] && (
        <ProgressModal
          okr={{ ...okrs[modalIdx], idx: modalIdx }}
          onClose={() => setModalIdx(null)}
          onSave={(p) => saveProgress(modalIdx, p)}
          saving={saving}
        />
      )}
    </RoleShell>
  );
}
