"use client";

import { useState, type ReactNode } from "react";
import { RoleShell } from "@/components/RoleShell";
import { Button } from "@/components/Button";

const envLabel = { fontSize: 12, fontWeight: 700, color: "#3A4565", letterSpacing: "0.02em" };

function EnvSection({ icon, bg, fg, title, desc, badge, children }: { icon: string; bg: string; fg: string; title: string; desc: string; badge?: ReactNode; children: ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "22px 24px", boxShadow: "var(--shadow-xs)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
        <div style={{ width: 40, height: 40, borderRadius: 11, background: bg, color: fg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 19, flexShrink: 0 }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36" }}>{title}</div>
            {badge}
          </div>
          <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 4, lineHeight: 1.55 }}>{desc}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function SecretInput({ label, value, provider, configured }: { label: string; value: string; provider: string; configured: boolean }) {
  const [visible, setVisible] = useState(false);
  const [test, setTest] = useState<null | "testing" | "ok">(null);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <label style={envLabel}>{label}</label>
        <span style={{ padding: "2px 8px", background: configured ? "#ECFAF1" : "#FFF7EC", color: configured ? "#2F9E5E" : "#D98023", borderRadius: 999, fontSize: 10, fontWeight: 700 }}>{configured ? "● 등록됨" : "○ 미등록"}</span>
        <span className="mono" style={{ marginLeft: "auto", fontSize: 10.5, color: "#7C87A4" }}>{provider}</span>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 9, padding: "0 4px 0 12px" }}>
          <input type={visible ? "text" : "password"} defaultValue={value} placeholder="API 키 입력" className="mono" style={{ flex: 1, border: "none", background: "transparent", outline: "none", padding: "10px 0", fontSize: 12.5, color: "#0F1A36" }} />
          <button onClick={() => setVisible(!visible)} style={{ width: 30, height: 30, background: "transparent", border: "none", color: "#7C87A4", cursor: "pointer", fontSize: 14 }}>{visible ? "🙈" : "👁"}</button>
        </div>
        <button onClick={() => { setTest("testing"); setTimeout(() => setTest("ok"), 800); }} disabled={!configured} style={{ padding: "0 14px", background: test === "ok" ? "#ECFAF1" : "#fff", border: `1px solid ${test === "ok" ? "#BBE9CC" : "#E1E5EF"}`, borderRadius: 9, fontSize: 12, fontWeight: 700, color: test === "ok" ? "#2F9E5E" : "#3A4565", cursor: configured ? "pointer" : "not-allowed", opacity: configured ? 1 : 0.5, fontFamily: "var(--font-sans)", whiteSpace: "nowrap" }}>{test === "testing" ? "⏳ 테스트" : test === "ok" ? "✓ 성공" : "🧪 연결 테스트"}</button>
      </div>
    </div>
  );
}

function Toggle({ label, desc, sub, checked, onChange }: { label: string; desc: string; sub?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 10 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{label}</div>
        <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>
        {sub && <div className="mono" style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>{sub}</div>}
      </div>
      <button onClick={() => onChange(!checked)} style={{ width: 42, height: 24, borderRadius: 999, position: "relative", background: checked ? "#00A968" : "#D1D8E5", border: "none", cursor: "pointer", flexShrink: 0 }}>
        <span style={{ position: "absolute", top: 3, left: checked ? 21 : 3, width: 18, height: 18, borderRadius: "50%", background: "#fff", transition: "left 220ms cubic-bezier(0.16,1,0.3,1)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }} />
      </button>
    </div>
  );
}

export default function R3EnvPage() {
  const [defaultLLM, setDefaultLLM] = useState("anthropic");
  const [sso, setSso] = useState(true);
  const [nEmail, setNEmail] = useState(true);
  const [nSlack, setNSlack] = useState(true);
  const [nKakao, setNKakao] = useState(false);
  const [fAI, setFAI] = useState(true);
  const [fBeta, setFBeta] = useState(false);
  const [fDebug, setFDebug] = useState(false);

  return (
    <RoleShell
      role="R3"
      title="환경 설정"
      subtitle="한지영 · 시스템 관리자 권한"
      actions={<Button variant="primary" size="sm" style={{ background: "#E07A3C" }} onClick={() => alert("환경 설정이 저장되었습니다 (프로토타입)")}>변경사항 저장</Button>}
    >
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>System Environment</div>
        <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>시스템 환경 설정</h1>
        <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>LLM API 키, DB 커넥션, SSO 연동 등 시스템 운영에 필요한 정보를 관리해요.</p>
      </div>

      <div style={{ padding: "13px 16px", background: "linear-gradient(135deg, #FFF7EC 0%, #FFFAF3 60%, #fff 100%)", border: "1px solid #FFE0BA", borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 22 }}>
        <span style={{ fontSize: 18, marginTop: 1 }}>🛡️</span>
        <div style={{ fontSize: 12.5, color: "#7A4A14", lineHeight: 1.6 }}><b>보안 안내</b> — 여기서 입력한 API 키와 DB 접속 정보는 AES-256 암호화되어 저장돼요. 시스템 관리자만 접근할 수 있으며, 모든 변경은 감사 로그에 기록됩니다.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <EnvSection icon="✨" bg="#F1FBF6" fg="#00A968" title="LLM API 등록" desc="AI 코칭·KR 정제에 사용되는 LLM API 키를 등록해주세요. 실패 시 다른 키로 자동 폴백해요." badge={<span style={{ padding: "3px 9px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>2 / 3 등록</span>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <SecretInput label="🅰️ Anthropic Claude API Key" value="sk-ant-api03-XXXXXXXXXXXXXXXXXXXX" provider="claude-sonnet-5" configured />
            <SecretInput label="🅾️ OpenAI API Key" value="sk-proj-YYYYYYYYYYYYYYYY" provider="gpt-4o" configured />
            <SecretInput label="🅶 Google Gemini API Key" value="" provider="gemini-1.5-pro" configured={false} />
            <div style={{ paddingTop: 12, borderTop: "1px solid #ECEFF5" }}>
              <label style={{ ...envLabel, display: "block", marginBottom: 8 }}>기본 사용 모델</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                {[["anthropic", "🅰️", "Claude"], ["openai", "🅾️", "GPT-4o"], ["gemini", "🅶", "Gemini"]].map(([id, ico, l]) => {
                  const on = defaultLLM === id;
                  return (
                    <div key={id} onClick={() => setDefaultLLM(id)} style={{ padding: 10, borderRadius: 9, border: `1.5px solid ${on ? "#00A968" : "#E1E5EF"}`, background: on ? "#F1FBF6" : "#fff", cursor: "pointer", textAlign: "center" }}>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{ico}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: on ? "#00794B" : "#3A4565" }}>{l}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </EnvSection>

        <EnvSection icon="🗄️" bg="#F0E9FB" fg="#7C4DD9" title="DB 커넥션 정보" desc="OKR 데이터와 평가 이력을 저장할 PostgreSQL/Supabase 접속 정보를 설정합니다." badge={<span style={{ padding: "3px 9px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>연결됨</span>}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ ...envLabel, display: "block", marginBottom: 6 }}>Database URL</label>
              <textarea defaultValue="postgresql://okrlens_admin:****@db.okrlens.internal:5432/okrlens_prod" className="mono" style={{ width: "100%", padding: "10px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 11.5, color: "#0F1A36", outline: "none", resize: "vertical", minHeight: 54, lineHeight: 1.5 }} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={{ ...envLabel, display: "block", marginBottom: 6 }}>커넥션 풀 크기</label><input defaultValue="20" className="mono" style={{ width: "100%", padding: "10px 12px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12.5, color: "#0F1A36", outline: "none" }} /></div>
              <div><label style={{ ...envLabel, display: "block", marginBottom: 6 }}>타임아웃 (ms)</label><input defaultValue="5000" className="mono" style={{ width: "100%", padding: "10px 12px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12.5, color: "#0F1A36", outline: "none" }} /></div>
            </div>
            <button onClick={() => alert("DB 연결 테스트는 준비 중이에요 🙂")} style={{ padding: 10, background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 12, fontWeight: 700, color: "#3A4565", cursor: "pointer", fontFamily: "var(--font-sans)" }}>🧪 연결 테스트</button>
          </div>
        </EnvSection>

        <EnvSection icon="🔒" bg="#ECFAF1" fg="#2F9E5E" title="사내 SSO 연동" desc="회사 계정으로만 로그인하도록 SSO(SAML/OAuth) 연동을 설정합니다." badge={sso ? <span style={{ padding: "3px 9px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>활성</span> : undefined}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Toggle label="사내 SSO 로그인 활성화" desc="비활성화 시 이메일+비밀번호 로그인만 허용됩니다" sub="현재 연동: Azure AD · okrlens.internal" checked={sso} onChange={setSso} />
            <div><label style={{ ...envLabel, display: "block", marginBottom: 6 }}>SSO Provider</label>
              <select defaultValue="azure" style={{ width: "100%", padding: "10px 12px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 9, fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36", outline: "none", cursor: "pointer" }}>
                <option value="azure">Microsoft Azure AD (SAML)</option>
                <option value="google">Google Workspace (OAuth)</option>
                <option value="okta">Okta</option>
              </select>
            </div>
            <div><label style={{ ...envLabel, display: "block", marginBottom: 6 }}>Redirect URI</label><input readOnly defaultValue="https://okrlens.company.co.kr/auth/callback" className="mono" style={{ width: "100%", padding: "10px 12px", background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 9, fontSize: 11.5, color: "#5B6685", outline: "none" }} /></div>
          </div>
        </EnvSection>

        <EnvSection icon="📣" bg="#FFEDE2" fg="#E07A3C" title="알림 발송 채널" desc="평가 일정·마감·코칭 요청 알림을 어떤 채널로 발송할지 설정합니다.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Toggle label="📧 이메일 알림" desc="SMTP 발송 · 사내 메일 도메인" sub="smtp.company.co.kr:587" checked={nEmail} onChange={setNEmail} />
            <Toggle label="💬 사내 메신저 (Slack)" desc="#okr-notifications 채널로 발송" sub="Webhook URL 등록됨" checked={nSlack} onChange={setNSlack} />
            <Toggle label="🗨️ 카카오톡 알림톡" desc="긴급 마감 시 개인 카카오톡 발송" sub="Bizmessage API 미등록" checked={nKakao} onChange={setNKakao} />
          </div>
        </EnvSection>

        <EnvSection icon="🚩" bg="#F1F3F8" fg="#5B6685" title="Feature Flags" desc="특정 기능을 켜고 끌 수 있어요. 베타 기능은 신중히 활성화해주세요.">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Toggle label="✨ AI 코칭 기능" desc="LLM 기반 KR 정제 · 객관성 검증 · 3안 비교" checked={fAI} onChange={setFAI} />
            <Toggle label="🧪 베타 기능 노출" desc="이력 회고·자동 요약 등 실험 기능" checked={fBeta} onChange={setFBeta} />
            <Toggle label="🐛 디버그 모드" desc="상세 로그·성능 측정·개발자 도구" checked={fDebug} onChange={setFDebug} />
          </div>
        </EnvSection>

        <EnvSection icon="ℹ️" bg="#F1F4FD" fg="#3B5BDB" title="시스템 정보" desc="현재 배포된 버전과 리소스 사용 현황이에요.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[["버전", "v2.1.3", "", "2026-06-30 배포"], ["빌드", "#a3f9e2c", "", "main branch"], ["가입 유저", "552", "명", ""], ["이번달 API 호출", "48,231", "", "한도 100,000 (48%)"], ["DB 사용량", "12.4", "GB", "여유 87.6 GB"], ["월 예상 비용", "$482", "", "LLM $310 + 인프라 $172"]].map(([l, v, u, sub]) => (
              <div key={l} style={{ padding: "12px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 9 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase" }}>{l}</div>
                <div className="mono" style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", marginTop: 3 }}>{v}{u && <span style={{ fontSize: 11, color: "#7C87A4", fontWeight: 500, marginLeft: 3 }}>{u}</span>}</div>
                {sub && <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>{sub}</div>}
              </div>
            ))}
          </div>
        </EnvSection>
      </div>
    </RoleShell>
  );
}
