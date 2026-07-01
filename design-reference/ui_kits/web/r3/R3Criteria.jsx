// R3Criteria.jsx — 평가 기준 편집 페이지

function CriteriaNumberField({ label, value, unit, hint, color }) {
  return (
    <div style={{ padding: "16px 18px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12 }}>
      <div style={{ fontSize: 11.5, fontWeight: 600, color: "#5B6685", marginBottom: 8, letterSpacing: "0.02em" }}>{label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <input type="text" defaultValue={value} style={{
          width: 80, padding: "8px 12px",
          background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 8,
          fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700,
          color: color || "#0F1A36", outline: "none",
          fontVariantNumeric: "tabular-nums", textAlign: "right",
        }}/>
        <span style={{ fontSize: 13, color: "#7C87A4", fontWeight: 500 }}>{unit}</span>
      </div>
      {hint && <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 6, lineHeight: 1.5 }}>{hint}</div>}
    </div>
  );
}

function ChecklistRow({ no, text, tag, edited }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px",
      background: edited ? "#FFF7EC" : "#fff",
      border: `1px solid ${edited ? "#FFE0BA" : "#ECEFF5"}`,
      borderRadius: 10,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: 7,
        background: "#F1F4FD", color: "#213A8C",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0,
      }}>{no.toString().padStart(2, "0")}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13.5, fontWeight: 500, color: "#0F1A36" }}>{text}</div>
        <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 3 }}>위험 태그 · <span style={{ fontFamily: "var(--font-mono)", color: "#D14343", fontWeight: 600 }}>{tag}</span></div>
      </div>
      {edited && <span style={{ padding: "2px 8px", borderRadius: 999, background: "#fff", border: "1px solid #FFE0BA", color: "#D98023", fontSize: 10.5, fontWeight: 700 }}>✏️ 수정됨</span>}
      <div style={{ display: "flex", gap: 4 }}>
        <button style={iconBtnR3}><Icon name="edit" size={13}/></button>
        <button style={iconBtnR3}><Icon name="more" size={13}/></button>
      </div>
    </div>
  );
}

const iconBtnR3 = {
  width: 28, height: 28, borderRadius: 7,
  background: "#F9FAFC", border: "1px solid #E1E5EF",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#5B6685",
};

function R3Criteria() {
  const [tab, setTab] = React.useState("checklist");
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="평가 기준 관리" subtitle="criteria v2026.1 · 운영중 · 마지막 수정 3일 전"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "28px 40px 40px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>전사 적용 기준</div>
            <h1 style={{ margin: "8px 0 0", fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              이 기준이 R1·R2 화면을 움직입니다
            </h1>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: "#5B6685" }}>
              체크리스트 한 줄을 수정하면, 피평가자 작성 가이드와 평가자 AI Validation에 즉시 반영돼요.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <Button variant="secondary" leftIcon={<Icon name="library" size={15}/>}>버전 히스토리</Button>
          <Button variant="secondary" leftIcon={<Icon name="library" size={15}/>}>JSON 내보내기</Button>
          <Button variant="primary" leftIcon={<Icon name="check" size={15}/>}>변경사항 저장 (2건)</Button>
        </div>

        {/* Active version card */}
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18, marginBottom: 20 }}>
          <div style={{ background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff", borderRadius: 14, padding: "22px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(224,122,60,0.22)", color: "#F4C9A8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🛡️</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, color: "#91A6F0", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>활성 버전</div>
                <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-mono)", letterSpacing: "-0.015em" }}>criteria v2026.1</div>
              </div>
              <span style={{ padding: "5px 11px", background: "rgba(47,158,94,0.22)", color: "#A3E5BD", borderRadius: 7, fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>● LIVE</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10 }}>
              {[
                { label: "운영 비중", value: "40%" },
                { label: "전략 비중", value: "40%" },
                { label: "사후평가", value: "20%" },
                { label: "KR 점수 상한", value: "110" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.06)", borderRadius: 9 }}>
                  <div style={{ fontSize: 10.5, color: "#91A6F0", marginBottom: 3 }}>{s.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#fff", fontVariantNumeric: "tabular-nums", letterSpacing: "-0.015em", fontFamily: "var(--font-mono)" }}>{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Impact preview */}
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 12 }}>변경 시 영향 범위</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { ico: "👤", bg: "#E5EBFB", fg: "#3B5BDB", name: "R1 피평가자", count: "552명", desc: "작성 가이드 및 사전 체크" },
                { ico: "👥", bg: "#E3F4EA", fg: "#2F9E5E", name: "R2 평가자",  count: "48명",  desc: "AI Validation 11항목 검토" },
                { ico: "📊", bg: "#FFEDE2", fg: "#E07A3C", name: "R3 인사이트",  count: "전사",   desc: "위험유형 집계·사례카드" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: s.bg, color: s.fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{s.ico}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{s.name} <span style={{ fontFamily: "var(--font-mono)", fontSize: 10.5, color: "#7C87A4", fontWeight: 500 }}>· {s.count}</span></div>
                    <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 1 }}>{s.desc}</div>
                  </div>
                  <span style={{ fontSize: 11, color: "#2F9E5E", fontWeight: 600 }}>즉시 반영</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid #E1E5EF", marginBottom: 18 }}>
          {[
            { id: "checklist", label: "체크리스트 (11)", count: 11 },
            { id: "scoring",   label: "점수·KR 개수", count: 3 },
            { id: "distrib",   label: "등급·강제배분", count: 4 },
            { id: "taxonomy",  label: "Taxonomy", count: 33 },
            { id: "guides",    label: "작성 가이드", count: 2 },
          ].map((t) => {
            const on = tab === t.id;
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                padding: "12px 16px",
                background: "transparent", border: "none",
                borderBottom: `2px solid ${on ? "#3B5BDB" : "transparent"}`,
                fontFamily: "var(--font-sans)",
                fontSize: 13.5, fontWeight: on ? 700 : 500,
                color: on ? "#0F1A36" : "#5B6685",
                cursor: "pointer",
              }}>{t.label} <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#A4ADC4", marginLeft: 4 }}>{t.count}</span></button>
            );
          })}
        </div>

        {/* Content */}
        {tab === "scoring" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {/* 점수 상한 카드 */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>위험도 자동 분류 임계값</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>체크리스트 위반 건수에 따른 위험도 자동 분류 기준</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#ECFAF1", border: "1px solid #BBE9CC", borderRadius: 10 }}>
                  <span style={{ width: 44, fontSize: 12, fontWeight: 700, color: "#2F9E5E", textAlign: "center" }}>하</span>
                  <div style={{ flex: 1, fontSize: 12.5, color: "#1F2A4A" }}>위반 <b style={{ fontFamily: "var(--font-mono)" }}>0~1</b>건 → 위험도 자동 "하"</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10 }}>
                  <span style={{ width: 44, fontSize: 12, fontWeight: 700, color: "#D98023", textAlign: "center" }}>중</span>
                  <div style={{ flex: 1, fontSize: 12.5, color: "#1F2A4A" }}>위반 ≥ <CriteriaNumberField label="" value="2" unit="건"/> → 위험도 "중"</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#FDECEC", border: "1px solid #F5C0C0", borderRadius: 10 }}>
                  <span style={{ width: 44, fontSize: 12, fontWeight: 700, color: "#D14343", textAlign: "center" }}>상</span>
                  <div style={{ flex: 1, fontSize: 12.5, color: "#1F2A4A" }}>위반 ≥ <CriteriaNumberField label="" value="4" unit="건"/> → 위험도 "상"</div>
                </div>
              </div>
            </div>

            {/* 점수 상한 / KR 개수 */}
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>점수 상한 & KR 개수 범위</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>달성률 상한과 KR 작성 수 제약</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <CriteriaNumberField label="KR 점수 상한" value="110" unit="%" color="#3B5BDB" hint="달성률 130%여도 110%까지만 점수에 반영"/>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <CriteriaNumberField label="KR 최소 개수" value="4" unit="개"/>
                  <CriteriaNumberField label="KR 최대 개수" value="6" unit="개"/>
                </div>
                <div style={{ padding: "10px 12px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 8, fontSize: 11.5, color: "#1B2A4E", lineHeight: 1.55 }}>
                  💡 KR 4~6개를 권장. 3개 이하는 R1 작성 시 경고가 표시돼요.
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "distrib" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 18 }}>
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>등급 강제배분 비율</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>S/A/B/C/D 강제배분 — D는 규정(현저한 미달성) 수동 배정</div>
              <div style={{ display: "flex", height: 48, borderRadius: 10, overflow: "hidden", border: "1px solid #E1E5EF", marginBottom: 16 }}>
                <div style={{ width: "5%", background: "#7C4DD9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>S 5%</div>
                <div style={{ width: "10%", background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>A 10%</div>
                <div style={{ width: "75%", background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>B 75%</div>
                <div style={{ width: "10%", background: "#D98023", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>C 10%</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {[{g:"S",v:5,c:"#7C4DD9"},{g:"A",v:10,c:"#3B5BDB"},{g:"B",v:75,c:"#2F9E5E"},{g:"C",v:10,c:"#D98023"},{g:"D",v:null,c:"#D14343"}].map(g => (
                  <CriteriaNumberField key={g.g} label={`${g.g}등급`} value={g.v ?? "—"} unit="%" color={g.c} hint={g.v == null ? "수동 배정" : ""}/>
                ))}
              </div>
            </div>
            <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>난이도 가중치</div>
              <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>KR 난이도별 점수 가중치</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { lvl:"상", w:1.2, c:"#D14343", bg:"#FDECEC" },
                  { lvl:"중", w:1.0, c:"#D98023", bg:"#FFF7EC" },
                  { lvl:"하", w:0.8, c:"#2F9E5E", bg:"#ECFAF1" },
                ].map((r) => (
                  <div key={r.lvl} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: r.bg, borderRadius: 10 }}>
                    <span style={{ width: 50, padding: "4px 10px", borderRadius: 999, background: "#fff", color: r.c, fontSize: 12, fontWeight: 700, textAlign: "center" }}>{r.lvl}</span>
                    <CriteriaNumberField label="" value={r.w} unit="배"/>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === "taxonomy" && (
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36", marginBottom: 4 }}>Taxonomy · 분류 체계</div>
            <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 16 }}>업무군 9 · BSC 10 · KR 유형 4 · 위험 유형 11 · 직렬 4</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
              {[
                { title: "업무군 (9)", items: ["개발/요건", "데이터/정합성", "자동화", "성능/튜닝", "장애/운영안정", "정시/납기/처리율", "매뉴얼/표준/문서", "보안/권한/개인정보", "고객/사업기여/제안"], color: "#3B5BDB" },
                { title: "BSC 카테고리 (10)", items: ["재무", "고객", "프로세스", "품질", "생산성", "조직/인재", "시스템 운영", "리스크", "프로젝트", "기타"], color: "#7C4DD9" },
                { title: "KR 유형 (4)", items: ["마일스톤", "수치", "루브릭", "이산"], color: "#E07A3C" },
                { title: "직렬 (4)", items: ["SE — System Engineer", "PM — Project Manager", "SI — System Integrator", "SM — Service Manager"], color: "#2F9E5E" },
              ].map((t, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "18px 20px" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{t.title}</div>
                    <span style={{ padding: "3px 9px", borderRadius: 999, background: `${t.color}15`, color: t.color, fontSize: 11, fontWeight: 700 }}>{t.items.length}개</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {t.items.map((it, ii) => (
                      <span key={ii} style={{ padding: "5px 11px", borderRadius: 7, background: "#F9FAFC", border: "1px solid #ECEFF5", fontSize: 11.5, color: "#1F2A4A", fontFamily: it.includes("—") ? "var(--font-mono)" : "var(--font-sans)" }}>{it}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "guides" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            {[
              { type: "운영", color: "#3B5BDB", bg: "#E5EBFB", desc: "기존 업무 효율·품질 개선", weight: "40%", samples: ["응답속도 p95 < 800ms 유지", "장애 평균복구시간 < 30분", "월 단위 리포트 정확도 99% 이상"] },
              { type: "전략혁신", color: "#7C4DD9", bg: "#F0E9FB", desc: "신규 가치 창출·도전적 변화", weight: "40%", samples: ["신규 셀프서비스 채널 런칭", "AI 추천 시스템 적용 매출 +15%", "데이터 거버넌스 체계 0→1 수립"] },
            ].map((g, i) => (
              <div key={i} style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "20px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ padding: "5px 12px", borderRadius: 8, background: g.bg, color: g.color, fontSize: 13, fontWeight: 700 }}>{g.type}</span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, color: "#7C87A4" }}>비중 {g.weight}</span>
                </div>
                <div style={{ fontSize: 12.5, color: "#5B6685", marginBottom: 14, lineHeight: 1.5 }}>{g.desc}</div>
                <div style={{ fontSize: 11.5, fontWeight: 700, color: "#1F2A4A", marginBottom: 8 }}>R1 작성 예시 (가이드 노출)</div>
                <textarea
                  defaultValue={g.samples.map(s => `· ${s}`).join("\n")}
                  style={{ width: "100%", minHeight: 110, padding: "10px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 9, fontFamily: "var(--font-sans)", fontSize: 12, color: "#0F1A36", outline: "none", resize: "vertical", lineHeight: 1.6 }}
                />
              </div>
            ))}
          </div>
        )}

        {tab === "checklist" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>11항목 체크리스트</div>
                  <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 3 }}>R2 평가자의 AI Validation은 이 11개 문항을 자동 판정해요.</div>
                </div>
                <div style={{ flex: 1 }}/>
                <Button variant="ai" size="sm" leftIcon={<span>+</span>}>항목 추가</Button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <ChecklistRow no={1} text="수치로 측정 가능한가?" tag="측정모호"/>
                <ChecklistRow no={2} text="외부 의존 없이 통제 가능한가?" tag="통제불가"/>
                <ChecklistRow no={3} text="유지형이 아닌 도전적 목표인가?" tag="도전성저하"/>
                <ChecklistRow no={4} text="시간 내 현실적으로 달성 가능한가?" tag="현실성낮음"/>
                <ChecklistRow no={5} text="명확한 언어인가? (애매한 표현이 없는가)" tag="표현모호" edited/>
                <ChecklistRow no={6} text="타 팀 KR과 겹치지 않는가?" tag="공모형"/>
                <ChecklistRow no={7} text="신기술/새 도구에 과의존하지 않는가?" tag="신기술의존"/>
                <ChecklistRow no={8} text="단순 건수형이 아닌 질적 지표인가?" tag="건수형지표"/>
                <ChecklistRow no={9} text="평가자가 확인 가능한 증거가 있는가?" tag="확인불가"/>
                <ChecklistRow no={10} text="외부 증빙 기반인가? (자기보고 아님)" tag="자기보고형" edited/>
                <ChecklistRow no={11} text="고위험 실행 요소가 통제되는가?" tag="고위험실행"/>
              </div>
            </div>

            {/* Side - KR 개수만 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>KR 개수 범위</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <CriteriaNumberField label="최소" value="4" unit="개"/>
                <CriteriaNumberField label="최대" value="6" unit="개"/>
              </div>

              <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", marginTop: 6 }}>위험 태그 미리보기</div>
              <div style={{ padding: "12px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10, fontSize: 11.5, color: "#5B6685", lineHeight: 1.6 }}>
                각 체크리스트 항목 위반 시 위험 태그가 KR에 자동 부착돼요. 평가자가 검토 시 태그를 확인하고 코칭 후보로 분류합니다.
              </div>

              {/* Recent changes */}
              <div style={{ background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 12, padding: "14px 16px", marginTop: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#7A4A14", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span>✏️</span> 저장되지 않은 변경 2건
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 11.5, color: "#9C5E26", lineHeight: 1.5 }}>
                  <div>· 항목 05 문구 수정</div>
                  <div>· 항목 10 문구 수정</div>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

window.R3Criteria = R3Criteria;
