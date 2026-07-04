"use client";

// CertField — 자격증 입력 공용 컴포넌트 (STEP 0 · 마이페이지 동일 UX).
// 태그 직접 입력 + 🔍 검색 모달(회사 등급표 배지·회사 분류 필터) + AI 추천 제안.
import { useEffect, useMemo, useState } from "react";
import { CERT_SEED, CERT_GRADE_COLOR, searchCerts, type CertItem } from "@/lib/certDb";
import { getCertifications } from "@/lib/dataAccess";

const SUGGESTED_CERTS = ["AWS SAP", "CKAD", "PMP"];

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

/** 자격증 입력 영역 전체 — STEP 0과 마이페이지가 동일하게 사용 */
export function CertField({ certs, onChange, suggestBasis }: { certs: string[]; onChange: (next: string[]) => void; suggestBasis?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const suggested = SUGGESTED_CERTS.filter((s) => !certs.includes(s));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, alignItems: "stretch" }}>
        <div style={{ flex: 1 }}>
          <TagInput
            tags={certs}
            onRemove={(t) => onChange(certs.filter((x) => x !== t))}
            onAdd={(t) => onChange([...certs, t])}
          />
        </div>
        <button
          onClick={() => setSearchOpen(true)}
          title="자격증 검색"
          style={{ width: 46, borderRadius: 10, border: "1px solid #C5D0F7", background: "#F1F4FD", color: "#3B5BDB", fontSize: 17, cursor: "pointer", flexShrink: 0 }}
        >
          🔍
        </button>
      </div>
      <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 5, lineHeight: 1.5 }}>
        돋보기를 누르면 자격증 DB에서 검색할 수 있어요. 회사가 등급표에 분류한 자격증은 ★ 등급 배지가 함께 표시돼요.
      </div>
      {suggested.length > 0 && (
        <div style={{ marginTop: 14, padding: "14px 16px", background: "#F1FBF6", border: "1px solid #B9F1D8", borderRadius: 10 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "#0A6B44", marginBottom: 4 }}>✨ 관련 자격증 제안 {suggested.length}건</div>
          <div style={{ fontSize: 11.5, color: "#2F6B48", marginBottom: 10 }}>담당 업무({suggestBasis || "담당 시스템"}) 기반 추천</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {suggested.map((s) => (
              <button key={s} onClick={() => onChange([...certs, s])} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#fff", border: "1px solid #B9F1D8", borderRadius: 999, fontSize: 12, fontWeight: 600, color: "#0A6B44", cursor: "pointer", fontFamily: "var(--font-sans)" }}>+ {s}</button>
            ))}
          </div>
        </div>
      )}
      {searchOpen && (
        <CertSearchModal
          owned={certs}
          onAdd={(name) => onChange([...certs, name])}
          onClose={() => setSearchOpen(false)}
        />
      )}
    </div>
  );
}
