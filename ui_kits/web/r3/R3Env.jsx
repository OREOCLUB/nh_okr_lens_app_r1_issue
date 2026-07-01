// R3Env.jsx — 인사담당자용 시스템 환경 설정
// - LLM API 키 3개 (Anthropic Claude, OpenAI, Google Gemini)
// - DB 커넥션 정보 (Supabase / PostgreSQL)
// - 사내 SSO 연동 설정
// - 알림 발송 채널 (이메일/사내메신저)
// - Feature Flags

function EnvSection({ icon, iconBg, iconFg, title, desc, badge, children }) {
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "22px 24px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11,
          background: iconBg, color: iconFg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 19, flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>{title}</div>
            {badge}
          </div>
          {desc && <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 4, lineHeight: 1.55 }}>{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function SecretInput({ label, defaultValue, provider, docLink, testable }) {
  const [visible, setVisible] = React.useState(false);
  const [value, setValue] = React.useState(defaultValue || "");
  const [testStatus, setTestStatus] = React.useState(null);

  const runTest = () => {
    setTestStatus("testing");
    setTimeout(() => setTestStatus("ok"), 900);
  };

  const isConfigured = value && value.length > 10;
  const masked = value.replace(/./g, "•").slice(0, 32);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <label style={envLabelStyle}>{label}</label>
        {isConfigured ? (
          <span style={{ padding: "2px 8px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            <span>●</span> 등록됨
          </span>
        ) : (
          <span style={{ padding: "2px 8px", background: "#FFF7EC", color: "#D98023", borderRadius: 999, fontSize: 10, fontWeight: 700, display: "flex", alignItems: "center", gap: 3 }}>
            <span>○</span> 미등록
          </span>
        )}
        {provider && <span style={{ marginLeft: "auto", fontSize: 10.5, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>{provider}</span>}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <div style={{
          flex: 1, display: "flex", alignItems: "center",
          background: "#F9FAFC", border: "1px solid #E1E5EF", borderRadius: 9,
          padding: "0 4px 0 12px",
        }}>
          <input
            type={visible ? "text" : "password"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="sk-... 또는 API 키 입력"
            style={{
              flex: 1, border: "none", background: "transparent", outline: "none",
              padding: "10px 0", fontSize: 12.5, fontFamily: "var(--font-mono)", color: "#0F1A36",
            }}
          />
          <button onClick={() => setVisible(!visible)} title={visible ? "숨기기" : "표시"} style={{
            width: 30, height: 30, background: "transparent", border: "none",
            color: "#7C87A4", cursor: "pointer", fontFamily: "inherit", fontSize: 14,
          }}>{visible ? "🙈" : "👁"}</button>
        </div>
        {testable && (
          <button onClick={runTest} disabled={!isConfigured || testStatus === "testing"} style={{
            padding: "0 14px", background: testStatus === "ok" ? "#ECFAF1" : "#fff",
            border: `1px solid ${testStatus === "ok" ? "#BBE9CC" : "#E1E5EF"}`,
            borderRadius: 9, fontSize: 12, fontWeight: 700,
            color: testStatus === "ok" ? "#2F9E5E" : "#3A4565",
            cursor: isConfigured ? "pointer" : "not-allowed",
            fontFamily: "var(--font-sans)", opacity: isConfigured ? 1 : 0.5,
            display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
          }}>
            {testStatus === "testing" ? "⏳ 테스트 중..." :
             testStatus === "ok"      ? "✓ 연결 성공" :
                                        "🧪 연결 테스트"}
          </button>
        )}
      </div>
      {docLink && (
        <div style={{ marginTop: 5, fontSize: 10.5, color: "#7C87A4", display: "flex", alignItems: "center", gap: 4 }}>
          <span>💡</span>
          <span>{docLink}</span>
        </div>
      )}
    </div>
  );
}

const envLabelStyle = { fontSize: 12, fontWeight: 700, color: "#3A4565", letterSpacing: "0.02em" };

function ToggleRow({ label, desc, checked, onChange, sub }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5",
      borderRadius: 10,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#0F1A36" }}>{label}</div>
        {desc && <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2, lineHeight: 1.5 }}>{desc}</div>}
        {sub && <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3, fontFamily: "var(--font-mono)" }}>{sub}</div>}
      </div>
      <button onClick={() => onChange && onChange(!checked)} style={{
        width: 42, height: 24, borderRadius: 999, position: "relative",
        background: checked ? "#3B5BDB" : "#D1D8E5",
        border: "none", cursor: "pointer", flexShrink: 0,
        transition: "background 180ms",
      }}>
        <span style={{
          position: "absolute", top: 3, left: checked ? 21 : 3,
          width: 18, height: 18, borderRadius: "50%", background: "#fff",
          transition: "left 220ms cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
        }}/>
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// R3Env 메인
// ─────────────────────────────────────────────
function R3Env() {
  const [anthropicKey, setAnthropicKey] = React.useState("sk-ant-api03-XXXXXXXXXXXXXXXXXXXXXXXX");
  const [openaiKey, setOpenaiKey] = React.useState("sk-proj-YYYYYYYYYYYYYYYY");
  const [geminiKey, setGeminiKey] = React.useState("");
  const [defaultLLM, setDefaultLLM] = React.useState("anthropic");

  const [dbUrl, setDbUrl] = React.useState("postgresql://okrlens_admin:****@db.okrlens.internal:5432/okrlens_prod");
  const [dbPoolSize, setDbPoolSize] = React.useState("20");

  const [ssoEnabled, setSsoEnabled] = React.useState(true);
  const [notifyEmail, setNotifyEmail] = React.useState(true);
  const [notifySlack, setNotifySlack] = React.useState(true);
  const [notifyKakao, setNotifyKakao] = React.useState(false);

  const [flagAI, setFlagAI] = React.useState(true);
  const [flagBeta, setFlagBeta] = React.useState(false);
  const [flagDebug, setFlagDebug] = React.useState(false);

  const handleSave = () => window.notYet("환경 설정이 저장되었어요! (실제 저장은 향후 구현 예정)");

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="환경 설정" subtitle="이수경 · 시스템 관리자 권한"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 40px" }}>

        {/* Hero */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#E07A3C", letterSpacing: "0.04em", textTransform: "uppercase" }}>System Environment</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              시스템 환경 설정
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13.5, color: "#5B6685" }}>
              LLM API 키, DB 커넥션, SSO 연동 등 시스템 운영에 필요한 정보를 관리해요.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <button onClick={() => window.notYet("변경 이력 조회")} style={{
            padding: "10px 16px", background: "#fff", border: "1px solid #E1E5EF",
            borderRadius: 10, fontSize: 13, color: "#3A4565", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>📜 변경 이력</button>
          <button onClick={handleSave} style={{
            padding: "10px 20px", background: "#E07A3C", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-sans)", boxShadow: "0 4px 12px -4px rgba(224,122,60,.5)",
          }}>변경사항 저장</button>
        </div>

        {/* Security warning */}
        <div style={{
          padding: "13px 16px",
          background: "linear-gradient(135deg, #FFF7EC 0%, #FFFAF3 60%, #fff 100%)",
          border: "1px solid #FFE0BA", borderRadius: 12,
          display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 22,
        }}>
          <span style={{ fontSize: 18, marginTop: 1 }}>🛡️</span>
          <div style={{ fontSize: 12.5, color: "#7A4A14", lineHeight: 1.6 }}>
            <b>보안 안내</b> — 여기서 입력한 API 키와 DB 접속 정보는 AES-256 암호화되어 저장돼요. 시스템 관리자만 접근할 수 있으며, 모든 변경은 감사 로그에 기록됩니다. 실제 운영 시 <b>Vault 연동</b>을 통해 관리하는 것을 권장합니다.
          </div>
        </div>

        {/* Two column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>

          {/* ========== LLM API ========== */}
          <EnvSection
            icon="✨" iconBg="#F1F4FD" iconFg="#3B5BDB"
            title="LLM API 등록"
            desc="AI 코칭 및 KR 정제 기능에 사용되는 LLM 모델의 API 키를 등록해주세요. 기본 모델을 지정할 수 있고, 실패 시 다른 키로 자동 폴백해요."
            badge={<span style={{ padding: "3px 9px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>2 / 3 등록</span>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <SecretInput label="🅰️ Anthropic Claude API Key" defaultValue={anthropicKey}
                provider="claude-sonnet-4-5-20250929"
                docLink="https://console.anthropic.com/settings/keys 에서 발급"
                testable/>
              <SecretInput label="🅾️ OpenAI API Key" defaultValue={openaiKey}
                provider="gpt-4o"
                docLink="https://platform.openai.com/api-keys 에서 발급"
                testable/>
              <SecretInput label="🅶 Google Gemini API Key" defaultValue={geminiKey}
                provider="gemini-1.5-pro"
                docLink="https://aistudio.google.com/apikey 에서 발급"
                testable/>

              {/* Default LLM */}
              <div style={{ paddingTop: 12, borderTop: "1px solid #ECEFF5" }}>
                <label style={{ ...envLabelStyle, display: "block", marginBottom: 8 }}>기본 사용 모델</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
                  {[
                    { id: "anthropic", ico: "🅰️", label: "Claude" },
                    { id: "openai",    ico: "🅾️", label: "GPT-4o" },
                    { id: "gemini",    ico: "🅶", label: "Gemini" },
                  ].map(m => (
                    <div key={m.id} onClick={() => setDefaultLLM(m.id)} style={{
                      padding: "10px", borderRadius: 9,
                      border: `1.5px solid ${defaultLLM === m.id ? "#3B5BDB" : "#E1E5EF"}`,
                      background: defaultLLM === m.id ? "#F1F4FD" : "#fff",
                      cursor: "pointer", textAlign: "center",
                    }}>
                      <div style={{ fontSize: 18, marginBottom: 3 }}>{m.ico}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: defaultLLM === m.id ? "#3B5BDB" : "#3A4565" }}>{m.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </EnvSection>

          {/* ========== DB Connection ========== */}
          <EnvSection
            icon="🗄️" iconBg="#F0E9FB" iconFg="#7C4DD9"
            title="DB 커넥션 정보"
            desc="OKR 데이터와 평가 이력을 저장할 PostgreSQL/Supabase 접속 정보를 설정합니다."
            badge={<span style={{ padding: "3px 9px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>연결됨</span>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>Database URL</label>
                <textarea value={dbUrl} onChange={(e) => setDbUrl(e.target.value)}
                  style={{
                    width: "100%", padding: "10px 12px", background: "#F9FAFC",
                    border: "1px solid #E1E5EF", borderRadius: 9,
                    fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#0F1A36",
                    outline: "none", resize: "vertical", minHeight: 54, lineHeight: 1.5,
                    boxSizing: "border-box",
                  }}/>
                <div style={{ marginTop: 5, fontSize: 10.5, color: "#7C87A4" }}>
                  💡 postgresql://user:password@host:port/database
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>커넥션 풀 크기</label>
                  <input value={dbPoolSize} onChange={(e) => setDbPoolSize(e.target.value)}
                    style={{
                      width: "100%", padding: "10px 12px", background: "#fff",
                      border: "1px solid #E1E5EF", borderRadius: 9,
                      fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#0F1A36",
                      outline: "none", boxSizing: "border-box",
                    }}/>
                </div>
                <div>
                  <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>연결 타임아웃 (ms)</label>
                  <input defaultValue="5000"
                    style={{
                      width: "100%", padding: "10px 12px", background: "#fff",
                      border: "1px solid #E1E5EF", borderRadius: 9,
                      fontFamily: "var(--font-mono)", fontSize: 12.5, color: "#0F1A36",
                      outline: "none", boxSizing: "border-box",
                    }}/>
                </div>
              </div>

              <div>
                <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>백업 정책</label>
                <select defaultValue="daily" style={{
                  width: "100%", padding: "10px 12px", background: "#fff",
                  border: "1px solid #E1E5EF", borderRadius: 9,
                  fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                  outline: "none", cursor: "pointer", boxSizing: "border-box",
                }}>
                  <option value="hourly">시간별 백업 (매시 정각)</option>
                  <option value="daily">일별 백업 (매일 03:00)</option>
                  <option value="weekly">주별 백업 (매주 일요일)</option>
                </select>
              </div>

              <div style={{ display: "flex", gap: 8, paddingTop: 8 }}>
                <button onClick={() => window.notYet("DB 연결 테스트 수행")} style={{
                  flex: 1, padding: "10px", background: "#fff",
                  border: "1px solid #E1E5EF", borderRadius: 9,
                  fontSize: 12, fontWeight: 700, color: "#3A4565",
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                }}>🧪 연결 테스트</button>
                <button onClick={() => window.notYet("스키마 마이그레이션 실행")} style={{
                  flex: 1, padding: "10px", background: "#F0E9FB",
                  border: "1px solid #DCC9F4", borderRadius: 9,
                  fontSize: 12, fontWeight: 700, color: "#5B33B0",
                  cursor: "pointer", fontFamily: "var(--font-sans)",
                }}>🔄 마이그레이션</button>
              </div>
            </div>
          </EnvSection>

          {/* ========== SSO ========== */}
          <EnvSection
            icon="🔒" iconBg="#ECFAF1" iconFg="#2F9E5E"
            title="사내 SSO 연동"
            desc="회사 계정으로만 로그인할 수 있도록 SSO(SAML/OAuth) 연동 정보를 설정합니다."
            badge={ssoEnabled && <span style={{ padding: "3px 9px", background: "#ECFAF1", color: "#2F9E5E", borderRadius: 999, fontSize: 10.5, fontWeight: 700 }}>활성</span>}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <ToggleRow
                label="사내 SSO 로그인 활성화"
                desc="비활성화 시 이메일+비밀번호 로그인만 허용됩니다"
                sub="현재 연동: Azure AD · okrlens.internal"
                checked={ssoEnabled} onChange={setSsoEnabled}
              />
              <div>
                <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>SSO Provider</label>
                <select defaultValue="azure" style={{
                  width: "100%", padding: "10px 12px", background: "#fff",
                  border: "1px solid #E1E5EF", borderRadius: 9,
                  fontFamily: "var(--font-sans)", fontSize: 12.5, color: "#0F1A36",
                  outline: "none", cursor: "pointer", boxSizing: "border-box",
                }}>
                  <option value="azure">Microsoft Azure AD (SAML)</option>
                  <option value="google">Google Workspace (OAuth)</option>
                  <option value="okta">Okta</option>
                  <option value="custom">Custom SAML</option>
                </select>
              </div>
              <div>
                <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>Tenant ID</label>
                <input defaultValue="12345678-abcd-1234-5678-abcdef123456" style={{
                  width: "100%", padding: "10px 12px", background: "#F9FAFC",
                  border: "1px solid #E1E5EF", borderRadius: 9,
                  fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#0F1A36",
                  outline: "none", boxSizing: "border-box",
                }}/>
              </div>
              <div>
                <label style={{ ...envLabelStyle, display: "block", marginBottom: 6 }}>Redirect URI</label>
                <input defaultValue="https://okrlens.company.co.kr/auth/callback" readOnly style={{
                  width: "100%", padding: "10px 12px", background: "#F9FAFC",
                  border: "1px solid #E1E5EF", borderRadius: 9,
                  fontFamily: "var(--font-mono)", fontSize: 11.5, color: "#5B6685",
                  outline: "none", boxSizing: "border-box",
                }}/>
              </div>
            </div>
          </EnvSection>

          {/* ========== Notification ========== */}
          <EnvSection
            icon="📣" iconBg="#FFEDE2" iconFg="#E07A3C"
            title="알림 발송 채널"
            desc="평가 일정, 마감 알림, 코칭 요청 등의 알림을 어떤 채널로 발송할지 설정합니다."
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ToggleRow
                label="📧 이메일 알림"
                desc="SMTP 발송 · 사내 메일 도메인"
                sub="SMTP: smtp.company.co.kr:587"
                checked={notifyEmail} onChange={setNotifyEmail}
              />
              <ToggleRow
                label="💬 사내 메신저 (Slack)"
                desc="#okr-notifications 채널로 발송"
                sub="Webhook URL 등록됨"
                checked={notifySlack} onChange={setNotifySlack}
              />
              <ToggleRow
                label="🗨️ 카카오톡 알림톡"
                desc="긴급 마감 시 개인 카카오톡으로 발송"
                sub="Bizmessage API 미등록"
                checked={notifyKakao} onChange={setNotifyKakao}
              />

              <div style={{ marginTop: 8, padding: "10px 12px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 9 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>발송 시간대</div>
                <div style={{ fontSize: 11.5, color: "#5B6685", lineHeight: 1.55 }}>
                  업무 시간(09:00 ~ 18:00) 외에는 발송이 억제돼요. 긴급 마감 알림은 예외 처리됩니다.
                </div>
              </div>
            </div>
          </EnvSection>

          {/* ========== Feature Flags ========== */}
          <EnvSection
            icon="🚩" iconBg="#F1F3F8" iconFg="#5B6685"
            title="Feature Flags"
            desc="특정 기능을 켜고 끌 수 있어요. 베타 기능은 신중히 활성화해주세요."
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <ToggleRow
                label="✨ AI 코칭 기능"
                desc="LLM 기반 KR 정제 · 객관성 검증 · 3안 비교"
                checked={flagAI} onChange={setFlagAI}
              />
              <ToggleRow
                label="🧪 베타 기능 노출"
                desc="이력 회고, 자동 요약 등 실험 기능 (일부 사용자에게만)"
                checked={flagBeta} onChange={setFlagBeta}
              />
              <ToggleRow
                label="🐛 디버그 모드"
                desc="상세 로그 · 성능 측정 · 개발자 도구 활성화"
                checked={flagDebug} onChange={setFlagDebug}
              />
            </div>
          </EnvSection>

          {/* ========== 기타 시스템 정보 ========== */}
          <EnvSection
            icon="ℹ️" iconBg="#F1F4FD" iconFg="#3B5BDB"
            title="시스템 정보"
            desc="현재 배포된 버전과 리소스 사용 현황이에요."
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "버전",         value: "v2.1.3",       sub: "2026-06-30 배포" },
                { label: "빌드",         value: "#a3f9e2c",     sub: "main branch" },
                { label: "가입 유저",    value: "552",         unit: "명" },
                { label: "이번달 API 호출", value: "48,231",     sub: "한도 100,000 (48%)" },
                { label: "DB 사용량",    value: "12.4",         unit: "GB", sub: "여유 87.6 GB" },
                { label: "월 예상 비용",  value: "$482",         sub: "LLM $310 + 인프라 $172" },
              ].map((it, i) => (
                <div key={i} style={{ padding: "12px 14px", background: "#F9FAFC", border: "1px solid #ECEFF5", borderRadius: 9 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase" }}>{it.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#0F1A36", fontFamily: "var(--font-mono)", marginTop: 3 }}>
                    {it.value}{it.unit && <span style={{ fontSize: 11, color: "#7C87A4", fontWeight: 500, marginLeft: 3 }}>{it.unit}</span>}
                  </div>
                  {it.sub && <div style={{ fontSize: 10.5, color: "#7C87A4", marginTop: 3 }}>{it.sub}</div>}
                </div>
              ))}
            </div>

            <div style={{ marginTop: 14, padding: "12px 14px", background: "#FFF0F0", border: "1px solid #FFD4D4", borderRadius: 9 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#D14343", marginBottom: 6 }}>⚠️ Danger Zone</div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => window.notYet("캐시 초기화")} style={{
                  flex: 1, padding: "8px", background: "#fff", border: "1px solid #FFD4D4",
                  borderRadius: 7, fontSize: 11, color: "#D14343", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}>🧹 캐시 초기화</button>
                <button onClick={() => window.notYet("전체 재인덱싱")} style={{
                  flex: 1, padding: "8px", background: "#fff", border: "1px solid #FFD4D4",
                  borderRadius: 7, fontSize: 11, color: "#D14343", fontWeight: 600, cursor: "pointer",
                  fontFamily: "var(--font-sans)",
                }}>🔄 전체 재인덱싱</button>
              </div>
            </div>
          </EnvSection>

        </div>

        {/* Footer save */}
        <div style={{
          marginTop: 22, padding: "16px 20px", background: "#fff", border: "1px solid #E1E5EF",
          borderRadius: 12, display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{ flex: 1, fontSize: 12.5, color: "#5B6685", lineHeight: 1.55 }}>
            💡 변경사항은 <b>저장 후 즉시 적용</b>돼요. LLM 키 변경 시 진행 중인 AI 코칭 세션이 재시작될 수 있어요.
          </div>
          <button onClick={() => window.notYet("변경사항 취소")} style={{
            padding: "10px 18px", background: "#fff", border: "1px solid #E1E5EF",
            borderRadius: 10, fontSize: 13, color: "#3A4565", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>변경사항 취소</button>
          <button onClick={handleSave} style={{
            padding: "10px 20px", background: "#E07A3C", color: "#fff",
            border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "var(--font-sans)",
          }}>변경사항 저장</button>
        </div>
      </div>
    </main>
  );
}

window.R3Env = R3Env;
