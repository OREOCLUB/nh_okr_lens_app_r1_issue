"use client";

import { useEffect, useState } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";
import { getMetrics, type Metric } from "@/lib/dataAccess";

const STATUS: Record<string, { bg: string; bd: string; fg: string }> = {
  "수집": { bg: "#F1F3F8", bd: "#E1E5EF", fg: "#5B6685" },
  "검토중": { bg: "#FFF7EC", bd: "#FFE0BA", fg: "#D98023" },
  "표준승인": { bg: "#ECFAF1", bd: "#BBE9CC", fg: "#2F9E5E" },
  "비권장": { bg: "#FFF0F0", bd: "#FFD4D4", fg: "#D14343" },
};

const METRICS: Metric[] = [
  { id: "M_PERF_001", name: "APM p95 응답속도 (ms)", status: "표준승인", category: "프로세스", group: "성능/튜닝", definition: "외부 사용자가 체감하는 응답 지연의 상위 5% 값. 단순 평균보다 사용자 경험을 더 정확히 반영합니다.", formula: "P95(response_time) · 월평균", unit: "ms", usage: 87, orgs: 6, exampleKR: "결제 게이트웨이 APM p95 응답속도 850ms → 500ms" },
  { id: "M_QUAL_004", name: "단위테스트 커버리지 (%)", status: "표준승인", category: "품질", group: "개발/요건", definition: "실행된 코드 라인이 전체 코드 라인에서 차지하는 비율. 회귀 리스크의 대표 선행 지표입니다.", formula: "covered_lines / total_lines × 100", unit: "%", usage: 64, orgs: 4, exampleKR: "결제 인증 모듈 단위테스트 커버리지 65% → 85%" },
  { id: "M_OPS_007", name: "MTTR · 평균 복구 시간", status: "표준승인", category: "리스크", group: "장애/운영안정", definition: "장애 발생 시점부터 정상 복구 시점까지 평균 시간. 운영 안정성의 핵심 지표.", formula: "SUM(recovery_time) / 장애 건수", unit: "분", usage: 58, orgs: 5, exampleKR: "P1 장애 MTTR 평균 35분 → 15분 단축" },
  { id: "M_OPS_012", name: "배포 자동화 비율 (%)", status: "검토중", category: "생산성", group: "자동화", definition: "전체 배포 중 자동 파이프라인으로 진행된 비율. 운영 효율과 휴먼 에러 감소의 대표 지표.", formula: "auto_deploys / total_deploys × 100", unit: "%", usage: 42, orgs: 3, exampleKR: "결제 시스템 배포 자동화 비율 60% → 90%" },
  { id: "M_SEC_003", name: "권한 점검 완료율 (%)", status: "검토중", category: "리스크", group: "보안/권한", definition: "분기 권한 점검 대상 중 점검이 완료된 비율. 보안 거버넌스 지표.", formula: "completed / scheduled × 100", unit: "%", usage: 28, orgs: 2, exampleKR: "분기 권한 점검 자동화 도입 · 완료율 70% → 95%" },
  { id: "M_PROD_009", name: "회의 횟수 (분기)", status: "비권장", category: "생산성", group: "고객/사업기여", definition: "분기 동안 진행한 회의 횟수. 활동량 지표로, 결과 지표가 함께 있어야 권장됩니다.", formula: "COUNT(meetings) WHERE quarter", unit: "회", usage: 14, orgs: 2, warnings: ["건수형"], exampleKR: "고객 미팅 횟수 분기 30회 이상 유지" },
];

const KPIS = [
  { ico: "📊", bg: "#E5EBFB", fg: "#3B5BDB", label: "전체 지표", val: "284", sub: "수집 완료" },
  { ico: "✓", bg: "#ECFAF1", fg: "#2F9E5E", label: "표준 승인", val: "47", sub: "배포 가능" },
  { ico: "⏱", bg: "#FFF7EC", fg: "#D98023", label: "검토 중", val: "32", sub: "큐레이션 대기" },
  { ico: "!", bg: "#FFF0F0", fg: "#D14343", label: "비권장", val: "18", sub: "건수형·자기보고" },
  { ico: "🔄", bg: "#F0E9FB", fg: "#7C4DD9", label: "중복 추정", val: "12", sub: "통합 검토 권장" },
];

function MetricCard({ m }: { m: Metric }) {
  const s = STATUS[m.status];
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", boxShadow: "var(--shadow-xs)", display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
          <span className="mono" style={{ fontSize: 11, color: "#7C87A4" }}>{m.id}</span>
          <span style={{ padding: "3px 9px", borderRadius: 999, background: s.bg, border: `1px solid ${s.bd}`, color: s.fg, fontSize: 11, fontWeight: 600 }}>{m.status}</span>
          {m.warnings?.map((w) => <span key={w} style={{ padding: "2px 7px", borderRadius: 5, background: "#FFF0F0", color: "#D14343", fontSize: 10, fontWeight: 700 }}>{w}</span>)}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em", lineHeight: 1.4 }}>{m.name}</div>
        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
          <span style={{ padding: "1px 7px", borderRadius: 5, background: "#F1F4FD", color: "#213A8C", fontSize: 10, fontWeight: 600 }}>{m.category}</span>
          <span style={{ padding: "1px 7px", borderRadius: 5, background: "#FFEDE2", color: "#E07A3C", fontSize: 10, fontWeight: 600 }}>{m.group}</span>
        </div>
      </div>
      <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.55, paddingTop: 8, borderTop: "1px solid #ECEFF5" }}>{m.definition}</div>
      <div className="mono" style={{ padding: "10px 12px", background: "#F9FAFC", borderRadius: 8, fontSize: 12, color: "#1F2A4A", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ color: "#7C87A4", fontSize: 11 }}>📐</span>
        <span>{m.formula}</span>
        <span style={{ marginLeft: "auto", color: "#7C87A4", fontSize: 11 }}>· 단위 {m.unit}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: 11.5 }}>
        <div>
          <div style={{ color: "#7C87A4", marginBottom: 3 }}>사용 빈도</div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ flex: 1, height: 5, background: "var(--page-bg)", borderRadius: 3, overflow: "hidden" }}><div style={{ height: "100%", width: `${Math.min(m.usage, 100)}%`, background: "#3B5BDB", borderRadius: 3 }} /></div>
            <span className="mono" style={{ fontWeight: 700, color: "#0F1A36" }}>{m.usage}</span>
          </div>
        </div>
        <div>
          <div style={{ color: "#7C87A4", marginBottom: 3 }}>사용 조직</div>
          <div className="mono" style={{ fontWeight: 700, color: "#0F1A36" }}>{m.orgs}개 본부</div>
        </div>
      </div>
      <div style={{ padding: "10px 12px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 8, fontSize: 11.5, color: "#3A4565", lineHeight: 1.5 }}>
        <div style={{ fontSize: 9.5, fontWeight: 700, color: "#0A6B44", letterSpacing: "0.04em", marginBottom: 3 }}>📌 대표 KR 예시</div>
        {m.exampleKR}
      </div>
    </div>
  );
}

export default function R3MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>(METRICS);

  useEffect(() => {
    getMetrics().then((m) => m && setMetrics(m));
  }, []);

  return (
    <RoleShell
      role="R3"
      title="표준 지표 라이브러리"
      subtitle="284개 지표 · 47개 표준 승인"
      actions={<Button variant="ai" size="sm" leftIcon={<span>✨</span>} onClick={() => alert("AI 정규화 실행은 준비 중이에요 🙂")}>AI 정규화 실행</Button>}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>플라이휠 · 수집 → 정규화 → 큐레이션 → 배포</div>
        <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>평가 지표의 표준을 함께 쌓아갑니다</h1>
        <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>KR 안의 측정지표만 추출·정규화해요. KR 자체를 재작성하지는 않습니다.</p>
      </div>

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 22 }}>
        {KPIS.map((s) => (
          <div key={s.label} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{ width: 30, height: 30, borderRadius: 9, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700 }}>{s.ico}</div>
              <div style={{ fontSize: 12, color: "#5B6685", fontWeight: 500 }}>{s.label}</div>
            </div>
            <div className="ds-num" style={{ fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em", lineHeight: 1.1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Metric grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {metrics.map((m) => <MetricCard key={m.id} m={m} />)}
      </div>

      {/* Flywheel */}
      <div style={{ marginTop: 22, padding: "22px 24px", background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(0,169,104,0.25)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>🔄</div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>지표 표준화 플라이휠</div>
            <div style={{ fontSize: 11.5, color: "#7CE9BE", marginTop: 2 }}>4단계 라이프사이클로 표준을 키워갑니다</div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
          {[
            { num: "1", label: "수집", desc: "KR에서 측정지표만 추출", count: "284건" },
            { num: "2", label: "정규화", desc: "5체크: 의미·계산식·출처·실제·통합", count: "237건" },
            { num: "3", label: "큐레이션", desc: "표준 명칭 · 건수형/자기보고 비권장", count: "65건" },
            { num: "4", label: "배포", desc: "R1 추천 지표로 라이브러리 연계", count: "47건" },
          ].map((p) => (
            <div key={p.num} style={{ padding: 14, background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <div className="mono" style={{ width: 24, height: 24, borderRadius: 7, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11 }}>{p.num}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.label}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "#B9F1D8", lineHeight: 1.5, marginBottom: 8 }}>{p.desc}</div>
              <div className="mono" style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{p.count}</div>
            </div>
          ))}
        </div>
      </div>
    </RoleShell>
  );
}
