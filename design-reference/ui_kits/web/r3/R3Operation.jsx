// R3Operation.jsx — 평가제도 운영안 입력·편집 화면 (R3 Step 01)
// criteria.운영안 payload를 입력: 비중 / 난이도가중 / 강제배분 / KR점수상한
// / 상대평가단위 / 직급밴드 / 공통제외기준

// ===== Atoms =====
function SectionCard({ num, title, desc, children, accent = "#E07A3C" }) {
  return (
    <section style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      boxShadow: "0 1px 2px rgba(31,42,74,.04)",
      marginBottom: 18, overflow: "hidden",
    }}>
      <header style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "20px 24px 18px",
        borderBottom: "1px solid #ECEFF5",
        background: "linear-gradient(135deg, #FAFBFE, #fff)",
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `${accent}15`, color: accent,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
          flexShrink: 0,
        }}>{num}</div>
        <div>
          <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>{title}</div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 2 }}>{desc}</div>
        </div>
      </header>
      <div style={{ padding: "22px 24px" }}>{children}</div>
    </section>
  );
}

function NumberInput({ value, unit, width = 80, color = "#0F1A36", align = "right", mono = true }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 6 }}>
      <input
        type="text" defaultValue={value}
        style={{
          width, padding: "9px 12px",
          background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 8,
          fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)",
          fontSize: 16, fontWeight: 700,
          color, outline: "none",
          fontVariantNumeric: "tabular-nums", textAlign: align,
        }}
      />
      {unit && <span style={{ fontSize: 12.5, color: "#7C87A4", fontWeight: 500 }}>{unit}</span>}
    </div>
  );
}

function FieldRow({ label, hint, children, required }) {
  return (
    <div style={{ display: "flex", gap: 20, padding: "14px 0", borderTop: "1px solid #F4F7FB" }}>
      <div style={{ width: 200, flexShrink: 0, paddingTop: 4 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36", display: "flex", alignItems: "center", gap: 5 }}>
          {label}
          {required && <span style={{ color: "#D14343", fontSize: 11 }}>*</span>}
        </div>
        {hint && <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 4, lineHeight: 1.5 }}>{hint}</div>}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>{children}</div>
    </div>
  );
}

// ===== Sub-widgets =====
function WeightTriple() {
  // 비중 운영 40 / 전략혁신 40 / 사후평가 20 — visual proportion bar + inputs
  const [ops, setOps] = React.useState(40);
  const [str, setStr] = React.useState(40);
  const post = 100 - ops - str;
  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
        {[
          { label: "운영", value: ops, color: "#3B5BDB", bg: "#E5EBFB", set: setOps },
          { label: "전략혁신", value: str, color: "#7C4DD9", bg: "#F0E9FB", set: setStr },
          { label: "사후평가", value: post, color: "#E07A3C", bg: "#FFEDE2", set: null },
        ].map((w, i) => (
          <div key={i} style={{ flex: 1, padding: "14px 16px", background: w.bg, borderRadius: 11, border: `1px solid ${w.color}33` }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: w.color, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>{w.label}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <input
                type="number" value={w.value}
                onChange={(e) => w.set && w.set(Number(e.target.value) || 0)}
                disabled={!w.set}
                style={{
                  width: 60, padding: "6px 8px",
                  background: w.set ? "#fff" : "transparent",
                  border: w.set ? "1px solid #E1E5EF" : "none",
                  borderRadius: 7,
                  fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700,
                  color: w.color, outline: "none",
                  fontVariantNumeric: "tabular-nums", textAlign: "right",
                }}/>
              <span style={{ fontSize: 13, color: w.color, fontWeight: 600 }}>%</span>
            </div>
          </div>
        ))}
      </div>
      {/* Proportion bar */}
      <div style={{ display: "flex", height: 36, borderRadius: 9, overflow: "hidden", border: "1px solid #E1E5EF" }}>
        <div style={{ width: `${ops}%`, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>운영 {ops}%</div>
        <div style={{ width: `${str}%`, background: "#7C4DD9", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>전략 {str}%</div>
        <div style={{ width: `${post}%`, background: "#E07A3C", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700 }}>사후 {post}%</div>
      </div>
      <div style={{ fontSize: 11.5, color: post < 0 ? "#D14343" : "#7C87A4", marginTop: 8, fontFamily: "var(--font-mono)", textAlign: "right" }}>
        합계 {ops + str + post}% {ops + str + post !== 100 && "· 100%가 되어야 합니다"}
      </div>
    </div>
  );
}

function DifficultyWeights() {
  const rows = [
    { lvl: "상", w: 1.2, color: "#D14343", bg: "#FDECEC" },
    { lvl: "중", w: 1.0, color: "#D98023", bg: "#FFF7EC" },
    { lvl: "하", w: 0.8, color: "#2F9E5E", bg: "#ECFAF1" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
      {rows.map((r) => (
        <div key={r.lvl} style={{
          padding: "16px 18px", background: "#fff",
          border: `1px solid ${r.color}33`, borderRadius: 11,
          borderLeft: `4px solid ${r.color}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ padding: "3px 10px", borderRadius: 999, background: r.bg, color: r.color, fontSize: 12, fontWeight: 700 }}>난이도 {r.lvl}</span>
          </div>
          <NumberInput value={r.w} unit="배" width={70} color={r.color}/>
          <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 8, lineHeight: 1.5 }}>
            가중치 = 달성률 × {r.w}
          </div>
        </div>
      ))}
    </div>
  );
}

function ForcedDistribution() {
  const grades = [
    { g: "S", v: 5, color: "#7C4DD9", hint: "상위 5%" },
    { g: "A", v: 10, color: "#3B5BDB", hint: "S 다음 10%" },
    { g: "B", v: 75, color: "#2F9E5E", hint: "표준 분포" },
    { g: "C", v: 10, color: "#D98023", hint: "C 최대치" },
    { g: "D", v: null, color: "#D14343", hint: "규정 (수동)" },
  ];
  return (
    <div>
      {/* Visual bar */}
      <div style={{ display: "flex", height: 44, borderRadius: 10, overflow: "hidden", border: "1px solid #E1E5EF", marginBottom: 16 }}>
        {grades.filter(g => g.v).map((g) => (
          <div key={g.g} style={{
            width: `${g.v}%`, background: g.color, color: "#fff",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 0,
          }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700 }}>{g.g}</div>
            <div style={{ fontSize: 10, opacity: 0.85, fontFamily: "var(--font-mono)" }}>{g.v}%</div>
          </div>
        ))}
      </div>
      {/* Inputs */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
        {grades.map((g) => (
          <div key={g.g} style={{ padding: "14px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: g.color, marginBottom: 8 }}>{g.g}</div>
            {g.v !== null ? (
              <NumberInput value={g.v} unit="%" width={64} color={g.color} align="center"/>
            ) : (
              <span style={{ fontSize: 12, color: "#7C87A4", fontStyle: "italic" }}>수동 배정</span>
            )}
            <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 8 }}>{g.hint}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function GradeBands() {
  const bands = [
    { name: "밴드 A", grades: ["3급"], color: "#7C4DD9" },
    { name: "밴드 B", grades: ["4급갑", "4급을"], color: "#3B5BDB" },
    { name: "밴드 C", grades: ["5급"], color: "#2F9E5E" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {bands.map((b, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "12px 16px", background: "#F9FAFC",
          border: "1px solid #E1E5EF", borderRadius: 10,
          borderLeft: `4px solid ${b.color}`,
        }}>
          <div style={{ width: 70, fontSize: 12.5, fontWeight: 700, color: b.color, fontFamily: "var(--font-mono)" }}>{b.name}</div>
          <div style={{ flex: 1, display: "flex", gap: 6, flexWrap: "wrap" }}>
            {b.grades.map((g) => (
              <span key={g} style={{
                padding: "5px 11px", borderRadius: 999,
                background: "#fff", border: `1px solid ${b.color}55`,
                color: b.color, fontSize: 12, fontWeight: 600,
                fontFamily: "var(--font-mono)",
              }}>{g}</span>
            ))}
          </div>
          <button style={iconBtn}><Icon name="x" size={13}/></button>
        </div>
      ))}
      <button style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        padding: "11px 14px",
        background: "transparent", border: "1px dashed #C8CFDF", borderRadius: 10,
        color: "#5B6685", fontSize: 12.5, fontWeight: 600, cursor: "pointer",
      }}>
        <Icon name="plus" size={13}/> 밴드 추가
      </button>
    </div>
  );
}

const iconBtn = {
  width: 28, height: 28, borderRadius: 7,
  background: "#fff", border: "1px solid #E1E5EF",
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  cursor: "pointer", color: "#5B6685",
};

function RelativeUnit() {
  const opts = [
    { id: "hq-grade", label: "본부별 · 직급별", desc: "동일 본부 · 동일 직급 내에서 비교 (권장)", active: true },
    { id: "hq", label: "본부별만", desc: "본부 내 전체 직급 통합 비교" },
    { id: "company", label: "전사 통합", desc: "본부·직급 무관 전사 비교" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {opts.map((o) => (
        <label key={o.id} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "13px 16px",
          background: o.active ? "#F1F4FD" : "#fff",
          border: `1px solid ${o.active ? "#3B5BDB" : "#E1E5EF"}`,
          borderRadius: 10, cursor: "pointer",
        }}>
          <input type="radio" name="rel-unit" defaultChecked={o.active} style={{ accentColor: "#3B5BDB", margin: 0 }}/>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{o.label}</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>{o.desc}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

// ===== Main =====
function R3Operation() {
  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="평가제도 운영안" subtitle="criteria v2026.1 · 운영안 payload · 마지막 수정 3일 전"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 56px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>

          {/* Step indicator + header */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.06em" }}>STEP 01 / 06</span>
            <div style={{ flex: 1, height: 2, background: "#E1E5EF", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: "16.6%", height: "100%", background: "#E07A3C" }}/>
            </div>
            <a href="./r3-criteria.html" style={{ fontSize: 12, color: "#3B5BDB", textDecoration: "none", fontWeight: 600 }}>다음: 평가 기준 →</a>
          </div>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 26 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                평가제도 운영안을 설계합니다
              </h1>
              <p style={{ margin: "10px 0 0", fontSize: 14, color: "#5B6685", lineHeight: 1.65, maxWidth: 720 }}>
                비중 · 가중치 · 강제배분 · 점수 상한 등 평가 운영의 골격을 입력해주세요.
                여기서 정한 값이 R1 작성 가이드 · R2 검토 결과 · R3 인사이트에 모두 반영됩니다.
              </p>
            </div>
            <Button variant="secondary" leftIcon={<Icon name="library" size={15}/>}>버전 히스토리</Button>
            <Button variant="primary" leftIcon={<Icon name="check" size={15}/>}>변경사항 저장 (2건)</Button>
          </div>

          {/* Active version card */}
          <div style={{
            background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", color: "#fff",
            borderRadius: 14, padding: "20px 24px", marginBottom: 22,
            display: "flex", alignItems: "center", gap: 18,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(224,122,60,0.22)", color: "#F4C9A8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>📜</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11, color: "#91A6F0", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 700, marginBottom: 4 }}>활성 버전</div>
              <div style={{ fontSize: 19, fontWeight: 700, fontFamily: "var(--font-mono)" }}>운영안 v2026.1 · 운영중</div>
            </div>
            <div style={{ display: "flex", gap: 24, fontSize: 12, color: "#91A6F0" }}>
              <div>적용 본부 <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)", marginLeft: 6 }}>14개</span></div>
              <div>적용 대상 <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)", marginLeft: 6 }}>552명</span></div>
              <div>발행일 <span style={{ color: "#fff", fontWeight: 700, fontFamily: "var(--font-mono)", marginLeft: 6 }}>2026-04-12</span></div>
            </div>
            <span style={{ padding: "5px 11px", background: "rgba(47,158,94,0.22)", color: "#A3E5BD", borderRadius: 7, fontSize: 11, fontWeight: 700 }}>● LIVE</span>
          </div>

          {/* SECTION 01 — 비중 */}
          <SectionCard num="01" title="평가 영역 비중" desc="운영 · 전략혁신 · 사후평가의 점수 비중 (합계 100%)">
            <WeightTriple/>
          </SectionCard>

          {/* SECTION 02 — 난이도 가중치 */}
          <SectionCard num="02" title="난이도 가중치" desc="KR 난이도(상·중·하)별 점수 가중치. R1 점수 산출 시 적용됩니다.">
            <DifficultyWeights/>
          </SectionCard>

          {/* SECTION 03 — 강제배분 */}
          <SectionCard num="03" title="등급 강제배분" desc="상대평가 시 적용되는 S/A/B/C/D 비율. D는 규정(현저한 미달성) 수동 배정.">
            <ForcedDistribution/>
          </SectionCard>

          {/* SECTION 04 — KR 점수 상한 + 상대평가 단위 */}
          <SectionCard num="04" title="점수 상한 & 상대평가 단위" desc="달성률 초과분 인정 한도와 등급 산출 모집단.">
            <FieldRow label="KR 점수 상한" hint="개별 KR 달성률 100% 초과 시 인정 최대치">
              <NumberInput value="110" unit="%" width={90} color="#3B5BDB"/>
              <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 6 }}>달성률 130%여도 점수에는 110%만 반영됩니다.</div>
            </FieldRow>
            <FieldRow label="상대평가 모집단" hint="등급 강제배분 단위 (작을수록 동질 비교, 클수록 다양성)" required>
              <RelativeUnit/>
            </FieldRow>
          </SectionCard>

          {/* SECTION 05 — 직급 밴드 */}
          <SectionCard num="05" title="직급 밴드" desc="동일 밴드 내에서 강제배분이 적용됩니다. (예: 4급갑·4급을은 같은 밴드)">
            <GradeBands/>
          </SectionCard>

          {/* SECTION 06 — 공통 제외 기준 */}
          <SectionCard num="06" title="공통 제외 기준" desc="OKR 대상에서 제외되는 업무 유형. R1 작성 가이드에 표시됩니다.">
            <FieldRow label="제외 기준 문구" hint="피평가자가 KR 작성 시 안내문으로 노출">
              <textarea
                defaultValue="반응형(장애대응형) 유지보수는 OKR 대상 제외, 능동적 개선만 인정"
                style={{
                  width: "100%", minHeight: 80, padding: "12px 14px",
                  background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 10,
                  fontFamily: "var(--font-sans)", fontSize: 13, color: "#0F1A36",
                  outline: "none", resize: "vertical", lineHeight: 1.6,
                }}/>
            </FieldRow>
            <FieldRow label="추가 제외 유형 (선택)" hint="필요 시 항목별로 추가">
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["반응형 유지보수", "정기 보고", "단순 사무지원"].map((t) => (
                  <span key={t} style={{
                    padding: "6px 12px", borderRadius: 999,
                    background: "#fff", border: "1px solid #E1E5EF",
                    fontSize: 12, color: "#1F2A4A", display: "flex", alignItems: "center", gap: 6,
                  }}>
                    {t}
                    <button style={{ background: "transparent", border: "none", color: "#A4ADC4", cursor: "pointer", fontSize: 14, padding: 0, display: "flex" }}>×</button>
                  </span>
                ))}
                <button style={{
                  padding: "6px 12px", borderRadius: 999,
                  background: "transparent", border: "1px dashed #C8CFDF",
                  fontSize: 12, color: "#5B6685", cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                }}>
                  <Icon name="plus" size={12}/> 추가
                </button>
              </div>
            </FieldRow>
          </SectionCard>

          {/* Impact panel */}
          <div style={{
            background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 14,
            padding: "20px 24px", marginTop: 8, display: "flex", gap: 16, alignItems: "flex-start",
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>💡</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#1B2A4E", marginBottom: 6 }}>저장 시 영향 범위</div>
              <div style={{ fontSize: 12.5, color: "#3A4565", lineHeight: 1.65, marginBottom: 10 }}>
                운영안 변경은 <b>다음 분기 평가</b>부터 적용됩니다. 현재 진행 중인 2026 상반기 평가에는 영향이 없어요.
              </div>
              <div style={{ display: "flex", gap: 18, fontSize: 12, color: "#5B6685" }}>
                <span>· R1 작성 가이드 <b style={{ color: "#3B5BDB" }}>즉시 반영</b></span>
                <span>· R2 점수 계산식 <b style={{ color: "#3B5BDB" }}>다음 분기</b></span>
                <span>· R3 인사이트 기준 <b style={{ color: "#3B5BDB" }}>즉시 반영</b></span>
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div style={{ display: "flex", gap: 12, marginTop: 28, justifyContent: "flex-end" }}>
            <Button variant="secondary">취소</Button>
            <Button variant="secondary">임시 저장</Button>
            <a href="./r3-criteria.html" style={{ textDecoration: "none" }}>
              <Button variant="primary" rightIcon={<Icon name="chevronRight" size={14}/>}>저장 후 다음: 평가 기준</Button>
            </a>
          </div>

        </div>
      </div>
    </main>
  );
}

window.R3Operation = R3Operation;
