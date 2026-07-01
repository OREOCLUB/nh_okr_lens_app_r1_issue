"use client";

import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

const GRADE_COLOR: Record<string, { fg: string; bg: string }> = {
  S: { fg: "#6B47E0", bg: "#F0E9FB" }, A: { fg: "#3B5BDB", bg: "#E8F0FF" }, B: { fg: "#2F9E5E", bg: "#ECFAF1" }, C: { fg: "#D98023", bg: "#FFF7EC" }, D: { fg: "#7C87A4", bg: "#F1F3F8" },
};

interface Past {
  period: string; grade: string; achievement: number; okrCount: number; confirmed: string;
  krs: { text: string; grade: string; achievement: number }[];
  comment: string;
}

const HISTORY: Past[] = [
  {
    period: "2025 하반기", grade: "A", achievement: 91, okrCount: 5, confirmed: "2025-12-20",
    krs: [
      { text: "결제 게이트웨이 APM p95 900ms → 750ms", grade: "A", achievement: 92 },
      { text: "야간 배치 장애 알림 자동화 4단계 중 3단계 완료", grade: "A", achievement: 100 },
      { text: "결제 인증모듈 커버리지 55% → 70%", grade: "B", achievement: 82 },
    ],
    comment: "측정 방법이 명료하고 진척 관리가 꾸준했어요. 다음 반기엔 도전성 한 단계 상향을 함께 검토해봐요.",
  },
  {
    period: "2025 상반기", grade: "B", achievement: 78, okrCount: 4, confirmed: "2025-06-28",
    krs: [
      { text: "배포 자동화 시간 25분 → 8분", grade: "A", achievement: 88 },
      { text: "DB 성능 개선 · 쿼리 220ms → 130ms", grade: "B", achievement: 75 },
    ],
    comment: "핵심 KR은 잘 달성했어요. 일부 KR의 증빙 자료를 조금 더 챙기면 좋겠어요.",
  },
  {
    period: "2024 하반기", grade: "B", achievement: 74, okrCount: 4, confirmed: "2024-12-22",
    krs: [
      { text: "모니터링 알림 정제 · 오탐률 30% 감소", grade: "B", achievement: 76 },
      { text: "장애 발생 건수 월 3건 → 월 1.5건", grade: "B", achievement: 72 },
    ],
    comment: "운영 안정화에 기여했어요. 정량 지표를 조금 더 도전적으로 잡아볼 수 있어요.",
  },
];

export default function R1HistoryPage() {
  return (
    <RoleShell role="R1" title="이전 평가" subtitle="정태영 · 최근 3개 반기 이력">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase" }}>평가 이력</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>지난 반기들을 돌아봐요 📚</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>이전 OKR과 결과는 새 KR을 더 정교하게 잡는 좋은 참고가 돼요. 최근 <b style={{ color: "#0F1A36" }}>2회 연속 A·B</b>등급이에요.</p>
      </div>

      {/* Trend strip */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>등급 추이</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 90 }}>
          {[...HISTORY].reverse().map((h) => {
            const gc = GRADE_COLOR[h.grade];
            return (
              <div key={h.period} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                <div style={{ width: "60%", maxWidth: 80, height: `${h.achievement * 0.6}px`, background: gc.fg, borderRadius: "6px 6px 0 0" }} />
                <div className="mono" style={{ fontSize: 13, fontWeight: 800, color: gc.fg }}>{h.grade}</div>
                <div style={{ fontSize: 11, color: "#7C87A4" }}>{h.period}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Period cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {HISTORY.map((h) => {
          const gc = GRADE_COLOR[h.grade];
          return (
            <div key={h.period} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px", boxShadow: "var(--shadow-xs)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div className="mono" style={{ width: 52, height: 52, borderRadius: 13, background: gc.bg, color: gc.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 800, flexShrink: 0 }}>{h.grade}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36" }}>{h.period}</div>
                  <div className="mono" style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>KR {h.okrCount}개 · 달성률 {h.achievement}% · {h.confirmed} 확정</div>
                </div>
                <Button variant="secondary" size="sm" onClick={() => alert(`${h.period} 회고 화면은 준비 중이에요 🙂`)}>회고 보기</Button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {h.krs.map((k, i) => {
                  const kc = GRADE_COLOR[k.grade];
                  return (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10 }}>
                      <span className="mono" style={{ width: 26, height: 26, borderRadius: 7, background: kc.bg, color: kc.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{k.grade}</span>
                      <span style={{ flex: 1, fontSize: 13, color: "#0F1A36" }}>{k.text}</span>
                      <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>{k.achievement}%</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: "12px 14px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10, display: "flex", gap: 10, fontSize: 12.5, color: "#0F1A36", lineHeight: 1.55 }}>
                <span>💬</span>
                <div><b>평가자 코멘트</b> · {h.comment}</div>
              </div>
            </div>
          );
        })}
      </div>
    </RoleShell>
  );
}
