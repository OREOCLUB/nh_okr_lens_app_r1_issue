// R3Import.jsx — 이전 OKR Excel Import 워크플로우 (4단계 위저드)
// STEP 03 마스터 데이터의 핵심 기능 — history_okr 테이블에 이전 평가 데이터 적재
// 1) 업로드  2) 컬럼 매핑  3) 검증  4) 미리보기 & 적용

// ============ Atoms ============
function StepIndicator({ current }) {
  const steps = [
    { n: 1, label: "파일 업로드", desc: "xlsx · csv" },
    { n: 2, label: "컬럼 매핑",  desc: "필드 자동 매칭" },
    { n: 3, label: "검증",       desc: "누락·중복·이상치" },
    { n: 4, label: "미리보기 & 적용", desc: "최종 가져오기" },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 30 }}>
      {steps.map((s, i) => {
        const done = s.n < current;
        const active = s.n === current;
        const color = done ? "#2F9E5E" : active ? "#E07A3C" : "#A4ADC4";
        return (
          <React.Fragment key={s.n}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: done ? "#ECFAF1" : active ? "#FFEDE2" : "#F4F7FB",
                color, border: `2px solid ${color}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700,
                flexShrink: 0,
              }}>{done ? "✓" : s.n}</div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: active || done ? 700 : 600, color: active ? "#0F1A36" : done ? "#0F1A36" : "#7C87A4", whiteSpace: "nowrap" }}>{s.label}</div>
                <div style={{ fontSize: 10.5, color: "#A4ADC4", whiteSpace: "nowrap" }}>{s.desc}</div>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div style={{ flex: 1, height: 2, background: done ? "#2F9E5E" : "#E1E5EF", margin: "0 16px", borderRadius: 1 }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function FieldMap({ excelCol, sysField, confidence, sample, required }) {
  const conf = confidence >= 95 ? { c: "#2F9E5E", bg: "#ECFAF1", label: "자동 매칭" } : confidence >= 70 ? { c: "#D98023", bg: "#FFF7EC", label: "유사 매칭" } : { c: "#D14343", bg: "#FDECEC", label: "수동 확인 필요" };
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "180px 28px 200px 130px 1fr",
      gap: 12, alignItems: "center",
      padding: "12px 16px",
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
    }}>
      {/* Excel column */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <span style={{ width: 22, height: 22, borderRadius: 6, background: "#ECFAF1", color: "#2F9E5E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, fontFamily: "var(--font-mono)", flexShrink: 0 }}>XL</span>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{excelCol}</span>
      </div>
      {/* arrow */}
      <div style={{ color: "#A4ADC4", fontSize: 14, textAlign: "center" }}>→</div>
      {/* sys field dropdown */}
      <div style={{ position: "relative" }}>
        <select defaultValue={sysField} style={{
          width: "100%", padding: "8px 28px 8px 12px",
          background: "#F9FAFC", border: `1px solid ${confidence < 70 ? "#FFD4D4" : "#E1E5EF"}`, borderRadius: 7,
          fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 600,
          color: "#0F1A36", outline: "none", cursor: "pointer",
          WebkitAppearance: "none", MozAppearance: "none", appearance: "none",
        }}>
          <option>{sysField}</option>
          <option>member_id</option>
          <option>year</option>
          <option>objective</option>
          <option>final_grade</option>
        </select>
        <Icon name="chevronDown" size={12} style={{ position: "absolute", right: 10, top: 11, color: "#7C87A4", pointerEvents: "none" }}/>
      </div>
      {/* confidence */}
      <span style={{
        padding: "3px 10px", borderRadius: 999,
        background: conf.bg, color: conf.c,
        fontSize: 10.5, fontWeight: 700, textAlign: "center",
      }}>{conf.label} {confidence}%</span>
      {/* sample */}
      <div style={{ fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        예: <span style={{ color: "#3A4565" }}>{sample}</span>
      </div>
    </div>
  );
}

function ValidationRow({ icon, color, bg, title, count, details, severity }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 14,
      padding: "16px 18px",
      background: severity === "error" ? "#FDECEC" : severity === "warn" ? "#FFF7EC" : "#ECFAF1",
      border: `1px solid ${severity === "error" ? "#F5C0C0" : severity === "warn" ? "#FFE0BA" : "#BBE9CC"}`,
      borderRadius: 11,
    }}>
      <div style={{ width: 32, height: 32, borderRadius: 9, background: bg, color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>{title}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, fontWeight: 700, color, padding: "2px 8px", borderRadius: 6, background: "#fff" }}>{count}</span>
        </div>
        <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.55 }}>{details}</div>
      </div>
      {severity !== "ok" && (
        <button style={{
          padding: "6px 12px",
          background: "#fff", border: `1px solid ${color}55`, color,
          borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)",
          whiteSpace: "nowrap", flexShrink: 0,
        }}>상세 보기</button>
      )}
    </div>
  );
}

// ============ STEP 1: Upload ============
function StepUpload({ onNext }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
      {/* Dropzone */}
      <div style={{
        background: "#fff", border: "2px dashed #C5D0F7", borderRadius: 16,
        padding: "48px 32px", textAlign: "center",
        display: "flex", flexDirection: "column", alignItems: "center", gap: 16,
      }}>
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>📂</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>Excel 파일을 여기에 놓아주세요</div>
          <div style={{ fontSize: 13, color: "#5B6685", marginTop: 6 }}>또는 클릭해서 파일을 선택해주세요. .xlsx · .csv 지원 · 최대 10MB</div>
        </div>
        <button style={{
          padding: "10px 22px",
          background: "#3B5BDB", color: "#fff",
          border: "none", borderRadius: 10,
          fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)",
          boxShadow: "0 4px 12px -2px rgba(59,91,219,.3)",
        }}>파일 선택하기</button>

        {/* Recent upload */}
        <div style={{ width: "100%", marginTop: 12, padding: "14px 16px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 11, display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <div style={{ width: 38, height: 38, borderRadius: 9, background: "#ECFAF1", color: "#2F9E5E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>📊</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0F1A36" }}>2025년_OKR이력_전사.xlsx</div>
            <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 2, fontFamily: "var(--font-mono)" }}>업로드 완료 · 547행 · 2.4 MB · 방금 전</div>
          </div>
          <span style={{ padding: "3px 10px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11, fontWeight: 700 }}>✓ 분석 완료</span>
        </div>
      </div>

      {/* Side panel */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* Template */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "#FFEDE2", color: "#E07A3C", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📋</div>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>표준 템플릿</div>
          </div>
          <div style={{ fontSize: 12, color: "#5B6685", marginBottom: 12, lineHeight: 1.55 }}>
            제공된 표준 양식을 사용하면 컬럼 매핑이 자동으로 완료됩니다.
          </div>
          <button style={{
            width: "100%", padding: "9px 14px",
            background: "#F9FAFC", border: "1px solid #E1E5EF",
            borderRadius: 9, fontSize: 12.5, fontWeight: 600, color: "#1F2A4A",
            cursor: "pointer", fontFamily: "var(--font-sans)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
          }}>
            <span>📥</span> OKR_history_template.xlsx 다운로드
          </button>
        </div>

        {/* Required columns */}
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
            <Icon name="check" size={16} style={{ color: "#2F9E5E" }}/>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>필수 컬럼 (8)</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[
              { col: "사번", field: "member_id" },
              { col: "이름", field: "name" },
              { col: "평가연도", field: "year" },
              { col: "Objective", field: "objective" },
              { col: "KR", field: "kr" },
              { col: "난이도", field: "difficulty" },
              { col: "달성률", field: "achievement_rate" },
              { col: "최종등급", field: "final_grade" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                <span style={{ color: "#5B6685", flex: 1 }}>· {c.col}</span>
                <span style={{ fontFamily: "var(--font-mono)", color: "#A4ADC4", fontSize: 10.5 }}>{c.field}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Optional */}
        <div style={{ background: "#F9FAFC", border: "1px dashed #C8CFDF", borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5B6685", marginBottom: 6 }}>선택 컬럼 (5)</div>
          <div style={{ fontSize: 11, color: "#7C87A4", lineHeight: 1.6 }}>
            업무군 · 측정방법 · 평가자 코멘트 · 사후조정 사유 · 등급 결과 의견
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ STEP 2: Mapping ============
function StepMapping() {
  const mappings = [
    { excel: "사번",        field: "member_id",        conf: 100, sample: "E1024" },
    { excel: "이름",        field: "name",             conf: 100, sample: "김지훈" },
    { excel: "평가연도",    field: "year",             conf: 100, sample: "2025" },
    { excel: "목표",        field: "objective",        conf: 92,  sample: "결제 시스템 안정성 향상" },
    { excel: "핵심결과",    field: "kr",               conf: 95,  sample: "APM p95 850→500ms" },
    { excel: "Lv",          field: "difficulty",       conf: 78,  sample: "상" },
    { excel: "달성%",       field: "achievement_rate", conf: 85,  sample: "108" },
    { excel: "등급",        field: "final_grade",      conf: 96,  sample: "A" },
    { excel: "업무유형",    field: "job_group",        conf: 64,  sample: "성능튜닝" },
    { excel: "비고",        field: "comment",          conf: 55,  sample: "1Q 지연 후 회복" },
  ];
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>10개 컬럼 자동 매칭 결과</div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 3 }}>AI가 컬럼명과 샘플 데이터를 분석해서 매칭했어요. 노란/빨간 매핑은 직접 확인해주세요.</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ padding: "5px 11px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", fontSize: 11, fontWeight: 700 }}>자동 7</span>
          <span style={{ padding: "5px 11px", borderRadius: 999, background: "#FFF7EC", color: "#D98023", fontSize: 11, fontWeight: 700 }}>유사 2</span>
          <span style={{ padding: "5px 11px", borderRadius: 999, background: "#FDECEC", color: "#D14343", fontSize: 11, fontWeight: 700 }}>확인 1</span>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {mappings.map((m, i) => <FieldMap key={i} excelCol={m.excel} sysField={m.field} confidence={m.conf} sample={m.sample}/>)}
      </div>

      <div style={{
        marginTop: 18, padding: "14px 18px",
        background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 11,
        display: "flex", alignItems: "center", gap: 12, fontSize: 12, color: "#1B2A4E", lineHeight: 1.6,
      }}>
        <span style={{ fontSize: 16 }}>💡</span>
        <div style={{ flex: 1 }}>
          매핑 결과를 <b>매핑 프로파일</b>로 저장하면, 동일 양식의 다른 파일을 가져올 때 자동으로 재사용할 수 있어요.
        </div>
        <button style={{ padding: "6px 12px", background: "#fff", border: "1px solid #C5D0F7", color: "#1B2A4E", borderRadius: 7, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>프로파일로 저장</button>
      </div>
    </div>
  );
}

// ============ STEP 3: Validation ============
function StepValidation() {
  return (
    <div>
      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "전체 행",     value: "547", color: "#3B5BDB", sub: "Excel 원본" },
          { label: "정상",        value: "521", color: "#2F9E5E", sub: "95.2%" },
          { label: "주의 (자동 보정 가능)", value: "18", color: "#D98023", sub: "3.3%" },
          { label: "오류 (수동 처리)", value: "8",  color: "#D14343", sub: "1.5%" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "16px 20px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#5B6685", marginBottom: 8 }}>{s.label}</div>
            <div>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{s.value}</span>
              <span style={{ fontSize: 12, color: "#7C87A4", marginLeft: 5 }}>건</span>
            </div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 4 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Validation rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <ValidationRow
          icon="✓" color="#2F9E5E" bg="#ECFAF1" severity="ok"
          title="필수 컬럼 모두 매핑됨" count="8/8"
          details="member_id · year · objective · kr · difficulty · achievement_rate · final_grade 등 8개 필수 컬럼이 모두 매핑되었어요."
        />
        <ValidationRow
          icon="✓" color="#2F9E5E" bg="#ECFAF1" severity="ok"
          title="마스터 사원 매칭" count="521/547"
          details="Excel의 사번 547건 중 521건이 현재 마스터 데이터의 사원과 일치합니다. 26건은 퇴사자(이력 보존)로 분류돼요."
        />
        <ValidationRow
          icon="⚠️" color="#D98023" bg="#FFF7EC" severity="warn"
          title="중복 행 감지" count="6건"
          details="동일 사번 + 연도 + KR의 중복 행이 6건 있어요. 가장 최신 행을 유지하고 나머지는 자동으로 무시합니다 (덮어쓰기 모드)."
        />
        <ValidationRow
          icon="⚠️" color="#D98023" bg="#FFF7EC" severity="warn"
          title="달성률 형식 보정" count="12건"
          details="달성률 컬럼에 '108%', '110.5', '1.08' 등 혼합 형식이 있어요. 자동으로 0~150% 범위 숫자로 정규화합니다."
        />
        <ValidationRow
          icon="❌" color="#D14343" bg="#FDECEC" severity="error"
          title="필수 값 누락" count="5건"
          details="objective 또는 kr 필드가 비어있는 5행이 있어요. 가져오기에서 제외할지, 수동으로 입력하고 다시 시도할지 선택해주세요."
        />
        <ValidationRow
          icon="❌" color="#D14343" bg="#FDECEC" severity="error"
          title="등급 enum 불일치" count="3건"
          details="최종등급 컬럼에 'A+', 'S-', '우수' 등 표준(S/A/B/C/D)이 아닌 값 3건이 있어요. 매핑 규칙을 정의하거나 행 단위로 수정해주세요."
        />
      </div>

      {/* Settings */}
      <div style={{
        marginTop: 18, padding: "16px 20px",
        background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
      }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36", marginBottom: 10 }}>가져오기 옵션</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { label: "퇴사자 이력도 보존", desc: "마스터에 없는 사번도 history_okr에 기록", checked: true },
            { label: "중복 행 자동 무시 (최신만 유지)", desc: "동일 사번+연도+KR 중복 시 가장 최근 행만 적재", checked: true },
            { label: "달성률 자동 정규화 (0~150%)", desc: "혼합 형식을 표준 숫자로 변환", checked: true },
            { label: "오류 행 함께 가져오기 (수동 보정용)", desc: "체크 시 오류 8행도 staging에 보관, 검토 후 적용 가능", checked: false },
          ].map((o, i) => (
            <label key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 9, cursor: "pointer" }}>
              <input type="checkbox" defaultChecked={o.checked} style={{ accentColor: "#3B5BDB", margin: 0 }}/>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>{o.label}</div>
                <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 2 }}>{o.desc}</div>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============ STEP 4: Preview & Commit ============
function StepPreview() {
  const sample = [
    { id: "E1024", name: "김지훈", year: 2025, obj: "결제 시스템 안정성", kr: "APM p95 850→500ms", diff: "상", rate: 108, grade: "A", status: "신규" },
    { id: "E1024", name: "김지훈", year: 2024, obj: "결제 게이트웨이 표준화", kr: "표준 명세서 12건 작성", diff: "중", rate: 94,  grade: "B", status: "신규" },
    { id: "E1037", name: "박서연", year: 2025, obj: "단위테스트 커버리지 강화", kr: "결제 모듈 65→85%", diff: "중", rate: 102, grade: "A", status: "업데이트" },
    { id: "E1051", name: "이도윤", year: 2025, obj: "PM 일정 정확도 개선", kr: "납기 준수율 78→92%", diff: "상", rate: 91, grade: "B", status: "신규" },
    { id: "E1062", name: "최수아", year: 2025, obj: "DBA 자동화 도입", kr: "백업 자동화 100% 적용", diff: "중", rate: 115, grade: "A", status: "신규" },
    { id: "E1073", name: "정민재", year: 2025, obj: "결제 API 응답속도", kr: "p99 1200→800ms", diff: "중", rate: 88,  grade: "C", status: "신규" },
    { id: "E1084", name: "한지윤", year: 2025, obj: "보안 거버넌스 강화", kr: "권한 점검 분기 95%", diff: "상", rate: 96, grade: "A", status: "신규" },
  ];

  return (
    <div>
      {/* Final summary */}
      <div style={{ background: "linear-gradient(135deg, #ECFAF1, #fff)", border: "1px solid #BBE9CC", borderRadius: 14, padding: "22px 26px", marginBottom: 22, display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 50, height: 50, borderRadius: 14, background: "#2F9E5E", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>✓</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#2F9E5E", letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>적용 준비 완료</div>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#0F1A36", marginTop: 4, letterSpacing: "-0.015em" }}>539건을 history_okr 테이블에 적재합니다</div>
          <div style={{ fontSize: 12.5, color: "#3A4565", marginTop: 6, lineHeight: 1.55 }}>
            정상 521 + 자동 보정 18 = <b>539건</b> · 오류 8건은 제외 (별도 staging에 보관, 추후 수동 적용 가능)
          </div>
        </div>
      </div>

      {/* Change summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 22 }}>
        {[
          { label: "신규 적재", value: "486", color: "#2F9E5E", sub: "history_okr · INSERT" },
          { label: "기존 업데이트", value: "53", color: "#3B5BDB", sub: "동일 키 · UPDATE" },
          { label: "영향 사원 수", value: "247", color: "#7C4DD9", sub: "552명 중" },
          { label: "적용 연도 범위", value: "2023~2025", color: "#E07A3C", sub: "3개년 이력" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "16px 20px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12 }}>
            <div style={{ fontSize: 12, color: "#5B6685", marginBottom: 8 }}>{s.label}</div>
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: s.color, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em" }}>{s.value}</span>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 5 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Preview table */}
      <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12, overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>미리보기 · 처음 7건</div>
          <div style={{ flex: 1 }}/>
          <span style={{ fontSize: 11.5, color: "#7C87A4" }}>539건 중</span>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
          <thead>
            <tr style={{ background: "#F9FAFC" }}>
              {["사번", "이름", "연도", "Objective", "KR", "난이도", "달성률", "등급", "상태"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", borderBottom: "1px solid #E1E5EF" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sample.map((r, i) => (
              <tr key={i} style={{ borderBottom: i === sample.length - 1 ? "none" : "1px solid #ECEFF5" }}>
                <td style={tdImport}><span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#7C87A4" }}>{r.id}</span></td>
                <td style={tdImport}><span style={{ fontWeight: 600, color: "#0F1A36" }}>{r.name}</span></td>
                <td style={tdImport}><span style={{ fontFamily: "var(--font-mono)", color: "#5B6685" }}>{r.year}</span></td>
                <td style={{ ...tdImport, maxWidth: 200, whiteSpace: "normal", lineHeight: 1.4 }}>{r.obj}</td>
                <td style={{ ...tdImport, maxWidth: 230, whiteSpace: "normal", lineHeight: 1.4, color: "#5B6685" }}>{r.kr}</td>
                <td style={tdImport}>
                  <span style={{ padding: "2px 8px", borderRadius: 999, background: r.diff === "상" ? "#FDECEC" : r.diff === "중" ? "#FFF7EC" : "#ECFAF1", color: r.diff === "상" ? "#D14343" : r.diff === "중" ? "#D98023" : "#2F9E5E", fontSize: 10.5, fontWeight: 700 }}>{r.diff}</span>
                </td>
                <td style={{ ...tdImport, textAlign: "right" }}><span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: r.rate >= 100 ? "#2F9E5E" : r.rate >= 90 ? "#D98023" : "#D14343" }}>{r.rate}%</span></td>
                <td style={tdImport}>
                  <span style={{ padding: "2px 9px", borderRadius: 6, background: "#E5EBFB", color: "#213A8C", fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{r.grade}</span>
                </td>
                <td style={tdImport}>
                  <span style={{ fontSize: 10.5, color: r.status === "신규" ? "#2F9E5E" : "#3B5BDB", fontWeight: 600 }}>{r.status === "신규" ? "● 신규" : "● 업데이트"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ padding: "12px 20px", background: "#F9FAFC", borderTop: "1px solid #ECEFF5", textAlign: "center", fontSize: 11.5, color: "#5B6685" }}>
          ... 532건 더 보기
        </div>
      </div>

      {/* Impact panel */}
      <div style={{ marginTop: 20, padding: "18px 22px", background: "linear-gradient(135deg, #1B2A4E, #2C3E68)", borderRadius: 12, color: "#fff", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(224,122,60,0.22)", color: "#F4C9A8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🚀</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, marginBottom: 4 }}>이 가져오기는 다음에 즉시 사용됩니다</div>
          <div style={{ fontSize: 11.5, color: "#91A6F0", lineHeight: 1.55 }}>
            R2 평가자의 <b style={{ color: "#fff" }}>작년 OKR 팝업</b> · R1 피평가자의 <b style={{ color: "#fff" }}>상향/유지 의견</b> · R3의 <b style={{ color: "#fff" }}>작년 대비 난이도 변화</b> 등에 활용돼요.
          </div>
        </div>
      </div>
    </div>
  );
}

const tdImport = { padding: "11px 14px", verticalAlign: "middle", color: "#1F2A4A" };

// ============ MAIN ============
function R3Import() {
  const [step, setStep] = React.useState(2);

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="이전 OKR 데이터 가져오기" subtitle="Excel · CSV → history_okr 테이블 적재"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "32px 40px 56px" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto" }}>

          {/* Breadcrumb */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#7C87A4", marginBottom: 14 }}>
            <a href="./r3-master.html" style={{ color: "#3B5BDB", textDecoration: "none" }}>마스터 데이터</a>
            <Icon name="chevronRight" size={11}/>
            <span>이전 OKR 가져오기</span>
          </div>

          {/* Hero */}
          <div style={{ display: "flex", alignItems: "flex-end", marginBottom: 26 }}>
            <div style={{ flex: 1 }}>
              <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
                이전 OKR 데이터를 가져옵니다
              </h1>
              <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "#5B6685", lineHeight: 1.65, maxWidth: 760 }}>
                3년치 평가 이력을 Excel에서 한 번에 가져와요. R2의 작년 OKR 팝업, R1의 상향/유지 의견, R3의 작년 대비 분석에 모두 활용됩니다.
                <b style={{ color: "#0F1A36" }}> 평가의 연속성을 만드는 핵심 기능</b>이에요.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#7C87A4" }}>최근 가져오기</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#0F1A36" }}>2026-04-12 · 482건</span>
            </div>
          </div>

          {/* Step indicator */}
          <StepIndicator current={step}/>

          {/* Step body */}
          <div style={{ marginBottom: 28 }}>
            {step === 1 && <StepUpload/>}
            {step === 2 && <StepMapping/>}
            {step === 3 && <StepValidation/>}
            {step === 4 && <StepPreview/>}
          </div>

          {/* Footer nav */}
          <div style={{ display: "flex", gap: 12, justifyContent: "space-between", paddingTop: 22, borderTop: "1px solid #E1E5EF" }}>
            <Button variant="ghost" leftIcon={<Icon name="x" size={13}/>}>취소</Button>
            <div style={{ display: "flex", gap: 10 }}>
              {step > 1 && (
                <Button variant="secondary" leftIcon={<span>‹</span>} onClick={() => setStep(step - 1)}>이전</Button>
              )}
              {step < 4 ? (
                <Button variant="primary" rightIcon={<Icon name="chevronRight" size={13}/>} onClick={() => setStep(step + 1)}>
                  {step === 1 ? "다음: 컬럼 매핑" : step === 2 ? "다음: 검증" : "다음: 미리보기"}
                </Button>
              ) : (
                <Button variant="success" leftIcon={<Icon name="check" size={14}/>}>539건 가져오기</Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}

window.R3Import = R3Import;
