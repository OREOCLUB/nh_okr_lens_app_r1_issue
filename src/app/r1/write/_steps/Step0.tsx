"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { label, input, hint } from "./shared";
import type { Session } from "@/lib/auth";
import type { WizardState } from "@/lib/wizard";
import { CERT_SEED, CERT_GRADE_COLOR, searchCerts, type CertItem } from "@/lib/certDb";
import { getCertifications } from "@/lib/dataAccess";

// ── 자격증 검색 모달 — 회사 등급표(R3 입력)가 있으면 배지 표시 + 회사 분류 필터 ──
function CertSearchModal({ owned, onAdd, onClose }: { owned: string[]; onAdd: (name: string) => void; onClose: () => void }) {
  const [db, setDb] = useState<CertItem[]>(CERT_SEED);
  const [source, setSource] = useState<"db" | "local">("local");
  const [query, setQuery] = useState("");
  const [companyOnly, setCompanyOnly] = useState(false);

  useEffect(() => {
    // 회사 자격증 DB(Supabase certifications) 우선, 미연결이면 로컬 시드 유지
    getCertifications().then((rows) => {
      if (rows && rows.length > 0) {
        setDb(rows);
        setSource("db");
      }
    });
  }, []);

  const results = useMemo(() => searchCerts(db, query, companyOnly), [db, query, companyOnly]);

  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(15,26,54,.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: 560, maxHeight: "78vh", background: "#fff", borderRadius: 16, boxShadow: "0 24px 60px -12px rgba(15,26,54,.35)", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 24px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>🔍 자격증 검색</div>
            <span style={{ padding: "2px 8px", borderRadius: 999, background: source === "db" ? "#ECFAF1" : "#F1F3F8", color: source === "db" ? "#2F9E5E" : "#7C87A4", fontSize: 10.5, fontWeight: 700 }}>
              {source === "db" ? "회사 DB 연동" : "기본 목록"}
            </span>
            <button onClick={onClose} style={{ marginLeft: "auto", border: "none", background: "transparent", color: "#A6AEC2", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
          </div>
          <div style={{ fontSize: 12, color: "#7C87A4", marginTop: 4, lineHeight: 1.5 }}>
            이름·약어·분류·발급기관으로 검색해요. <b style={{ color: "#5B6685" }}>등급 배지</b>는 회사가 자격증 등급표에 분류해둔 항목이에요.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
              placeholder="예: AWS, 보안, SQLD, 데이터…"
              style={{ flex: 1, padding: "11px 14px", border: "1px solid #C5D0F7", borderRadius: 10, fontSize: 13.5, outline: "none", fontFamily: "var(--font-sans)" }}
            />
            <button
              onClick={() => setCompanyOnly((v) => !v)}
              style={{ padding: "0 16px", borderRadius: 10, border: `1.5px solid ${companyOnly ? "#3B5BDB" : "#E1E5EF"}`, background: companyOnly ? "#F1F4FD" : "#fff", color: companyOnly ? "#3B5BDB" : "#5B6685", fontSize: 12.5, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}
            >
              {companyOnly ? "✓ " : ""}회사 분류만
            </button>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "4px 24px 20px", display: "flex", flexDirection: "column", gap: 8 }}>
          {results.length === 0 && (
            <div style={{ padding: "36px 0", textAlign: "center", color: "#7C87A4", fontSize: 13, lineHeight: 1.6 }}>
              검색 결과가 없어요.<br />목록에 없는 자격증은 입력창에 직접 적고 Enter로 추가할 수 있어요.
            </div>
          )}
          {results.map((c) => {
            const has = owned.includes(c.name) || c.aliases.some((a) => owned.includes(a));
            const gc = c.companyGrade ? CERT_GRADE_COLOR[c.companyGrade.charAt(0)] : null;
            return (
              <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: "1px solid #ECEFF5", borderRadius: 11, background: has ? "#F9FAFC" : "#fff" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{c.name}</span>
                    {gc && c.companyGrade && (
                      <span className="mono" title="회사 자격증 등급표 분류" style={{ padding: "1px 8px", borderRadius: 999, background: gc.bg, color: gc.fg, fontSize: 10.5, fontWeight: 800 }}>★ 등급 {c.companyGrade}</span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 3 }}>{c.issuer} · {c.category}{c.aliases.length > 0 && ` · ${c.aliases.join(", ")}`}</div>
                </div>
                {has ? (
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: "#2F9E5E", flexShrink: 0 }}>✓ 보유</span>
                ) : (
                  <button onClick={() => onAdd(c.aliases[0] ?? c.name)} style={{ padding: "7px 14px", background: "#3B5BDB", color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-sans)", flexShrink: 0 }}>+ 추가</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

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

function TagInput({ tags, onRemove, onAdd }: { tags: string[]; onRemove: (t: string) => void; onAdd: (t: string) => void }) {
  const [draft, setDraft] = useState("");
  function commit() {
    const t = draft.trim();
    if (t && !tags.includes(t)) onAdd(t);
    setDraft("");
  }
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "10px 12px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, minHeight: 44, alignItems: "center" }}>
      {tags.map((t) => (
        <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", background: "#F1F4FD", color: "#213A8C", borderRadius: 8, fontSize: 12.5, fontWeight: 600 }}>
          {t}
          <button onClick={() => onRemove(t)} style={{ border: "none", background: "transparent", color: "#7C87A4", cursor: "pointer", fontSize: 13, lineHeight: 1 }}>×</button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
        placeholder="입력 후 Enter"
        style={{ flex: 1, minWidth: 110, border: "none", outline: "none", fontSize: 12.5, fontFamily: "var(--font-sans)", color: "#0F1A36" }}
      />
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

const AGREE_ITEMS = [
  "(필수) 2026년 OKR 기반 개인평가제도 안내문을 확인했어요",
  "(필수) 작성한 OKR이 평가자·인사담당자에게 공유됨에 동의해요",
  "(선택) AI 코칭 대화 내역이 익명화되어 코칭 품질 개선에 활용되는 것에 동의해요",
];

const SUGGESTED_CERTS = ["AWS SAP", "CKAD", "PMP"];

export function Step0({ state, set, user }: { state: WizardState; set: (fn: (s: WizardState) => WizardState) => void; user: Session }) {
  const p = state.profile;
  const [certSearchOpen, setCertSearchOpen] = useState(false);
  const setProfile = (patch: Partial<WizardState["profile"]>) =>
    set((s) => ({ ...s, profile: { ...s.profile, ...patch } }));

  // 진행률 — 6개 그룹 (직무·업무분장·근속·근무형태·자격증·약관)
  const groupDone = [
    true, // 직무/직렬 — 인사시스템 자동
    !!p.mainDuty.trim(),
    true, // 근속 — 인사시스템 자동
    !!p.workType,
    p.certs.length > 0,
    p.agree[0] && p.agree[1],
  ];
  const filled = groupDone.filter(Boolean).length;
  const total = groupDone.length;
  const pct = Math.round((filled / total) * 100);
  const needFix = total - filled;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* 진행률 + 마스터 데이터 출처 */}
      <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 55%)", border: "1px solid #C5D0F7", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>👤</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>{user.name} 님의 프로필</div>
          <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>
            {total}개 항목 중 {filled}개 입력 완료{needFix > 0 && <> · <span style={{ color: "#D98023", fontWeight: 600 }}>{needFix}개 보완 필요</span></>}
          </div>
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
          <div><label style={label}>본부</label><input style={input} value={user.dept} readOnly /></div>
          <div><label style={label}>팀</label><input style={input} value={user.team} readOnly /></div>
          <div><label style={label}>직급</label><input style={input} value={user.grade} readOnly /></div>
          <div>
            <label style={label}>직렬</label>
            <div style={{ display: "flex", background: "var(--page-bg)", borderRadius: 9, padding: 4, gap: 3 }}>
              {["SE", "DE", "PM"].map((s) => (
                <button key={s} onClick={() => setProfile({ jobSeries: s })} style={{ ...seg, background: p.jobSeries === s ? "#fff" : "transparent", color: p.jobSeries === s ? "#0F1A36" : "#7C87A4", fontWeight: p.jobSeries === s ? 700 : 500, boxShadow: p.jobSeries === s ? "0 1px 2px rgba(31,42,74,.08)" : "none" }}>{s}</button>
              ))}
            </div>
          </div>
        </div>
      </FieldGroup>

      {/* 2. 업무 분장 */}
      <FieldGroup icon="🗂️" title="업무 분장" status={p.mainDuty.trim() ? "done" : "in-progress"}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1 / 3" }}>
            <label style={label}>주요 업무 분장 <span style={{ color: "#D64545" }}>*</span></label>
            <input style={input} value={p.mainDuty} onChange={(e) => setProfile({ mainDuty: e.target.value })} placeholder="예: 결제플랫폼 백엔드 성능/튜닝" />
            <div style={hint}>STEP 3 객관성 검증 시 이 영역과 KR이 일치하는지 자동 확인해요.</div>
          </div>
          <div><label style={label}>담당 시스템 / 도메인</label><input style={input} value={p.systems} onChange={(e) => setProfile({ systems: e.target.value })} /></div>
          <div><label style={label}>주요 협업 대상</label><input style={input} value={p.collaborators} onChange={(e) => setProfile({ collaborators: e.target.value })} placeholder="예: SRE팀, 인프라팀" /></div>
        </div>
      </FieldGroup>

      {/* 3. 근속 정보 */}
      <FieldGroup icon="📆" title="근속 정보" status="done">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          <div><label style={label}>입사년도</label><input style={input} defaultValue="2018" readOnly /><div style={hint}>전체 근속 8년 4개월</div></div>
          <div><label style={label}>현 보직 발령일</label><input style={input} defaultValue="2022-03" readOnly /><div style={hint}>{user.team} 근속 4년 4개월</div></div>
          <div><label style={label}>이전 직무 경험</label><input style={input} value={p.prevExperience} onChange={(e) => setProfile({ prevExperience: e.target.value })} /><div style={hint}>최근 5년 내 주요 경력</div></div>
        </div>
      </FieldGroup>

      {/* 4. 근무 형태 */}
      <FieldGroup icon="🏢" title="근무 형태" status="done">
        <div style={{ display: "flex", gap: 12 }}>
          <Radio label="상주 근무" sub="본사 근무" value="onsite" current={p.workType} onChange={(v) => setProfile({ workType: v as WizardState["profile"]["workType"] })} />
          <Radio label="파견 근무" sub="고객사 상주" value="dispatch" current={p.workType} onChange={(v) => setProfile({ workType: v as WizardState["profile"]["workType"] })} />
          <Radio label="원격 · 혼합" sub="재택 병행" value="remote" current={p.workType} onChange={(v) => setProfile({ workType: v as WizardState["profile"]["workType"] })} />
        </div>
        {p.workType === "dispatch" && (
          <div style={{ marginTop: 12, padding: "12px 16px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12, color: "#7A4A14", lineHeight: 1.55 }}>
            💡 파견 근무자는 고객사 일정에 영향을 받는 KR의 도전성 가중치 산정 시 별도 기준이 적용돼요. 협업 대상에 고객사도 함께 적어주세요.
          </div>
        )}
      </FieldGroup>

      {/* 5. 자격증 — 직접 입력 + 🔍 검색(회사 등급표 DB 연동 대비) */}
      <FieldGroup icon="📜" title="보유 자격증" status={p.certs.length > 0 ? "done" : "pending"}>
        <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
          <div style={{ flex: 1 }}>
            <TagInput
              tags={p.certs}
              onRemove={(t) => setProfile({ certs: p.certs.filter((x) => x !== t) })}
              onAdd={(t) => setProfile({ certs: [...p.certs, t] })}
            />
          </div>
          <button
            onClick={() => setCertSearchOpen(true)}
            title="자격증 검색"
            style={{ width: 46, borderRadius: 10, border: "1px solid #C5D0F7", background: "#F1F4FD", color: "#3B5BDB", fontSize: 17, cursor: "pointer", flexShrink: 0 }}
          >
            🔍
          </button>
        </div>
        <div style={hint}>돋보기를 누르면 자격증 DB에서 검색할 수 있어요. 회사가 등급표에 분류한 자격증은 ★ 등급 배지가 함께 표시돼요.</div>
        {certSearchOpen && (
          <CertSearchModal
            owned={p.certs}
            onAdd={(name) => setProfile({ certs: [...p.certs, name] })}
            onClose={() => setCertSearchOpen(false)}
          />
        )}
        <div style={{ marginTop: 14, padding: "14px 16px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0A6B44", marginBottom: 4 }}>✨ 관련 자격증 제안 {SUGGESTED_CERTS.filter((s) => !p.certs.includes(s)).length}건</div>
          <div style={{ fontSize: 11.5, color: "#2F6B48", marginBottom: 10 }}>담당 업무({p.systems || "담당 시스템"}) 기반 추천</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {SUGGESTED_CERTS.filter((s) => !p.certs.includes(s)).map((s) => (
              <button key={s} onClick={() => setProfile({ certs: [...p.certs, s] })} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#0A6B44", cursor: "pointer", fontFamily: "var(--font-sans)" }}>+ {s}</button>
            ))}
          </div>
        </div>
      </FieldGroup>

      {/* 6. 약관 동의 */}
      <FieldGroup icon="✅" title="약관 동의" status={p.agree[0] && p.agree[1] ? "done" : "in-progress"}>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {AGREE_ITEMS.map((t, i) => (
            <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
              <input
                type="checkbox"
                checked={p.agree[i] ?? false}
                onChange={() => setProfile({ agree: p.agree.map((v, j) => (j === i ? !v : v)) })}
                style={{ marginTop: 2, width: 16, height: 16, accentColor: "#3B5BDB" }}
              />
              <span style={{ fontSize: 13, color: "#3A4565", lineHeight: 1.5 }}>{t}</span>
            </label>
          ))}
        </div>
      </FieldGroup>
    </div>
  );
}
