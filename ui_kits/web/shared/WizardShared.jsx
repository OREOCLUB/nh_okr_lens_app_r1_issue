// WizardShared.jsx — OKR 작성 위저드 공통 컴포넌트 (8단계, v2)

const WIZARD_STEPS = [
  { num: 0, label: "프로필 세팅",  short: "프로필", href: "./r1-profile-setup.html" },
  { num: 1, label: "OKR 유형",     short: "유형",   href: "./r1-write-step1.html" },
  { num: 2, label: "기초 정보",    short: "정보",   href: "./r1-write-step2.html" },
  { num: 3, label: "AI 정제 대화", short: "정제",   href: "./r1-write-step3.html" },
  { num: 4, label: "KR 형태",      short: "형태",   href: "./r1-write-step4.html" },
  { num: 5, label: "상세 수립",    short: "상세",   href: "./r1-write-step5.html" },
  { num: 6, label: "AI 비교 검토", short: "비교",   href: "./r1-write-step6.html" },
  { num: 7, label: "최종 수정·제출", short: "제출",  href: "./r1-write-step7.html" },
];

const TOTAL_STEPS = 8; // 0..7

function WizardStepHeader({ current }) {
  // current = 0..7
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "14px 18px", marginBottom: 20,
      display: "flex", alignItems: "center", gap: 4,
      overflowX: "auto",
    }}>
      {WIZARD_STEPS.map((s, i) => {
        const done = s.num < current;
        const cur = s.num === current;
        const next = s.num > current;
        return (
          <React.Fragment key={s.num}>
            <a href={s.href} title={`STEP ${s.num} · ${s.label}`} style={{
              textDecoration: "none",
              display: "flex", alignItems: "center", gap: 8,
              flexShrink: 0,
              padding: cur ? "5px 11px 5px 5px" : "5px",
              background: cur ? "#F1F4FD" : "transparent",
              borderRadius: 10,
              pointerEvents: next ? "none" : "auto",
              opacity: next ? 0.55 : 1,
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: cur ? "#3B5BDB" : done ? "#ECFAF1" : "#F4F7FB",
                color: cur ? "#fff" : done ? "#2F9E5E" : "#7C87A4",
                border: cur ? "none" : done ? "1px solid #BBE9CC" : "1px solid #E1E5EF",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11.5, fontWeight: 700,
                fontFamily: "var(--font-mono)",
                flexShrink: 0,
              }}>{done ? "✓" : s.num}</div>
              {cur && (
                <div style={{
                  fontSize: 12.5, fontWeight: 700,
                  color: "#0F1A36",
                  letterSpacing: "-0.005em",
                  whiteSpace: "nowrap",
                  lineHeight: 1.3,
                }}>STEP {s.num} · {s.label}</div>
              )}
            </a>
            {i < WIZARD_STEPS.length - 1 && (
              <div style={{ flex: 1, minWidth: 8, height: 2, background: done ? "#BBE9CC" : "#ECEFF5", borderRadius: 1 }}/>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function WizardNav({ current, prevDisabled, nextLabel, prevLabel, nextHref: nextHrefOverride }) {
  // current = 0..7
  const prevHref = current > 0 ? WIZARD_STEPS[current].href ? WIZARD_STEPS.find(s => s.num === current - 1).href : "./r1-employee.html" : "./r1-employee.html";
  const computedPrev = current > 0
    ? WIZARD_STEPS.find(s => s.num === current - 1).href
    : "./r1-employee.html";
  const computedNext = current < 7
    ? WIZARD_STEPS.find(s => s.num === current + 1).href
    : "./r1-employee.html";
  const finalNextHref = nextHrefOverride || computedNext;

  return (
    <div style={{
      marginTop: 22, padding: "16px 22px",
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <a href={computedPrev} style={{ textDecoration: "none" }}>
        <Button variant="ghost" disabled={prevDisabled}>
          ← {prevLabel || (current === 0 ? "홈으로" : `이전 (STEP ${current - 1})`)}
        </Button>
      </a>
      <div style={{ flex: 1 }}/>
      <div style={{ fontSize: 12, color: "#7C87A4", display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#2F9E5E" }}/>
        임시 저장됨 · 방금 전
      </div>
      <Button variant="secondary">임시 저장</Button>
      <a href={finalNextHref} style={{ textDecoration: "none" }}>
        <Button variant="primary">
          {nextLabel || (current === 7 ? "제출하기 →" : `다음 (STEP ${current + 1}) →`)}
        </Button>
      </a>
    </div>
  );
}

function WizardBreadcrumb({ stepLabel }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, fontSize: 12.5, color: "#5B6685" }}>
      <a href="./r1-employee.html" style={{ color: "#5B6685", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
        <span>←</span> 피평가자 홈
      </a>
      <span style={{ color: "#C8CFDF" }}>/</span>
      <a href="./r1-write-step1.html" style={{ color: "#5B6685", textDecoration: "none" }}>OKR 작성</a>
      <span style={{ color: "#C8CFDF" }}>/</span>
      <span style={{ color: "#0F1A36", fontWeight: 600 }}>{stepLabel}</span>
    </div>
  );
}

function WizardHero({ stepNum, title, desc, badge, showAIHelp = true }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
      <div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
          STEP {stepNum} / 7
          {badge && <span style={{ padding: "2px 8px", borderRadius: 999, background: "#F1F4FD", color: "#213A8C", fontSize: 10.5, fontWeight: 700 }}>{badge}</span>}
        </div>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
          {title}
        </h1>
        <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.55, maxWidth: 720 }}>
          {desc}
        </p>
      </div>
      <div style={{ flex: 1 }}/>
      <Button variant="ghost" size="sm" leftIcon={<span>💡</span>}>도움말</Button>
      {showAIHelp && <Button variant="ai" size="sm" leftIcon={<span>✨</span>}>AI에게 물어보기</Button>}
    </div>
  );
}

// Shared form styles
const labelStyle = { display: "block", fontSize: 12.5, fontWeight: 600, color: "#3A4565", marginBottom: 7 };
const inputStyle = {
  width: "100%", padding: "11px 14px",
  background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
  fontSize: 14, color: "#0F1A36", fontFamily: "var(--font-sans)",
  outline: "none", transition: "all 140ms ease-out",
};
const hintStyle = { fontSize: 11.5, color: "#7C87A4", marginTop: 5, lineHeight: 1.5 };

window.WIZARD_STEPS = WIZARD_STEPS;
window.TOTAL_STEPS = TOTAL_STEPS;
window.WizardStepHeader = WizardStepHeader;
window.WizardNav = WizardNav;
window.WizardBreadcrumb = WizardBreadcrumb;
window.WizardHero = WizardHero;
window.wizLabelStyle = labelStyle;
window.wizInputStyle = inputStyle;
window.wizHintStyle = hintStyle;
