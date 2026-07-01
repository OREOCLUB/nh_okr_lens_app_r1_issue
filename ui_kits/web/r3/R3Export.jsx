// R3Export.jsx — 산출물 내보내기 (Excel) v3.4 신규

function SheetItem({ no, name, desc, rows, included, lite }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 14,
      padding: "16px 18px",
      background: "#fff",
      border: `1px solid ${included ? "#BBE9CC" : "#E1E5EF"}`,
      borderRadius: 12,
      marginBottom: 10,
    }}>
      {/* Checkbox */}
      <div style={{
        width: 22, height: 22, borderRadius: 6,
        background: included ? "#2F9E5E" : "#fff",
        border: included ? "none" : "1px solid #C8CFDF",
        color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700,
        flexShrink: 0,
        cursor: "pointer",
      }}>{included && "✓"}</div>

      {/* Sheet number */}
      <div style={{
        width: 40, height: 40, borderRadius: 9,
        background: included ? "#ECFAF1" : "#F4F7FB",
        color: included ? "#2F9E5E" : "#7C87A4",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700,
        flexShrink: 0,
      }}>{no}</div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: included ? "#0F1A36" : "#7C87A4" }}>{name}</span>
          {lite && <span style={{ padding: "1px 7px", borderRadius: 5, background: "#FFF7EC", color: "#D98023", fontSize: 10, fontWeight: 700 }}>lite</span>}
          {!lite && <span style={{ padding: "1px 7px", borderRadius: 5, background: "#F1F4FD", color: "#213A8C", fontSize: 10, fontWeight: 700 }}>MVP</span>}
        </div>
        <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3, lineHeight: 1.55 }}>{desc}</div>
      </div>

      {/* Rows count */}
      <div style={{ fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#5B6685", fontWeight: 600 }}>{rows} rows</div>
    </div>
  );
}

function R3Export() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="산출물 내보내기" subtitle="INSIGHT · 05 · 캘리브레이션 진행파일을 Excel로"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "36px 48px 48px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24, fontSize: 13, color: "#5B6685" }}>
          <a href="./r3-hr.html" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
            <span>←</span> 캘리브레이션 인사이트
          </a>
          <span style={{ color: "#C8CFDF" }}>/</span>
          <span style={{ color: "#0F1A36", fontWeight: 600 }}>산출물 내보내기</span>
        </div>

        {/* Hero */}
        <div style={{ marginBottom: 36, maxWidth: 820 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 10 }}>INSIGHT 05 · Excel</div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.25 }}>
            캘리브레이션 진행파일을 다운로드해요
          </h1>
          <p style={{ margin: "14px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.7 }}>
            평가자 회의에서 그대로 사용할 수 있도록 Excel로 정리해드려요. 핵심 4시트 (간이)는 지금 사용 가능하고, 풀 11시트는 Phase 2에서 추가됩니다.
          </p>
        </div>

        {/* Layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 24 }}>

          {/* Left — sheet selection */}
          <div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#0F1A36" }}>포함할 시트</h2>
              <span style={{ padding: "3px 9px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11.5, fontWeight: 700 }}>4개 선택됨</span>
            </div>

            {/* MVP sheets */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>● 간이 4시트 (MVP)</div>
              <SheetItem no="0" name="안내 · 표지" desc="평가 기간 · 운영안 비중 · 검토 대상 · 산출 일자" rows={1} included/>
              <SheetItem no="1" name="현황 · 부간 형평성" desc="본부별 KR 건수 · 승인율 · 코칭 후보 비율" rows={14} included/>
              <SheetItem no="2" name="검토 기준" desc="11항목 체크리스트 + 위험 태그 + criteria 버전" rows={11} included/>
              <SheetItem no="3" name="난이도 분포" desc="본부 × 직급 매트릭스 + ④⑥의존 플래그 KR 목록" rows={42} included/>
            </div>

            {/* Phase 2 sheets */}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#A4ADC4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>○ 추가 7시트 (Phase 2)</div>
              <SheetItem no="4" name="등급 분포 사전 시뮬레이션" desc="강제배분 미리보기 (S5/A10/B75/C≤10)" rows={0} included={false} lite/>
              <SheetItem no="5" name="루브릭 · 기준 카드" desc="등급별 판단 기준 산출물 카드" rows={0} included={false} lite/>
              <SheetItem no="D" name="참고 · 쟁점 태그" desc="C01·C05·C06·C11·④⑥의존 KR 사례" rows={0} included={false} lite/>
            </div>

            {/* Validation gate */}
            <div style={{
              padding: "18px 20px",
              background: "linear-gradient(135deg, #1B2A4E, #2C3E68)",
              color: "#fff", borderRadius: 14,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(145,166,240,0.22)", color: "#C5D0F7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🛡️</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>발행 전 검증 게이트</div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { ok: true, label: "사람 확인 게이트 통과 (3건 / 3건)" },
                  { ok: true, label: "합산 정합성 검증 통과" },
                  { ok: true, label: "맑은고딕 · 네이비 #1F3864 포맷팅 적용" },
                ].map((c, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#E5EBFB" }}>
                    <span style={{ width: 18, height: 18, borderRadius: 5, background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✓</span>
                    {c.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right — settings + download */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* File preview */}
            <div style={{
              background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
              padding: "20px 22px",
            }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>📄 다운로드 미리보기</div>

              {/* Mock file card */}
              <div style={{
                padding: "16px 18px",
                background: "linear-gradient(135deg, #ECFAF1, #fff 80%)",
                border: "1px solid #BBE9CC", borderRadius: 11,
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 50, borderRadius: 7, background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0 }}>XLSX</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1F5538", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>2026_상반기_캘리브레이션.xlsx</div>
                    <div style={{ fontSize: 11, color: "#2F6B48", marginTop: 3, fontFamily: "var(--font-mono)" }}>~ 286 KB · 4시트 · UTF-8</div>
                  </div>
                </div>
                <div style={{ fontSize: 11.5, color: "#2F6B48", lineHeight: 1.6 }}>
                  68행 / 평가 기간 2026.06.01 ~ 06.19 / 본부 14개 / 운영본부 결제플랫폼팀 외 13개팀
                </div>
              </div>
            </div>

            {/* Settings */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 14 }}>⚙️ 옵션</div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 600, marginBottom: 7 }}>대상 기간</div>
                  <div style={{ display: "flex", gap: 5 }}>
                    <button style={{ flex: 1, padding: "8px 0", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)" }}>2026 H1</button>
                    <button style={{ flex: 1, padding: "8px 0", background: "#F4F7FB", color: "#5B6685", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>2025 H2</button>
                    <button style={{ flex: 1, padding: "8px 0", background: "#F4F7FB", color: "#5B6685", border: "1px solid #E1E5EF", borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "var(--font-sans)" }}>2025 H1</button>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 600, marginBottom: 7 }}>본부 범위</div>
                  <div style={{ padding: "8px 12px", background: "#F4F7FB", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12.5, color: "#1F2A4A", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>전 본부 (14개)</span>
                    <Icon name="chevronDown" size={12} style={{ color: "#A4ADC4" }}/>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 600, marginBottom: 7 }}>포맷 옵션</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { l: "맑은고딕 · 네이비 #1F3864", on: true },
                      { l: "사번/이름 비식별 처리", on: false },
                      { l: "변경 이력 별도 시트 포함", on: false },
                    ].map((c, i) => (
                      <label key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#3A4565", cursor: "pointer" }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5,
                          background: c.on ? "#3B5BDB" : "#fff",
                          border: c.on ? "none" : "1px solid #C8CFDF",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "#fff", fontSize: 11, fontWeight: 700,
                        }}>{c.on && "✓"}</div>
                        {c.l}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Download CTA */}
            <button style={{
              width: "100%",
              background: "#2F9E5E", color: "#fff", border: "none",
              borderRadius: 12, padding: "16px 20px",
              fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              boxShadow: "0 6px 16px -4px rgba(47,158,94,.35)",
            }}>
              📥 Excel 다운로드 (4시트 · 286KB)
            </button>

            {/* Past exports */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>📚 최근 발행 이력</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { date: "07/12", note: "2026 H1 중간 점검", size: "284KB" },
                  { date: "06/28", note: "2026 H1 초기 분석", size: "212KB" },
                  { date: "01/15", note: "2025 H2 최종", size: "318KB" },
                ].map((h, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 12px", background: "#F9FAFC", borderRadius: 9,
                  }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#5B6685", fontWeight: 600 }}>{h.date}</span>
                    <span style={{ fontSize: 12, color: "#1F2A4A", fontWeight: 500, flex: 1 }}>{h.note}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#A4ADC4" }}>{h.size}</span>
                    <button style={{ width: 22, height: 22, borderRadius: 6, background: "#fff", border: "1px solid #E1E5EF", color: "#5B6685", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)" }}>↓</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R3Export = R3Export;
