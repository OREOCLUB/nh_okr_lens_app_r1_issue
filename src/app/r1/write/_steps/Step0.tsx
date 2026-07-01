"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import { label, input, hint } from "./shared";

type Status = "done" | "in-progress" | "pending";
const DOT: Record<Status, { bg: string; fg: string; border: string; ico: string; label: string }> = {
  done: { bg: "#ECFAF1", fg: "#2F9E5E", border: "#BBE9CC", ico: "✓", label: "완료" },
  "in-progress": { bg: "#F1F4FD", fg: "#3B5BDB", border: "#C5D0F7", ico: "●", label: "입력 중" },
  pending: { bg: "#F4F7FB", fg: "#7C87A4", border: "#E1E5EF", ico: "○", label: "미입력" },
};

function FieldGroup({ icon, title, desc, status, children }: { icon: string; title: string; desc?: ReactNode; status: Status; children: ReactNode }) {
  const dot = DOT[status];
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 16, padding: "22px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: desc ? 4 : 14 }}>
        <span style={{ fontSize: 18 }}>{icon}</span>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>{title}</span>
        <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 999, background: dot.bg, color: dot.fg, border: `1px solid ${dot.border}`, fontSize: 11, fontWeight: 700 }}>
          <span style={{ fontSize: 9 }}>{dot.ico}</span>{dot.label}
        </span>
      </div>
      {desc && <div style={{ fontSize: 12, color: "#7C87A4", marginBottom: 14, lineHeight: 1.5 }}>{desc}</div>}
      {children}
    </div>
  );
}

function TagInput({ tags, onRemove }: { tags: string[]; onRemove: (t: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 12px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, minHeight: 44 }}>
      {tags.map((t) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#F1F4FD", color: "#213A8C", borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}>
          {t}
          <button onClick={() => onRemove(t)} style={{ border: "none", background: "transparent", color: "#7C87A4", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
        </span>
      ))}
    </div>
  );
}

function Radio({ label: l, sub, value, current, onChange }: { label: string; sub?: string; value: string; current: string; onChange: (v: string) => void }) {
  const on = value === current;
  return (
    <div onClick={() => onChange(value)} style={{ flex: 1, padding: "13px 15px", background: on ? "#F1F4FD" : "#fff", border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`, borderRadius: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? "#3B5BDB" : "#C8CFDF"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {on && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B5BDB" }} />}
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{l}</div>
        {sub && <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

const seg: CSSProperties = { flex: 1, padding: "8px 10px", borderRadius: 7, border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: 12.5 };

export function Step0() {
  const [workType, setWorkType] = useState("onsite");
  const [jobSeries, setJobSeries] = useState("SE");
  const [certs, setCerts] = useState(["AWS SAA", "CKA"]);
  const [checks, setChecks] = useState([true, true, false]);
  const filled = 5, total = 6, pct = Math.round((filled / total) * 100);

  const suggested = ["AWS SAP", "CKAD", "PMP"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 진행률 + 마스터 데이터 출처 */}
      <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 55%)", border: "1px solid #C5D0F7", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>김지훈 님의 프로필</div>
          <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>6개 항목 중 {filled}개 입력 완료 · <span style={{ color: "#D98023", fontWeight: 600 }}>1개 보완 필요</span></div>
          <div style={{ marginTop: 8, height: 8, background: "#E1E5EF", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3B5BDB, #5C7AE6)", borderRadius: 4 }} />
          </div>
        </div>
        <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: "#3B5BDB" }}>{pct}%</div>
        <div style={{ borderLeft: "1px solid #D5DDF0", paddingLeft: 20, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase" }}>마스터 데이터 출처</div>
          <div style={{ fontSize: 12, color: "#2F9E5E", fontWeight: 600 }}>✓ 인사시스템 동기화 완료</div>
          <div style={{ fontSize: 12, color: "#2F9E5E", fontWeight: 600 }}>✓ R3 마스터데이터 매핑 완료</div>
        </div>
      </div>
      <div style={{ padding: "10px 16px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10, fontSize: 11.5, color: "#7C87A4", lineHeight: 1.5 }}>
        회색 항목은 인사시스템에서 자동으로 채워졌어요. 수정이 필요하면 인사담당자에게 요청해주세요.
      </div>

      {/* 1. 직무 / 직렬 */}
      <FieldGroup icon="🧭" title="직무 · 직렬" status="done">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
          <div><label style={label}>본부</label><input style={input} defaultValue="운영본부" readOnly /></div>
          <div><label style={label}>팀</label><input style={input} defaultValue="결제플랫폼팀" readOnly /></div>
          <div><label style={label}>직급</label><input style={input} defaultValue="3급" readOnly /></div>
          <div>
            <label style={label}>직렬</label>
            <div style={{ display: "flex", background: "var(--page-bg)", borderRadius: 9, padding: 4, gap: 3 }}>
              {["SE", "DE", "PM"].map((s) => (
                <button key={s} onClick={() => setJobSeries(s)} style={{ ...seg, background: jobSeries === s ? "#fff" : "transparent", color: jobSeries === s ? "#0F1A36" : "#7C87A4", fontWeight: jobSeries === s ? 700 : 500, boxShadow: jobSeries === s ? "0 1px 2px rgba(31,42,74,.08)" : "none" }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* 2. 업무 분장 */}
      <FieldGroup icon="🗂️" title="업무 분장" status="in-progress">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={label}>주요 업무 분장 <span style={{ color: "#D64545" }}>*</span></label>
            <input style={input} defaultValue="결제플랫폼 백엔드 성능/튜닝, 인증모듈 안정화" />
            <div style={hint}>STEP 3 객관성 검증 시 이 영역과 KR이 일치하는지 자동 확인해요.</div>
          </div>
          <div><label style={label}>담당 시스템 / 도메인</label><input style={input} defaultValue="결제 게이트웨이 · 인증모듈" /></div>
          <div><label style={label}>주요 협업 대상</label><input style={input} placeholder="예: SRE팀, 인프라팀" /></div>
        </div>
      </FieldGroup>

      {/* 3. 근속 정보 */}
      <FieldGroup icon="📆" title="근속 정보" status="done">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div><label style={label}>입사년도</label><input style={input} defaultValue="2018" readOnly /><div style={hint}>전체 근속 8년 4개월</div></div>
          <div><label style={label}>현 보직 발령일</label><input style={input} defaultValue="2022-03" readOnly /><div style={hint}>결제플랫폼팀 근속 4년 4개월</div></div>
          <div><label style={label}>이전 직무 경험</label><input style={input} defaultValue="인프라 운영 (2018~2022)" /><div style={hint}>최근 5년 내 주요 경력</div></div>
        </div>
      </FieldGroup>

      {/* 4. 근무 형태 */}
      <FieldGroup icon="🏢" title="근무 형태" status="done">
        <div style={{ display: "flex", gap: 12 }}>
          <Radio label="상주 근무" sub="본사 근무" value="onsite" current={workType} onChange={setWorkType} />
          <Radio label="파견 근무" sub="고객사 상주" value="dispatch" current={workType} onChange={setWorkType} />
          <Radio label="원격 · 혼합" sub="재택 병행" value="remote" current={workType} onChange={setWorkType} />
        </div>
        {workType === "dispatch" && (
          <div style={{ marginTop: 12, padding: "12px 16px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12, color: "#7A4A14", lineHeight: 1.55 }}>
            💡 파견 근무자는 고객사 일정에 영향을 받는 KR의 도전성 가중치 산정 시 별도 기준이 적용돼요. 협업 대상에 고객사도 함께 적어주세요.
          </div>
        )}
      </FieldGroup>

      {/* 5. 자격증 */}
      <FieldGroup icon="📜" title="보유 자격증" status="done">
        <TagInput tags={certs} onRemove={(t) => setCerts((c) => c.filter((x) => x !== t))} />
        <div style={{ marginTop: 14, padding: "14px 16px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0A6B44", marginBottom: 4 }}>✨ 관련 자격증 제안 3건</div>
          <div style={{ fontSize: 11.5, color: "#2F6B48", marginBottom: 10 }}>담당 업무(결제 백엔드) 기반 추천</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggested.filter((s) => !certs.includes(s)).map((s) => (
              <button key={s} onClick={() => setCerts((c) => [...c, s])} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#0A6B44", cursor: "pointer", fontFamily: "var(--font-sans)" }}>+ {s}</button>
            ))}
          </div>
        </div>
      </FieldGroup>

      {/* 6. 약관 동의 */}
      <FieldGroup icon="✅" title="약관 동의" status={checks[0] && checks[1] ? "done" : "in-progress"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            "(필수) 2026년 OKR 기반 개인평가제도 안내문을 확인했어요",
            "(필수) 작성한 OKR이 평가자·인사담당자에게 공유됨에 동의해요",
            "(선택) AI 코칭 대화 내역이 익명화되어 코칭 품질 개선에 활용되는 것에 동의해요",
          ].map((t, i) => (
            <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input type="checkbox" checked={checks[i]} onChange={() => setChecks((c) => c.map((v, j) => (j === i ? !v : v)))} style={{ marginTop: 2, width: 16, height: 16, accentColor: "#3B5BDB" }} />
              <span style={{ fontSize: 13, color: "#3A4565", lineHeight: 1.5 }}>{t}</span>
            </label>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
