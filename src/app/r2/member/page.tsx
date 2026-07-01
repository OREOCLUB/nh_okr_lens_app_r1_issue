"use client";

import Link from "next/link";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

const GRADE_COLORS: Record<string, string> = { S: "#6B47E0", A: "#3B5BDB", B: "#2F9E5E", C: "#D98023", D: "#7C87A4" };

function MetricMini({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div style={{ padding: "14px 16px", background: "#F9FAFC", borderRadius: 10 }}>
      <div style={{ fontSize: 11, color: "#7C87A4", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
      <div className="ds-num" style={{ fontSize: 22, fontWeight: 700, color: color || "#0F1A36", marginTop: 5, letterSpacing: "-0.02em" }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 3 }}>{sub}</div>}
    </div>
  );
}

function HistoryRow({ year, period, obj, grade, achievement, diff }: { year: string; period: string; obj: string; grade: string; achievement: string; diff: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 60px 64px 80px", alignItems: "center", gap: 12, padding: "14px 16px", borderBottom: "1px solid #ECEFF5" }}>
      <span className="mono" style={{ fontSize: 12, color: "#5B6685", fontWeight: 600 }}>{year} <span style={{ color: "#A4ADC4" }}>· {period}</span></span>
      <div style={{ fontSize: 13, color: "#0F1A36", fontWeight: 500 }}>{obj}</div>
      <span className="mono" style={{ padding: "3px 0", borderRadius: 6, background: "var(--page-bg)", color: "#5B6685", fontSize: 11, fontWeight: 600, textAlign: "center" }}>{diff}</span>
      <span className="mono" style={{ padding: "5px 0", borderRadius: 7, background: GRADE_COLORS[grade], color: "#fff", fontSize: 13, fontWeight: 700, textAlign: "center" }}>{grade}</span>
      <span className="mono" style={{ fontWeight: 700, color: "#0F1A36", textAlign: "right" }}>{achievement}%</span>
    </div>
  );
}

function TimelineEvent({ icon, bg, fg, title, when, detail }: { icon: string; bg: string; fg: string; title: string; when: string; detail: string }) {
  return (
    <div style={{ display: "flex", gap: 12, position: "relative" }}>
      <div style={{ width: 32, height: 32, borderRadius: 10, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0, zIndex: 1, border: "2px solid #fff" }}>{icon}</div>
      <div style={{ flex: 1, paddingBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
          <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{title}</div>
          <div className="mono" style={{ fontSize: 11.5, color: "#7C87A4" }}>{when}</div>
        </div>
        <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.6 }}>{detail}</div>
      </div>
    </div>
  );
}

export default function R2MemberPage() {
  return (
    <RoleShell
      role="R2"
      title="팀원 상세"
      subtitle="김지훈 · E1024 · 운영본부 결제플랫폼팀"
      actions={<Button variant="primary" size="sm" leftIcon={<span>📋</span>} onClick={() => alert("OKR 검토로 이동은 준비 중이에요 🙂")}>OKR 검토</Button>}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "#5B6685" }}>
        <Link href="/r2" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><span>←</span> 대시보드</Link>
        <span style={{ color: "#C8CFDF" }}>/</span>
        <span style={{ color: "#0F1A36", fontWeight: 600 }}>김지훈</span>
      </div>

      {/* Profile header */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "24px 28px", marginBottom: 20, display: "flex", gap: 24, alignItems: "center" }}>
        <div style={{ width: 84, height: 84, borderRadius: "50%", background: "linear-gradient(135deg, #3B5BDB, #5C7AE6)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 32, flexShrink: 0 }}>김</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
            <h1 style={{ margin: 0, fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>김지훈</h1>
            <span className="mono" style={{ fontSize: 13, color: "#7C87A4" }}>E1024 · 4급갑 · SE</span>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: "#FFF7EC", border: "1px solid #FFE0BA", color: "#D98023", fontSize: 11.5, fontWeight: 600 }}>🎯 집중코칭</span>
          </div>
          <div style={{ marginTop: 8, display: "flex", gap: 18, fontSize: 13, color: "#5B6685", flexWrap: "wrap" }}>
            <span><b style={{ color: "#0F1A36" }}>운영본부</b> · 결제플랫폼팀</span>
            <span style={{ color: "#C8CFDF" }}>·</span>
            <span>업무군 <b style={{ color: "#0F1A36" }}>성능/튜닝</b></span>
            <span style={{ color: "#C8CFDF" }}>·</span>
            <span>입사 <b style={{ color: "#0F1A36" }}>2018</b></span>
          </div>
        </div>
        <Button variant="secondary" leftIcon={<span>💬</span>} onClick={() => alert("1on1 예약은 준비 중이에요 🙂")}>1on1 예약</Button>
      </div>

      {/* Metric strip */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 24px", marginBottom: 20 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14 }}>
          <MetricMini label="이번 분기 OKR" value="3" sub="가중치 75/110" />
          <MetricMini label="평균 달성률" value="47%" color="#3B5BDB" sub="↑ 8% 전월" />
          <MetricMini label="최근 등급" value="A" color="#3B5BDB" sub="2025 H2" />
          <MetricMini label="누적 코칭 후보" value="2건" color="#D98023" sub="측정모호·증빙" />
          <MetricMini label="1on1 누적" value="12회" sub="6회/분기 평균" />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20 }}>
        {/* Left */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>2026 하반기 OKR</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginBottom: 14 }}>3개 KR · 평균 달성률 47%</div>
            {[
              { num: 1, status: "승인", bg: "#ECFAF1", fg: "#2F9E5E", kr: "결제 게이트웨이 APM p95 응답속도 850ms → 500ms", progress: 72, color: "#2F9E5E" },
              { num: 2, status: "승인", bg: "#ECFAF1", fg: "#2F9E5E", kr: "결제 인증모듈 단위테스트 커버리지 65% → 85%", progress: 45, color: "#3B5BDB" },
              { num: 3, status: "제출", bg: "#EFF4FE", fg: "#2B5DD9", kr: "장애 알림 룰 자동화 마일스톤 4단계 중 3단계 완료", progress: 25, color: "#D98023" },
            ].map((o, i) => (
              <div key={o.num} style={{ padding: "12px 0", borderTop: i > 0 ? "1px solid #ECEFF5" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span className="mono" style={{ fontSize: 11, color: "#A4ADC4", fontWeight: 700 }}>{o.num.toString().padStart(2, "0")}</span>
                  <span style={{ padding: "2px 8px", borderRadius: 999, background: o.bg, color: o.fg, fontSize: 10.5, fontWeight: 600 }}>{o.status}</span>
                  <span className="mono ds-num" style={{ marginLeft: "auto", fontWeight: 700, fontSize: 14, color: o.color }}>{o.progress}%</span>
                </div>
                <div style={{ fontSize: 13.5, color: "#0F1A36", marginBottom: 8, lineHeight: 1.5 }}>{o.kr}</div>
                <div style={{ height: 6, background: "var(--page-bg)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${o.progress}%`, background: o.color, borderRadius: 3 }} /></div>
              </div>
            ))}
          </div>

          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>이전 평가 이력</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginBottom: 12 }}>최근 6분기 추이 · 평가에 참고만 가능</div>
            <div style={{ height: 60, display: "flex", alignItems: "flex-end", gap: 6, marginBottom: 14, padding: "0 4px" }}>
              {[{ v: 60, g: "B", c: "#2F9E5E" }, { v: 70, g: "B", c: "#2F9E5E" }, { v: 75, g: "B", c: "#2F9E5E" }, { v: 88, g: "A", c: "#3B5BDB" }, { v: 92, g: "A", c: "#3B5BDB" }, { v: 47, g: "—", c: "#A4ADC4", cur: true }].map((b, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: `${b.v * 0.55}px`, background: b.c, borderRadius: "4px 4px 0 0", opacity: b.cur ? 0.5 : 1 }} />
                  <div className="mono" style={{ fontSize: 10, fontWeight: 700, color: b.cur ? "#A4ADC4" : "#5B6685" }}>{b.g}</div>
                </div>
              ))}
            </div>
            <div style={{ borderTop: "1px solid #ECEFF5" }}>
              <HistoryRow year="2025" period="H2" obj="장애 운영 안정화 · MTTR 15분" diff="중" grade="A" achievement="92" />
              <HistoryRow year="2025" period="H1" obj="배포 자동화 · 시간 25→8분" diff="중" grade="A" achievement="88" />
              <HistoryRow year="2024" period="H2" obj="DB 성능 개선 · 쿼리 220→130ms" diff="중" grade="B" achievement="75" />
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#00A968", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>✨</div>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 700 }}>AI 코칭 제안</div>
                <div style={{ fontSize: 11.5, color: "#7CE9BE", marginTop: 2 }}>김지훈 님 맞춤 인사이트</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#D9F4E7", lineHeight: 1.65, marginBottom: 14 }}>최근 2회 연속 <b style={{ color: "#fff" }}>A등급</b>이에요. 다음 분기 KR은 도전성 한 단계 상향을 검토해보세요. 단, KR 03 마일스톤 산출물 보완이 우선이에요.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {["1on1에서 KR 03 산출물 정의 함께 검토", "다음 분기 도전성 +1단계 제안 준비", "APM 증빙 자료 첨부 가이드 공유"].map((a) => (
                <div key={a} style={{ display: "flex", gap: 7, fontSize: 12, color: "#B9F1D8" }}><span style={{ color: "#7CE9BE" }}>·</span> {a}</div>
              ))}
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36", marginBottom: 16 }}>최근 활동 타임라인</div>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: 15, top: 16, bottom: 16, width: 2, background: "#ECEFF5", zIndex: 0 }} />
              <TimelineEvent icon="📥" bg="#EFF4FE" fg="#2B5DD9" title="KR 03 제출됨" when="07/12 14:32" detail="장애 알림 룰 자동화 KR을 검토 대기로 제출했어요." />
              <TimelineEvent icon="📈" bg="#ECFAF1" fg="#2F9E5E" title="KR 01 진행률 +8% 업데이트" when="07/08 09:15" detail="64% → 72% · DB 인덱스 최적화 + 캐시 적용" />
              <TimelineEvent icon="✨" bg="#F0E9FB" fg="#7C4DD9" title="AI 코칭 1회 진행" when="07/15 14:21" detail="&ldquo;KR 01 진행 점검&rdquo; 주제로 3개 액션 아이템 추출" />
              <TimelineEvent icon="💬" bg="#FFEDE2" fg="#E07A3C" title="1on1 미팅 진행" when="07/02" detail="분기 중간 점검 · 다음 1on1 07/22 예정" />
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
