// RoleSelect.jsx — 로그인 직후 역할 선택 화면

function RoleCardBig({ icon, iconBg, iconFg, title, desc, features, accentColor, href, recommended }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={href} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          background: "#fff",
          border: `1.5px solid ${hover ? accentColor : "#E1E5EF"}`,
          borderRadius: 20,
          padding: "32px 28px",
          display: "flex", flexDirection: "column",
          gap: 18,
          cursor: "pointer",
          transition: "all 220ms cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: hover
            ? `0 16px 40px -12px ${accentColor}30`
            : "0 1px 2px rgba(31,42,74,.04)",
          transform: hover ? "translateY(-4px)" : "translateY(0)",
          position: "relative",
          height: "100%",
        }}
      >
        {recommended && (
          <div style={{
            position: "absolute", top: 16, right: 16,
            background: accentColor, color: "#fff",
            fontSize: 10.5, fontWeight: 700,
            padding: "3px 9px", borderRadius: 999,
            letterSpacing: "0.02em",
          }}>추천</div>
        )}

        {/* Icon */}
        <div style={{
          width: 68, height: 68, borderRadius: "50%",
          background: iconBg, color: iconFg,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 30,
        }}>{icon}</div>

        {/* Title */}
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.015em" }}>{title}</div>
          <div style={{ fontSize: 13.5, color: "#5B6685", lineHeight: 1.6, marginTop: 6 }}>{desc}</div>
        </div>

        {/* Features */}
        <div style={{
          display: "flex", flexDirection: "column", gap: 8,
          paddingTop: 14, borderTop: "1px solid #ECEFF5",
        }}>
          {features.map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: "#3A4565" }}>
              <span style={{ color: accentColor, fontWeight: 700, fontSize: 13 }}>✓</span>
              {f}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          marginTop: "auto", paddingTop: 6,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          color: accentColor, fontSize: 14, fontWeight: 600,
        }}>
          <span>이 역할로 시작하기</span>
          <span style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 28, height: 28, borderRadius: "50%",
            background: hover ? accentColor : `${accentColor}15`,
            color: hover ? "#fff" : accentColor,
            transition: "all 180ms ease-out",
            fontSize: 14,
          }}>→</span>
        </div>
      </div>
    </a>
  );
}

function RoleSelect() {
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
        <a href="./index.html" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
          {/* 03 TYPOGRAPHIC 워드마크 (심볼 없음) */}
          <span style={{ fontSize: 22, fontWeight: 800, color: "#0A1F17", letterSpacing: "-0.035em", lineHeight: 1 }}>OKR</span>
          <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#00A968", margin: "0 7px 2px 5px" }}/>
          <span style={{ fontSize: 22, fontWeight: 300, color: "#0A1F17", letterSpacing: "-0.015em", lineHeight: 1 }}>LENS</span>
        </a>
        <div style={{ flex: 1 }}/>

        {/* User chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "6px 14px 6px 6px",
          background: "#F4F7FB",
          borderRadius: 999,
        }}>
          <div style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "#3B5BDB", color: "#fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 12.5,
          }}>정</div>
          <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600, color: "#0F1A36" }}>정태영 님</div>
            <div style={{ fontSize: 10.5, color: "#7C87A4" }}>운영본부 · 결제플랫폼팀</div>
          </div>
        </div>
        <a href="./index.html" style={{
          marginLeft: 14,
          fontSize: 12.5, color: "#5B6685", textDecoration: "none",
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span>↩</span> 로그아웃
        </a>
      </header>

      {/* Main */}
      <div style={{
        flex: 1, padding: "56px 56px",
        display: "flex", flexDirection: "column", alignItems: "center",
        maxWidth: 1280, margin: "0 auto", width: "100%",
      }}>
        {/* Welcome */}
        <div style={{ textAlign: "center", marginBottom: 44, maxWidth: 720 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#ECFAF1", color: "#2F9E5E",
            padding: "6px 14px", borderRadius: 999,
            fontSize: 12.5, fontWeight: 600,
            marginBottom: 18,
          }}>
            <span>✓</span> 로그인 완료 · 환영합니다
          </div>
          <h1 style={{
            margin: 0, fontSize: 36, fontWeight: 700,
            color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2,
          }}>
            어떤 역할로 시작하시겠어요?
          </h1>
          <p style={{
            marginTop: 14, fontSize: 15, color: "#5B6685", lineHeight: 1.65,
          }}>
            현재 권한으로 이용 가능한 서비스입니다. 역할에 따라 제공되는 기능이 달라요.
          </p>
        </div>

        {/* Role cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20,
          width: "100%",
          maxWidth: 1100,
        }}>
          <RoleCardBig
            icon="👤"
            iconBg="#E5EBFB"
            iconFg="#3B5BDB"
            accentColor="#3B5BDB"
            title="피평가자"
            desc="나의 OKR을 작성·관리하고 AI 코칭을 받습니다."
            features={[
              "OKR 작성 위저드 · AI 정제",
              "달성 현황 대시보드",
              "평가자 피드백 확인",
            ]}
            href="./r1/r1-employee.html"
            recommended
          />
          <RoleCardBig
            icon="👥"
            iconBg="#E3F4EA"
            iconFg="#2F9E5E"
            accentColor="#2F9E5E"
            title="평가자"
            desc="팀원의 OKR을 검토·승인하고 코칭합니다."
            features={[
              "팀원 OKR 현황 대시보드",
              "AI Validation · 검토 의견",
              "승인 · 반려 · 조정요청",
            ]}
            href="./r2/dashboard.html"
          />
          <RoleCardBig
            icon="🛡️"
            iconBg="#FFEDE2"
            iconFg="#E07A3C"
            accentColor="#E07A3C"
            title="인사담당자"
            desc="전사 인사이트와 평가 기준을 관리합니다."
            features={[
              "캘리브레이션 인사이트",
              "평가 기준 · 마스터 데이터",
              "표준 지표 라이브러리",
            ]}
            href="./r3/r3-hr.html"
          />
        </div>

        {/* Helper */}
        <div style={{
          marginTop: 32, padding: "14px 22px",
          background: "#fff", border: "1px solid #E1E5EF", borderRadius: 12,
          display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, color: "#5B6685", lineHeight: 1.6,
          maxWidth: 720,
        }}>
          <span style={{ fontSize: 17 }}>💡</span>
          역할은 언제든 좌측 사이드바에서 전환할 수 있어요. 권한이 없는 역할은 안내 메시지로 표시됩니다.
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        padding: "20px 40px",
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
    </div>
  );
}

window.RoleSelect = RoleSelect;
