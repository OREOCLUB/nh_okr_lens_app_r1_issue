"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

const label: CSSProperties = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 7 };
const input: CSSProperties = { width: "100%", padding: "11px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, fontSize: 14, color: "#0F1A36", fontFamily: "var(--font-sans)", outline: "none" };
const hint: CSSProperties = { fontSize: 11.5, color: "#7C87A4", marginTop: 5, lineHeight: 1.5 };

const STATUS_DOT = {
  done: { bg: "#ECFAF1", fg: "#2F9E5E", border: "#BBE9CC", ico: "✓", label: "완료" },
  "in-progress": { bg: "#F1F4FD", fg: "#3B5BDB", border: "#C5D0F7", ico: "●", label: "입력 중" },
  pending: { bg: "var(--page-bg)", fg: "#7C87A4", border: "#E1E5EF", ico: "○", label: "미입력" },
};

function FieldGroup({ icon, title, desc, status, children }: { icon: string; title: string; desc?: string; status: keyof typeof STATUS_DOT; children: ReactNode }) {
  const dot = STATUS_DOT[status];
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 38, height: 38, borderRadius: 11, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36" }}>{title}</div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px", borderRadius: 999, background: dot.bg, color: dot.fg, border: `1px solid ${dot.border}`, fontSize: 10.5, fontWeight: 700 }}><span>{dot.ico}</span> {dot.label}</span>
          </div>
          {desc && <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 4, lineHeight: 1.55 }}>{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function Tags({ tags }: { tags: string[] }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10, minHeight: 46, alignItems: "center" }}>
      {tags.map((t) => (
        <span key={t} className="mono" style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "#F1F4FD", color: "#213A8C", border: "1px solid #C5D0F7", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>{t}</span>
      ))}
      <input placeholder="입력 후 Enter" style={{ flex: 1, minWidth: 120, border: "none", outline: "none", fontSize: 13, fontFamily: "var(--font-sans)", color: "#0F1A36" }} />
    </div>
  );
}

export default function R1MyPage() {
  const router = useRouter();
  const [jobSeries, setJobSeries] = useState("SE");
  const [workType, setWorkType] = useState("onsite");
  const filled = 5, total = 6, pct = Math.round((filled / total) * 100);

  return (
    <RoleShell
      role="R1"
      title="마이페이지"
      subtitle="정태영 · 운영본부 · 결제플랫폼팀 · 3급 SE"
      actions={<Button variant="primary" size="sm" onClick={() => router.push("/r1/write")}>이 프로필로 OKR 작성 →</Button>}
    >
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
          마이페이지 <span style={{ padding: "2px 8px", borderRadius: 999, background: "#E0F7EC", color: "#00794B", fontSize: 10.5, fontWeight: 700 }}>상시 업데이트</span>
        </div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>내 프로필을 최신 상태로 관리해주세요.</h1>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.55, maxWidth: 720 }}>직무·근속·자격증 정보는 <b>OKR 작성</b>에서 그대로 불러와 활용해요. 변화가 생기면 여기서 먼저 반영해두면 이후 흐름이 매끄러워집니다.</p>
      </div>

      {/* 진행률 + 출처 */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 22 }}>
        <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 70%)", border: "1px solid #C5D0F7", borderRadius: 14, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
            <span style={{ width: 36, height: 36, borderRadius: 10, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>정태영 님의 프로필 진행률</div>
              <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>6개 항목 중 {filled}개 입력 완료 · 1개 보완 필요</div>
            </div>
            <div className="mono ds-num" style={{ fontSize: 22, fontWeight: 700, color: "#3B5BDB" }}>{pct}%</div>
          </div>
          <div style={{ height: 8, background: "#fff", border: "1px solid #C5D0F7", borderRadius: 5, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3B5BDB, #5C7AE6)", borderRadius: 5 }} />
          </div>
        </div>
        <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>마스터 데이터 출처</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#3A4565" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#2F9E5E" }}>✓</span> 인사시스템 · 동기화 완료</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ color: "#2F9E5E" }}>✓</span> R3 마스터데이터 · 매핑 완료</div>
            <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 4, lineHeight: 1.55 }}>회색 항목은 인사시스템에서 자동으로 채워졌어요. 수정이 필요하면 인사담당자에게 요청해주세요.</div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <FieldGroup icon="🏢" title="직무 · 직렬" desc="인사시스템에서 자동 동기화된 정보예요." status="done">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            <div><label style={label}>본부 · 팀</label><input style={{ ...input, background: "#F9FAFC", color: "#5B6685" }} value="운영본부 · 결제플랫폼팀" readOnly /></div>
            <div><label style={label}>직급</label><input className="mono" style={{ ...input, background: "#F9FAFC", color: "#5B6685" }} value="3급" readOnly /></div>
            <div>
              <label style={label}>직렬</label>
              <div style={{ display: "flex", gap: 4, padding: 4, background: "var(--page-bg)", borderRadius: 10 }}>
                {["SE", "PM", "SM"].map((s) => (
                  <button key={s} onClick={() => setJobSeries(s)} className="mono" style={{ flex: 1, padding: "8px 10px", borderRadius: 7, background: jobSeries === s ? "#fff" : "transparent", color: jobSeries === s ? "#0F1A36" : "#7C87A4", fontWeight: jobSeries === s ? 700 : 500, fontSize: 12.5, border: "none", cursor: "pointer", boxShadow: jobSeries === s ? "0 1px 2px rgba(31,42,74,.08)" : "none" }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup icon="📝" title="업무 분장 · 담당 업무" desc="OKR의 객관성 검증에 활용돼요. 실제 책임 업무 영역을 정확히 적어주세요." status="done">
          <div style={{ display: "grid", gap: 14 }}>
            <div>
              <label style={label}>주요 업무 분장 <span style={{ color: "#D14343" }}>*</span></label>
              <textarea style={{ ...input, minHeight: 70, resize: "vertical", lineHeight: 1.55 }} defaultValue="결제플랫폼 백엔드 성능/튜닝 — APM 기반 응답속도 개선, 캐시 전략, DB 쿼리 최적화" />
              <div style={hint}>AI 정제 단계에서 이 영역과 KR이 일치하는지 자동 확인해요.</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div><label style={label}>담당 시스템 / 도메인</label><Tags tags={["결제 게이트웨이", "결제 인증모듈", "야간 배치"]} /></div>
              <div><label style={label}>주요 협업 대상</label><Tags tags={["SRE팀", "인프라팀"]} /></div>
            </div>
          </div>
        </FieldGroup>

        <FieldGroup icon="📅" title="근속 정보" desc="입사년도·현 보직 발령일이 KR 도전성 평가 시 참고돼요." status="done">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div><label style={label}>입사년도</label><input className="mono" style={{ ...input, background: "#F9FAFC", color: "#5B6685" }} value="2018" readOnly /><div style={hint}>전체 근속 <b style={{ color: "#0F1A36" }}>8년 4개월</b></div></div>
            <div><label style={label}>현 보직 발령일</label><input className="mono" style={input} defaultValue="2024.07.01" /><div style={hint}>결제플랫폼팀 근속 <b style={{ color: "#0F1A36" }}>2년</b></div></div>
            <div><label style={label}>이전 직무 경험</label><input style={input} defaultValue="결제정산팀 (3년 6개월)" /><div style={hint}>최근 5년 내 주요 경력</div></div>
          </div>
        </FieldGroup>

        <FieldGroup icon="🤝" title="사수 정보 · 인수인계" desc="1년 이내 팀 이동 시 이전 담당자를 지정하면 그분의 지난 OKR을 참고할 수 있어요. (평가 점수는 비공개)" status="done">
          <div style={{ border: "1px solid #BBE9CC", borderRadius: 12, padding: "16px 18px", background: "linear-gradient(135deg, #F4FBF7, #fff 70%)", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700 }}>이</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>이지훈 <span style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 500 }}>책임 · E0987</span></div>
              <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>결제플랫폼팀 (現 SRE팀 전배) · 인계일 2024.06.30</div>
            </div>
            <span style={{ padding: "5px 11px", borderRadius: 999, background: "#ECFAF1", color: "#2F9E5E", border: "1px solid #BBE9CC", fontSize: 11.5, fontWeight: 700 }}>✓ 승인 완료 · 열람 가능</span>
          </div>
        </FieldGroup>

        <FieldGroup icon="🏠" title="근무 형태" desc="상주/파견 여부에 따라 협업 범위와 평가 기준이 달라질 수 있어요." status="done">
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[["onsite", "상주 (본사)", "본사 사무실 출근"], ["dispatch", "파견", "외부 사이트 상주"], ["remote", "원격", "재택 또는 거점"], ["hybrid", "하이브리드", "주 N일 출근"]].map(([v, l, s]) => {
              const on = workType === v;
              return (
                <div key={v} onClick={() => setWorkType(v)} style={{ flex: 1, minWidth: 150, padding: "13px 15px", background: on ? "#F1F4FD" : "#fff", border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`, borderRadius: 11, cursor: "pointer", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${on ? "#3B5BDB" : "#C8CFDF"}`, background: "#fff", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>{on && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B5BDB" }} />}</div>
                  <div><div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{l}</div><div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>{s}</div></div>
                </div>
              );
            })}
          </div>
        </FieldGroup>

        <FieldGroup icon="📜" title="자격증 목록" desc="보유 자격증을 등록하면 관련 KR 작성 시 AI 코치가 활용 가이드를 제안해요." status="in-progress">
          <Tags tags={["AWS SAA", "CKA", "정보처리기사"]} />
        </FieldGroup>
      </div>

      <div style={{ marginTop: 28, padding: "18px 22px", background: "#fff", border: "1px solid #E6E9E4", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "var(--shadow-xs)" }}>
        <div style={{ fontSize: 13, color: "#5B6685" }}>마지막 저장 · <span className="mono">2026-06-28 14:22</span></div>
        <Button variant="primary" style={{ background: "#0A1F17", padding: "10px 22px" }} onClick={() => alert("변경사항이 저장되었습니다 (프로토타입)")}>변경사항 저장</Button>
      </div>
    </RoleShell>
  );
}
