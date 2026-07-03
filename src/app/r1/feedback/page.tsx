"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { getCurrentUser, type Session } from "@/lib/auth";

interface Reply { text: string; at: string }
interface FB {
  id: string; from: string; role: string; date: string; kr: string;
  tone: "praise" | "coaching" | "info"; unread?: boolean; message: string;
  replies: Reply[];
}

const INITIAL_FEEDBACK: FB[] = [
  { id: "F1", from: "박정훈 팀장", role: "평가자", date: "07/01 09:20", kr: "KR 01 · 응답속도 개선", tone: "praise", unread: true, message: "측정 방법이 명료해서 좋습니다. 6월 캐시 적용 결과도 공유해주면 다음 코칭 때 함께 볼게요. 이대로 진행해주세요!", replies: [] },
  { id: "F2", from: "박정훈 팀장", role: "평가자", date: "06/28 15:40", kr: "KR 03 · 운영 자동화", tone: "coaching", unread: true, message: "마일스톤 산출물 형태를 조금 더 구체적으로 적어주면 좋겠어요. 예를 들어 '알림 룰 정의서 v1'처럼요. 화요일 1on1에서 함께 정리해요.", replies: [] },
  { id: "F3", from: "AI 코치", role: "AI", date: "06/25 11:05", kr: "KR 02 · 테스트 커버리지", tone: "info", message: "전월 대비 +9%p 진척이 좋아요. 리프레시 토큰 시나리오 테스트를 추가하면 목표 85%에 더 빠르게 도달할 수 있어요.", replies: [] },
  { id: "F4", from: "박정훈 팀장", role: "평가자", date: "06/20 17:10", kr: "전체 OKR", tone: "info", message: "이번 반기 OKR 구성이 균형 잡혀 있어요. 운영과 개선의 비중이 적절합니다. 진행률 업데이트를 주 1회 정도 남겨주면 관리가 수월해요.", replies: [] },
];

const TONE: Record<FB["tone"], { bg: string; fg: string; ico: string; label: string }> = {
  praise: { bg: "#ECFAF1", fg: "#2F9E5E", ico: "🌟", label: "칭찬" },
  coaching: { bg: "#FFF7EC", fg: "#D98023", ico: "💡", label: "코칭 제안" },
  info: { bg: "#EFF4FE", fg: "#2B5DD9", ico: "💬", label: "안내" },
};

export default function R1FeedbackPage() {
  const router = useRouter();
  const [user, setUser] = useState<Session | null>(null);
  const [feedback, setFeedback] = useState<FB[]>(INITIAL_FEEDBACK);
  const [filter, setFilter] = useState<"all" | FB["tone"]>("all");
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (u) setUser(u);
  }, []);

  const list = filter === "all" ? feedback : feedback.filter((f) => f.tone === filter);
  const unread = feedback.filter((f) => f.unread).length;

  function markRead(id: string) {
    setFeedback((fs) => fs.map((f) => (f.id === id ? { ...f, unread: false } : f)));
  }

  function submitReply(id: string) {
    const t = replyText.trim();
    if (!t) return;
    const now = new Date();
    const at = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${now.getHours()}:${String(now.getMinutes()).padStart(2, "0")}`;
    setFeedback((fs) => fs.map((f) => (f.id === id ? { ...f, unread: false, replies: [...f.replies, { text: t, at }] } : f)));
    setReplyText("");
    setReplyingId(null);
  }

  return (
    <RoleShell role="R1" title="피드백" subtitle={user ? `${user.name} · 새 피드백 ${unread}건` : ""}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>받은 피드백</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>평가자와 AI 코치의 피드백 💬</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>KR별로 남겨진 코멘트예요. 새 피드백 <b style={{ color: "#0F1A36" }}>{unread}건</b>이 도착했어요.</p>
      </div>

      {/* Filter */}
      <div style={{ display: "inline-flex", background: "var(--page-bg)", borderRadius: 10, padding: 4, gap: 2, marginBottom: 18 }}>
        {([["all", "전체"], ["praise", "🌟 칭찬"], ["coaching", "💡 코칭 제안"], ["info", "💬 안내"]] as const).map(([k, l]) => {
          const on = filter === k;
          return <button key={k} onClick={() => setFilter(k)} style={{ background: on ? "#fff" : "transparent", color: on ? "#0F1A36" : "#5B6685", fontWeight: on ? 700 : 500, border: "none", borderRadius: 7, padding: "8px 14px", fontSize: 12.5, cursor: "pointer", fontFamily: "var(--font-sans)", boxShadow: on ? "0 1px 2px rgba(31,42,74,.08)" : "none" }}>{l}</button>;
        })}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {list.map((f) => {
          const t = TONE[f.tone];
          const isAI = f.role === "AI";
          const replying = replyingId === f.id;
          return (
            <div key={f.id} onClick={() => f.unread && markRead(f.id)} style={{ background: "#fff", border: `1px solid ${f.unread ? "#C5D0F7" : "#E1E5EF"}`, borderRadius: 14, padding: "18px 20px", boxShadow: "var(--shadow-xs)", position: "relative" }}>
              {f.unread && <span style={{ position: "absolute", top: 18, right: 20, width: 8, height: 8, borderRadius: "50%", background: "#3B5BDB" }} />}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: isAI ? "linear-gradient(135deg, #00A968, #14342B)" : "#E5EBFB", color: isAI ? "#fff" : "#213A8C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>{isAI ? "✨" : f.from[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>{f.from}</span>
                    <span style={{ fontSize: 11, color: "#7C87A4" }}>· {f.role}</span>
                    <span style={{ padding: "2px 8px", borderRadius: 999, background: t.bg, color: t.fg, fontSize: 10.5, fontWeight: 700 }}>{t.ico} {t.label}</span>
                  </div>
                  <div className="mono" style={{ fontSize: 11, color: "#A4ADC4", marginTop: 2 }}>{f.date}</div>
                </div>
              </div>
              <div style={{ display: "inline-flex", padding: "3px 10px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 11, fontWeight: 600, marginBottom: 10 }}>🎯 {f.kr}</div>
              <div style={{ fontSize: 13.5, color: "#3A4565", lineHeight: 1.65 }}>{f.message}</div>

              {/* 내가 남긴 답글 */}
              {f.replies.map((r, i) => (
                <div key={i} style={{ marginTop: 12, marginLeft: 24, padding: "11px 14px", background: "#F1F4FD", border: "1px solid #DCE4F7", borderRadius: 10, fontSize: 13, color: "#1F2A4A", lineHeight: 1.6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#3B5BDB", marginBottom: 3 }}>↩ 나의 답글 · <span className="mono" style={{ fontWeight: 500, color: "#7C87A4" }}>{r.at}</span></div>
                  {r.text}
                </div>
              ))}

              {/* 답글 입력 */}
              {replying ? (
                <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "flex-end" }}>
                  <textarea
                    autoFocus
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitReply(f.id); } }}
                    rows={2}
                    placeholder="답글을 입력하세요… (Enter로 전송)"
                    style={{ flex: 1, padding: "10px 12px", border: "1px solid #C5D0F7", borderRadius: 10, outline: "none", fontFamily: "var(--font-sans)", fontSize: 13, resize: "vertical", lineHeight: 1.5 }}
                  />
                  <button onClick={() => submitReply(f.id)} style={{ padding: "9px 16px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 9, fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)" }}>보내기</button>
                  <button onClick={() => { setReplyingId(null); setReplyText(""); }} style={{ padding: "9px 14px", background: "#fff", color: "#5B6685", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>취소</button>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                  <button onClick={() => { setReplyingId(f.id); setReplyText(""); markRead(f.id); }} style={{ padding: "7px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12.5, color: "#3A4565", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>↩ 답글</button>
                  {f.tone === "coaching" && <button onClick={() => router.push("/r1/coaching")} style={{ padding: "7px 14px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 9, fontSize: 12.5, color: "#0A6B44", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>✨ AI와 함께 정제</button>}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </RoleShell>
  );
}
