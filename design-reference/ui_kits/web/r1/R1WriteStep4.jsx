// STEP 4 — KR 형태 선택 (4가지)

function FormatCard({ icon, title, badge, desc, useCases, example, structure, selected, accent, recommended }) {
  return (
    <div style={{
      background: selected ? "#fff" : "#F9FAFC",
      border: `2px solid ${selected ? accent : "#E1E5EF"}`,
      borderRadius: 16,
      padding: "22px 22px",
      cursor: "pointer",
      transition: "all 220ms ease-out",
      boxShadow: selected ? `0 16px 32px -10px ${accent}30` : "0 1px 2px rgba(31,42,74,.04)",
      position: "relative",
      display: "flex", flexDirection: "column", gap: 14,
      height: "100%",
    }}>
      {recommended && (
        <div style={{ position: "absolute", top: -10, left: 18, padding: "3px 10px", background: "#D98023", color: "#fff", borderRadius: 999, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.02em" }}>
          이 KR엔 추천
        </div>
      )}
      {selected && (
        <div style={{ position: "absolute", top: 14, right: 14, width: 24, height: 24, borderRadius: "50%", background: accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>✓</div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: selected ? accent : "#fff", color: selected ? "#fff" : accent,
          border: selected ? "none" : `1.5px solid ${accent}30`,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        }}>{icon}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>{title}</div>
          <div style={{ display: "inline-flex", marginTop: 3, padding: "1px 8px", borderRadius: 5, background: `${accent}15`, color: accent, fontSize: 10.5, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{badge}</div>
        </div>
      </div>

      <div style={{ fontSize: 13, color: "#3A4565", lineHeight: 1.6 }}>{desc}</div>

      {/* Structure */}
      <div style={{ padding: "10px 12px", background: "#F4F7FB", borderRadius: 8, fontFamily: "var(--font-mono)", fontSize: 11, color: "#1F2A4A", lineHeight: 1.55 }}>
        <div style={{ color: "#7C87A4", fontSize: 9.5, fontWeight: 700, marginBottom: 4, letterSpacing: "0.04em" }}>STRUCTURE</div>
        {structure}
      </div>

      {/* Example */}
      <div style={{ padding: "11px 13px", background: `${accent}08`, border: `1px solid ${accent}20`, borderRadius: 9 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>📌 예시</div>
        <div style={{ fontSize: 12, color: "#1F2A4A", lineHeight: 1.5 }}>{example}</div>
      </div>

      {/* Use cases */}
      <div style={{ paddingTop: 10, borderTop: "1px solid #ECEFF5" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6 }}>이런 경우에</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {useCases.map((u, i) => (
            <div key={i} style={{ fontSize: 11.5, color: "#3A4565", lineHeight: 1.5, display: "flex", gap: 6 }}>
              <span style={{ color: accent, fontWeight: 700 }}>·</span> {u}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function R1WriteStep4() {
  const [selected, setSelected] = React.useState({ kr1: "수치", kr2: "수치", kr3: "마일스톤" });

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="OKR 작성" subtitle="STEP 4 / 7 · KR 형태 선택"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 32px" }}>

        <WizardBreadcrumb stepLabel="STEP 4 · KR 형태"/>
        <WizardStepHeader current={4}/>
        <WizardHero
          stepNum={4}
          title="각 KR의 측정 형태를 정해요"
          desc="KR마다 가장 적합한 측정 형태를 골라주세요. AI가 정제 결과를 바탕으로 추천드릴게요."
        />

        {/* KR Selector tabs */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px", marginBottom: 18 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3A4565", marginBottom: 10 }}>지금 형태를 정하는 KR</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {[
              { id: "kr1", num: "01", text: "결제 게이트웨이 APM p95 응답속도 850ms → 500ms", recommended: "수치", active: true },
              { id: "kr2", num: "02", text: "결제 인증모듈 단위테스트 커버리지 65% → 85%", recommended: "수치" },
              { id: "kr3", num: "03", text: "장애 알림 룰 자동화 4단계 중 3단계까지 완료", recommended: "마일스톤" },
            ].map((k) => {
              const sel = selected[k.id];
              return (
                <div key={k.id} style={{
                  padding: "12px 14px", borderRadius: 11,
                  background: k.active ? "#F1F4FD" : "#F9FAFC",
                  border: `1.5px solid ${k.active ? "#3B5BDB" : "#ECEFF5"}`,
                  display: "flex", flexDirection: "column", gap: 6,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: k.active ? "#213A8C" : "#7C87A4", fontWeight: 700 }}>KR {k.num}</span>
                    {sel && <span style={{ padding: "1px 6px", borderRadius: 4, background: "#3B5BDB", color: "#fff", fontSize: 9.5, fontWeight: 700 }}>{sel}</span>}
                    {k.active && <span style={{ marginLeft: "auto", padding: "1px 7px", borderRadius: 4, background: "#fff", border: "1px solid #C5D0F7", color: "#213A8C", fontSize: 9.5, fontWeight: 700 }}>현재</span>}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#3A4565", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{k.text}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4 Format cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
          <div onClick={() => setSelected({ ...selected, kr1: "수치" })}>
            <FormatCard
              icon="📊" title="수치형" badge="NUMERIC"
              accent="#3B5BDB" selected={selected.kr1 === "수치"} recommended
              desc="명확한 baseline과 goal 사이를 수치로 측정. 가장 객관적이고 평가가 쉬워요."
              structure="[지표]를 [baseline] → [goal]로 단축/향상"
              example="APM p95 응답속도 850ms → 500ms"
              useCases={[
                "측정 도구가 이미 있는 정량 지표",
                "응답속도·커버리지·SLA 등",
                "월/주 단위 자동 집계 가능",
              ]}
            />
          </div>
          <div onClick={() => setSelected({ ...selected, kr1: "마일스톤" })}>
            <FormatCard
              icon="🎯" title="마일스톤" badge="MILESTONE"
              accent="#7C4DD9" selected={selected.kr1 === "마일스톤"}
              desc="단계별 산출물로 진행을 측정. 신규 도입·표준화처럼 정량화가 어려운 변화에 적합해요."
              structure="[목표]를 [N단계 중 M단계]까지 완료"
              example="K8s 전환 마일스톤 4단계 중 3단계 완료"
              useCases={[
                "신규 도입·시스템 전환",
                "단계가 명확히 정의됨",
                "각 단계의 산출물이 검증 가능",
              ]}
            />
          </div>
          <div onClick={() => setSelected({ ...selected, kr1: "루브릭" })}>
            <FormatCard
              icon="📋" title="루브릭" badge="RUBRIC"
              accent="#E07A3C" selected={selected.kr1 === "루브릭"}
              desc="S/A/B/C/D 등급별 기준을 미리 정의. 질적 평가가 필요하지만 합의된 기준이 있을 때 좋아요."
              structure="등급별 [기준 / 산출물 수준]을 정의"
              example="문서 완성도: S=감사 통과 / A=인프라팀 리뷰 통과"
              useCases={[
                "문서·매뉴얼·표준 수립",
                "수치화 어려운 품질 지표",
                "고정된 평가 기준 합의 가능",
              ]}
            />
          </div>
          <div onClick={() => setSelected({ ...selected, kr1: "이산" })}>
            <FormatCard
              icon="✓" title="이산형" badge="DISCRETE"
              accent="#2F9E5E" selected={selected.kr1 === "이산"}
              desc="달성/미달성 이분법으로 명확히 판단되는 KR. 시한·완료 여부가 중요한 경우에 적합해요."
              structure="[목표]를 [기한]까지 [달성 / 미달성]"
              example="신규 결제수단(BNPL) 베타 6월 말 런칭"
              useCases={[
                "출시·런칭처럼 명확한 완료점",
                "법규/규정 준수 (예/아니오)",
                "외부 일정에 묶인 작업",
              ]}
            />
          </div>
        </div>

        {/* AI recommendation panel */}
        <div style={{ background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 14, padding: "22px 24px", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>✨</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>AI 형태 추천</div>
              <div style={{ fontSize: 11.5, color: "#91A6F0", marginTop: 2 }}>STEP 3 정제 결과 기반</div>
            </div>
            <span style={{ padding: "4px 10px", background: "rgba(47,158,94,0.22)", color: "#A3E5BD", borderRadius: 7, fontSize: 11, fontWeight: 700 }}>✓ 분석 완료</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
            {[
              { kr: "KR 01", text: "응답속도 단축 (850→500ms)", rec: "수치형", reason: "명확한 baseline·goal 수치 존재", accent: "#3FC1D1" },
              { kr: "KR 02", text: "커버리지 향상 (65→85%)", rec: "수치형", reason: "월별 자동 측정 가능", accent: "#3FC1D1" },
              { kr: "KR 03", text: "알림 자동화 (4단계 중 3단계)", rec: "마일스톤", reason: "단계 산출물이 명확", accent: "#C5A6F5" },
            ].map((k, i) => (
              <div key={i} style={{ padding: "14px 14px", background: "rgba(255,255,255,0.06)", borderRadius: 10 }}>
                <div style={{ fontSize: 10.5, color: "#91A6F0", fontWeight: 700, fontFamily: "var(--font-mono)" }}>{k.kr}</div>
                <div style={{ fontSize: 12, color: "#C5D0F7", marginTop: 4, lineHeight: 1.4, marginBottom: 10 }}>{k.text}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 9px", background: `${k.accent}22`, borderRadius: 6, marginBottom: 8 }}>
                  <span style={{ color: k.accent, fontSize: 11, fontWeight: 700 }}>추천</span>
                  <span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>{k.rec}</span>
                </div>
                <div style={{ fontSize: 10.5, color: "#91A6F0", lineHeight: 1.5 }}>{k.reason}</div>
              </div>
            ))}
          </div>

          <button style={{
            marginTop: 16, width: "100%",
            background: "#fff", color: "#1B2A4E", border: "none",
            borderRadius: 10, padding: "11px", fontSize: 13, fontWeight: 700,
            cursor: "pointer", fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            ✨ 추천대로 일괄 적용
          </button>
        </div>

        {/* Reference table */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px", marginBottom: 22 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <Icon name="library" size={17} style={{ color: "#5B6685" }}/>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>4가지 형태 비교표</div>
              <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>형태별 측정 난이도·평가 명확성·적합 상황</div>
            </div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
            <thead>
              <tr>
                {["형태", "측정 난이도", "평가 명확성", "적합한 영역", "주의 사항"].map((h, i) => (
                  <th key={i} style={{ textAlign: "left", padding: "10px 12px", background: "#F9FAFC", borderBottom: "1px solid #E1E5EF", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { f: "수치형",   icon: "📊", c: "#3B5BDB", diff: "낮음 (자동 측정)", clarity: "매우 명확", area: "성능·SLA·커버리지", warn: "측정 도구 사전 확보 필요" },
                { f: "마일스톤", icon: "🎯", c: "#7C4DD9", diff: "중간 (단계 정의)", clarity: "명확",        area: "신규 도입·전환·표준화", warn: "각 단계 산출물 정의 필수" },
                { f: "루브릭",   icon: "📋", c: "#E07A3C", diff: "높음 (기준 합의)", clarity: "합의 의존",  area: "문서·품질·역량",         warn: "평가자와 사전 기준 합의" },
                { f: "이산형",   icon: "✓",  c: "#2F9E5E", diff: "낮음 (이분법)",   clarity: "매우 명확",  area: "런칭·준수·완료",         warn: "중간 진행도 측정 어려움" },
              ].map((r, i) => (
                <tr key={i} style={{ borderBottom: i < 3 ? "1px solid #ECEFF5" : "none" }}>
                  <td style={{ padding: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 26, height: 26, borderRadius: 7, background: `${r.c}15`, color: r.c, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{r.icon}</span>
                      <span style={{ fontWeight: 600, color: "#0F1A36" }}>{r.f}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px", color: "#3A4565" }}>{r.diff}</td>
                  <td style={{ padding: "12px", color: "#3A4565" }}>{r.clarity}</td>
                  <td style={{ padding: "12px", color: "#3A4565" }}>{r.area}</td>
                  <td style={{ padding: "12px", color: "#7C87A4", fontSize: 11.5 }}>{r.warn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <WizardNav current={4}/>
      </div>
    </main>
  );
}

window.R1WriteStep4 = R1WriteStep4;
