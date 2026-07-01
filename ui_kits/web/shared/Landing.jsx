// Landing.jsx — ID 선택 로그인 화면 (v2)
// 좌측: hero + feature + 신뢰 카드
// 우측: 사내 계정 ID 선택 → 로그인 → 역할 자동 부여 → 홈으로 리다이렉트

function FeatureItem({ icon, iconBg, iconFg, title, desc }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: iconBg, color: iconFg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 20,
      }}>{icon}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>{title}</div>
      <div style={{ fontSize: 13, color: "#5B6685", lineHeight: 1.6 }}>{desc}</div>
    </div>
  );
}

// ── 계정 카드 (선택 가능한 사용자 리스트) ──
function AccountRow({ user, selected, onSelect }) {
  const roleMeta = {
    R1: { label: "피평가자", bg: "#E5EBFB", fg: "#3B5BDB" },
    R2: { label: "평가자",   bg: "#E3F4EA", fg: "#00A968" },
    R3: { label: "인사담당자", bg: "#FFEDE2", fg: "#E07A3C" },
  }[user.role];

  return (
    <div
      onClick={() => onSelect(user.id)}
      style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "12px 14px",
        borderRadius: 12,
        border: `1.5px solid ${selected ? user.avatarColor : "#E1E5EF"}`,
        background: selected ? `${user.avatarColor}08` : "#fff",
        cursor: "pointer",
        transition: "all 160ms ease-out",
      }}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.borderColor = "#B7C4F0"; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.borderColor = "#E1E5EF"; }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: user.avatarColor, color: "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontWeight: 700, fontSize: 13,
        flexShrink: 0,
      }}>{user.name.charAt(0)}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{user.name}</div>
          <div style={{ fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono, monospace)" }}>@{user.id}</div>
        </div>
        <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {user.dept} · {user.team} · {user.grade}
        </div>
      </div>
      <div style={{
        fontSize: 10.5, fontWeight: 700,
        padding: "3px 8px", borderRadius: 6,
        background: roleMeta.bg, color: roleMeta.fg,
        letterSpacing: "0.02em",
        flexShrink: 0,
      }}>{roleMeta.label}</div>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        border: `2px solid ${selected ? user.avatarColor : "#DCE3F8"}`,
        background: selected ? user.avatarColor : "#fff",
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0,
      }}>
        {selected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}/>}
      </div>
    </div>
  );
}

function Landing() {
  const [selectedId, setSelectedId] = React.useState(null);
  const [loggingIn, setLoggingIn] = React.useState(false);

  const users = window.OKRLensAuth?.USERS || [];

  // R1 / R2 / R3 그룹핑
  const grouped = React.useMemo(() => {
    return {
      R1: users.filter((u) => u.role === "R1"),
      R2: users.filter((u) => u.role === "R2"),
      R3: users.filter((u) => u.role === "R3"),
    };
  }, [users]);

  function handleLogin() {
    if (!selectedId || loggingIn) return;
    setLoggingIn(true);

    const user = window.OKRLensAuth.login(selectedId);
    if (!user) {
      setLoggingIn(false);
      return;
    }
    // 역할별 홈으로 이동 (짧은 로딩 연출)
    setTimeout(() => {
      window.location.href = window.OKRLensAuth.ROLE_HOME[user.role] || "./role-select.html";
    }, 500);
  }

  const selectedUser = users.find((u) => u.id === selectedId);

  return (
    <div style={{
      minHeight: "100vh", background: "#F4F7FB",
      display: "flex", flexDirection: "column",
      fontFamily: "var(--font-sans)", color: "#3A4565",
    }}>
      {/* TopBar */}
      <header style={{
        height: 64, padding: "0 40px",
        display: "flex", alignItems: "center",
        background: "#fff", borderBottom: "1px solid #E1E5EF",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* 03 TYPOGRAPHIC 워드마크 — 심볼 없음, OKR(800) + 그린 도트 + LENS(300) */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: "#0A1F17", letterSpacing: "-0.035em", lineHeight: 1 }}>OKR</span>
            <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#00A968", margin: "0 7px 2px 5px" }}/>
            <span style={{ fontSize: 22, fontWeight: 300, color: "#0A1F17", letterSpacing: "-0.015em", lineHeight: 1 }}>LENS</span>
          </div>
          <div style={{
            fontSize: 12.5, color: "#5B6685", paddingLeft: 14, borderLeft: "1px solid #E1E5EF",
          }}>OKR 평가·코칭 AI 서비스</div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ fontSize: 13, color: "#5B6685", display: "flex", alignItems: "center", gap: 5, cursor: "pointer" }}>
          <span>🛡️</span> 도움말 및 문의
        </div>
      </header>

      {/* Main content — 2 columns */}
      <div style={{
        flex: 1, padding: "48px 56px",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56,
        maxWidth: 1280, margin: "0 auto", width: "100%",
        alignItems: "start",
      }}>
        {/* Left — Hero */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28, paddingTop: 12 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#E7F6EE", color: "#058E4E",
            padding: "7px 14px", borderRadius: 999,
            fontSize: 12.5, fontWeight: 600,
            width: "fit-content",
          }}>
            <span>🔒</span> 내부 구성원 전용 서비스
          </div>

          <div>
            <h1 style={{
              margin: 0, fontSize: 44, fontWeight: 700,
              color: "#0F1A36", letterSpacing: "-0.03em", lineHeight: 1.14,
            }}>
              성과를 연결하고,<br/>
              <span style={{ color: "#00A968" }}>성장</span>을 가속화합니다.
            </h1>
            <p style={{ marginTop: 16, fontSize: 15.5, color: "#5B6685", lineHeight: 1.65, maxWidth: 480 }}>
              OKR 기반 평가와 AI 코칭으로 더 공정한 평가, 더 의미 있는 성장을 지원합니다.
            </p>
          </div>

          {/* 3 feature columns */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 22 }}>
            <FeatureItem icon="🎯" iconBg="#E5EBFB" iconFg="#3B5BDB"
              title="OKR 기반 평가"
              desc="목표 달성도와 핵심결과 기반의 정량·정성 통합 평가"
            />
            <FeatureItem icon="✨" iconBg="#E7F6EE" iconFg="#00A968"
              title="AI 코칭 인사이트"
              desc="AI가 제공하는 맞춤 코칭으로 의미 있는 성장 지원"
            />
            <FeatureItem icon="📊" iconBg="#FFEDE2" iconFg="#E07A3C"
              title="데이터 기반 의사결정"
              desc="조직·팀·개인 단위 분석으로 전략적 인사 결정 지원"
            />
          </div>

          {/* Trust card (dark) */}
          <div style={{
            background: "#0A1F17", color: "#fff", borderRadius: 16,
            padding: "18px 22px",
            display: "flex", flexDirection: "column", gap: 14,
          }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ color: "#4ADE80" }}>🛡️</span>
              신뢰할 수 있는 내부 서비스
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, fontSize: 11.5, lineHeight: 1.55 }}>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: "#4ADE80" }}>●</span> 보안 안내</div>
                <div style={{ color: "#B7C4C0" }}>모든 데이터는 암호화되어 안전하게 저장·관리됩니다.</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: "#4ADE80" }}>●</span> 내부망 운영</div>
                <div style={{ color: "#B7C4C0" }}>회사 내부 네트워크에서만 접근 가능합니다.</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, color: "#fff", marginBottom: 3, display: "flex", alignItems: "center", gap: 5 }}><span style={{ color: "#4ADE80" }}>●</span> 권한 기반 접근</div>
                <div style={{ color: "#B7C4C0" }}>역할 및 권한에 따라 필요한 기능만 제공합니다.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right — ID 선택 로그인 카드 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{
            background: "#fff", border: "1px solid #E1E5EF", borderRadius: 20,
            padding: "28px 28px 24px",
            boxShadow: "0 20px 48px -16px rgba(31,42,74,.12)",
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "#E7F6EE", color: "#00A968",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                }}>🔒</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.02em" }}>사내 계정으로 로그인</div>
              </div>
              <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.55, marginTop: 6, marginLeft: 2 }}>
                아래에서 <b style={{ color: "#0F1A36" }}>본인 계정</b>을 선택하세요. 로그인 시 역할이 자동으로 부여됩니다.
              </div>
            </div>

            {/* ── R1 그룹 ── */}
            <RoleGroup
              label="피평가자 (R1)"
              hint="본인의 OKR을 작성·관리합니다"
              color="#3B5BDB"
              users={grouped.R1}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {/* ── R2 그룹 ── */}
            <RoleGroup
              label="평가자 (R2)"
              hint="팀원 OKR을 검토·승인합니다"
              color="#00A968"
              users={grouped.R2}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
            {/* ── R3 그룹 ── */}
            <RoleGroup
              label="인사담당자 (R3)"
              hint="전사 인사이트 · 기준 관리"
              color="#E07A3C"
              users={grouped.R3}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />

            {/* CTA */}
            <button
              disabled={!selectedId || loggingIn}
              onClick={handleLogin}
              style={{
                marginTop: 20,
                width: "100%",
                background: selectedId ? (selectedUser?.avatarColor || "#00A968") : "#DCE3F8",
                color: selectedId ? "#fff" : "#7C87A4",
                border: "none", borderRadius: 12,
                padding: "16px 20px", fontSize: 15, fontWeight: 700,
                fontFamily: "var(--font-sans)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                cursor: selectedId ? "pointer" : "not-allowed",
                boxShadow: selectedId ? `0 6px 16px -2px ${selectedUser?.avatarColor}40` : "none",
                letterSpacing: "-0.005em",
                transition: "all 180ms ease-out",
              }}
            >
              {loggingIn ? (
                <>
                  <span style={{
                    display: "inline-block",
                    width: 14, height: 14,
                    border: "2px solid #fff",
                    borderTopColor: "transparent",
                    borderRadius: "50%",
                    animation: "spin 700ms linear infinite",
                  }}/>
                  로그인 중...
                </>
              ) : selectedUser ? (
                <>🔐 {selectedUser.name} 님으로 로그인</>
              ) : (
                <>계정을 선택해주세요</>
              )}
            </button>

            <div style={{
              marginTop: 12, fontSize: 12, color: "#7C87A4",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>
              <span style={{ color: "#00A968" }}>✓</span> 프로토타입 · SSO는 정식 배포 시 연동됩니다
            </div>
          </div>

          {/* Notice */}
          <div style={{
            background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
            padding: "14px 18px",
            display: "flex", alignItems: "flex-start", gap: 12, fontSize: 12.5, color: "#3A4565",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, color: "#0F1A36", flexShrink: 0 }}>
              <span>📣</span> 공지
            </div>
            <div style={{ flex: 1, lineHeight: 1.55 }}>
              <div>2026년 상반기 OKR 평가 기간: <b style={{ color: "#0F1A36" }}>2026.06.01 ~ 06.19</b></div>
              <div style={{ marginTop: 3, color: "#5B6685", fontSize: 12 }}>AI 코칭 리포트 기능이 업데이트되었습니다.</div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "18px 40px",
        background: "#fff", borderTop: "1px solid #E1E5EF",
        display: "flex", alignItems: "center", gap: 24,
        fontSize: 12, color: "#7C87A4",
      }}>
        <div>© 2026 OKR LENS. All rights reserved.</div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: "flex", gap: 18 }}>
          <a style={{ color: "#5B6685", textDecoration: "none", cursor: "pointer" }}>개인정보처리방침</a>
          <a style={{ color: "#5B6685", textDecoration: "none", cursor: "pointer" }}>보안 정책</a>
          <a style={{ color: "#5B6685", textDecoration: "none", cursor: "pointer" }}>이용 안내</a>
        </div>
      </footer>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// 역할 그룹 헤더 + 그 안의 계정 리스트
function RoleGroup({ label, hint, color, users, selectedId, onSelect }) {
  if (!users || users.length === 0) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        margin: "0 0 8px 2px",
      }}>
        <div style={{ width: 4, height: 12, borderRadius: 2, background: color }}/>
        <div style={{ fontSize: 12, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.005em" }}>{label}</div>
        <div style={{ fontSize: 11, color: "#7C87A4" }}>· {hint}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {users.map((u) => (
          <AccountRow key={u.id} user={u} selected={selectedId === u.id} onSelect={onSelect}/>
        ))}
      </div>
    </div>
  );
}

window.Landing = Landing;
