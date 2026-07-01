"use client";

import Link from "next/link";
import { RoleShell } from "@/components/RoleShell";

interface Sheet { no: string; name: string; desc: string; rows: number; included: boolean; lite?: boolean }
const MVP: Sheet[] = [
  { no: "0", name: "안내 · 표지", desc: "평가 기간 · 운영안 비중 · 검토 대상 · 산출 일자", rows: 1, included: true },
  { no: "1", name: "현황 · 본부 형평성", desc: "본부별 KR 건수 · 승인율 · 코칭 후보 비율", rows: 14, included: true },
  { no: "2", name: "검토 기준", desc: "11항목 체크리스트 + 위험 태그 + criteria 버전", rows: 11, included: true },
  { no: "3", name: "난이도 분포", desc: "본부 × 직급 매트릭스 + 의존 플래그 KR 목록", rows: 42, included: true },
];
const PHASE2: Sheet[] = [
  { no: "4", name: "등급 분포 사전 시뮬레이션", desc: "강제배분 미리보기 (S5/A10/B75/C≤10)", rows: 0, included: false, lite: true },
  { no: "5", name: "루브릭 · 기준 카드", desc: "등급별 판단 기준 산출물 카드", rows: 0, included: false, lite: true },
  { no: "D", name: "참고 · 쟁점 태그", desc: "코칭 후보 KR 사례 카드", rows: 0, included: false, lite: true },
];

function SheetItem({ s }: { s: Sheet }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", background: "#fff", border: `1px solid ${s.included ? "#BBE9CC" : "#E1E5EF"}`, borderRadius: 12, marginBottom: 10 }}>
      <div style={{ width: 22, height: 22, borderRadius: 6, background: s.included ? "#2F9E5E" : "#fff", border: s.included ? "none" : "1px solid #C8CFDF", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>{s.included && "✓"}</div>
      <div className="mono" style={{ width: 40, height: 40, borderRadius: 9, background: s.included ? "#ECFAF1" : "var(--page-bg)", color: s.included ? "#2F9E5E" : "#7C87A4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>{s.no}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: s.included ? "#0F1A36" : "#7C87A4" }}>{s.name}</span>
          <span style={{ padding: "1px 7px", borderRadius: 5, background: s.lite ? "#FFF7EC" : "#F1F4FD", color: s.lite ? "#D98023" : "#213A8C", fontSize: 10, fontWeight: 700 }}>{s.lite ? "lite" : "MVP"}</span>
        </div>
        <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3, lineHeight: 1.55 }}>{s.desc}</div>
      </div>
      <div className="mono" style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 600 }}>{s.rows} rows</div>
    </div>
  );
}

export default function R3ExportPage() {
  return (
    <RoleShell role="R3" title="산출물 내보내기" subtitle="INSIGHT · 캘리브레이션 진행파일을 Excel로">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 22, fontSize: 13, color: "#5B6685" }}>
        <Link href="/r3" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}><span>←</span> 캘리브레이션 인사이트</Link>
        <span style={{ color: "#C8CFDF" }}>/</span>
        <span style={{ color: "#0F1A36", fontWeight: 600 }}>산출물 내보내기</span>
      </div>

      <div style={{ marginBottom: 30, maxWidth: 820 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>INSIGHT · Excel</div>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.25 }}>캘리브레이션 진행파일을 다운로드해요</h1>
        <p style={{ margin: "14px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.7 }}>평가자 회의에서 그대로 사용할 수 있도록 Excel로 정리해드려요. 핵심 4시트는 지금 사용 가능하고, 풀 시트는 Phase 2에서 추가됩니다.</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>
        <div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>포함할 시트</h2>
            <span style={{ padding: "3px 9px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11.5, fontWeight: 700 }}>4개 선택됨</span>
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>● 간이 4시트 (MVP)</div>
          {MVP.map((s) => <SheetItem key={s.no} s={s} />)}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#A4ADC4", letterSpacing: "0.06em", textTransform: "uppercase", margin: "14px 0 10px" }}>○ 추가 시트 (Phase 2)</div>
          {PHASE2.map((s) => <SheetItem key={s.no} s={s} />)}

          {/* Validation gate — deep ink */}
          <div style={{ padding: "18px 20px", background: "linear-gradient(135deg, #0A1F17, #14342B)", color: "#fff", borderRadius: 14, marginTop: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,169,104,0.25)", color: "#7CE9BE", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡️</div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>발행 전 검증 게이트</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {["사람 확인 게이트 통과 (3건 / 3건)", "합산 정합성 검증 통과", "표준 포맷팅 적용"].map((c) => (
                <div key={c} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#D9F4E7" }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: "#00A968", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>{c}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>📄 다운로드 미리보기</div>
            <div style={{ padding: "16px 18px", background: "linear-gradient(135deg, #ECFAF1, #fff 80%)", border: "1px solid #BBE9CC", borderRadius: 11 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div className="mono" style={{ width: 42, height: 50, borderRadius: 7, background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>XLSX</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1F5538", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>2026_하반기_캘리브레이션.xlsx</div>
                  <div className="mono" style={{ fontSize: 11, color: "#2F6B48", marginTop: 3 }}>~ 286 KB · 4시트 · UTF-8</div>
                </div>
              </div>
              <div style={{ fontSize: 11.5, color: "#2F6B48", lineHeight: 1.6 }}>68행 / 평가 기간 2026.07.01 ~ 07.30 / 본부 14개</div>
            </div>
          </div>

          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>⚙️ 옵션</div>
            <div style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 600, marginBottom: 7 }}>대상 기간</div>
            <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
              {["2026 H2", "2026 H1", "2025 H2"].map((p, i) => (
                <button key={p} style={{ flex: 1, padding: "8px 0", background: i === 0 ? "#E07A3C" : "var(--page-bg)", color: i === 0 ? "#fff" : "#5B6685", border: i === 0 ? "none" : "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, fontWeight: i === 0 ? 600 : 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>{p}</button>
              ))}
            </div>
            <div style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 600, marginBottom: 7 }}>포맷 옵션</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[["표준 포맷팅 적용", true], ["사번/이름 비식별 처리", false], ["변경 이력 별도 시트 포함", false]].map(([l, on]) => (
                <label key={l as string} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#3A4565", cursor: "pointer" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, background: on ? "#E07A3C" : "#fff", border: on ? "none" : "1px solid #C8CFDF", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 700 }}>{on && "✓"}</div>{l}
                </label>
              ))}
            </div>
          </div>

          <button onClick={() => alert("Excel 다운로드는 준비 중이에요 🙂 (실 데이터 연동 후 활성화)")} style={{ width: "100%", background: "#2F9E5E", color: "#fff", border: "none", borderRadius: 12, padding: "16px 20px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "0 6px 16px -4px rgba(47,158,94,.35)" }}>📥 Excel 다운로드 (4시트 · 286KB)</button>

          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>📚 최근 발행 이력</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[["07/12", "2026 H2 중간 점검", "284KB"], ["06/28", "2026 H1 최종", "212KB"], ["01/15", "2025 H2 최종", "318KB"]].map(([d, n, s]) => (
                <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", background: "#F9FAFC", borderRadius: 9 }}>
                  <span className="mono" style={{ fontSize: 11, color: "#5B6685", fontWeight: 600 }}>{d}</span>
                  <span style={{ fontSize: 12, color: "#1F2A4A", fontWeight: 500, flex: 1 }}>{n}</span>
                  <span className="mono" style={{ fontSize: 10.5, color: "#A4ADC4" }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </RoleShell>
  );
}
