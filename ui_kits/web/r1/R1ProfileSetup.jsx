// STEP 0 — 피평가자 세팅 (직무/직렬/업무분장/근속/근무형태/자격증)
// OKR 작성 진입 전 최초 1회 입력하며, 이후 STEP 2 우측 패널의 "나의 정보"에 연결됨

function FieldGroup({ icon, title, desc, children, status }) {
  // status: "done" | "in-progress" | "pending"
  const dot = {
    done:        { bg: "#ECFAF1", fg: "#2F9E5E", border: "#BBE9CC", ico: "✓", label: "완료" },
    "in-progress": { bg: "#F1F4FD", fg: "#3B5BDB", border: "#C5D0F7", ico: "●", label: "입력 중" },
    pending:     { bg: "#F4F7FB", fg: "#7C87A4", border: "#E1E5EF", ico: "○", label: "미입력" },
  }[status || "pending"];
  return (
    <div style={{
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14,
      padding: "22px 24px", boxShadow: "0 1px 2px rgba(31,42,74,.04)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 18 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 11,
          background: "#F1F4FD", color: "#3B5BDB",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, flexShrink: 0,
        }}>{icon}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.01em" }}>{title}</div>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              padding: "2px 9px", borderRadius: 999,
              background: dot.bg, color: dot.fg, border: `1px solid ${dot.border}`,
              fontSize: 10.5, fontWeight: 700,
            }}>
              <span>{dot.ico}</span> {dot.label}
            </span>
          </div>
          {desc && <div style={{ fontSize: 12.5, color: "#5B6685", marginTop: 4, lineHeight: 1.55 }}>{desc}</div>}
        </div>
      </div>
      {children}
    </div>
  );
}

function TagInput({ defaultTags, placeholder }) {
  return (
    <div style={{
      display: "flex", flexWrap: "wrap", gap: 6, padding: "10px 12px",
      background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10,
      minHeight: 46, alignItems: "center",
    }}>
      {defaultTags.map((t, i) => (
        <span key={i} style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          padding: "5px 10px 5px 11px", background: "#F1F4FD", color: "#213A8C",
          border: "1px solid #C5D0F7", borderRadius: 999,
          fontSize: 12, fontWeight: 600, fontFamily: "var(--font-mono)",
        }}>
          {t}
          <button style={{
            width: 16, height: 16, borderRadius: "50%", border: "none",
            background: "rgba(33,58,140,0.12)", color: "#213A8C",
            cursor: "pointer", fontSize: 11, padding: 0, lineHeight: 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </span>
      ))}
      <input
        placeholder={placeholder}
        style={{
          flex: 1, minWidth: 120, border: "none", outline: "none",
          fontSize: 13, fontFamily: "var(--font-sans)", color: "#0F1A36",
        }}
      />
    </div>
  );
}

function Radio({ label, sub, value, current, onChange }) {
  const on = value === current;
  return (
    <div onClick={() => onChange(value)} style={{
      flex: 1,
      padding: "13px 15px",
      background: on ? "#F1F4FD" : "#fff",
      border: `1.5px solid ${on ? "#3B5BDB" : "#E1E5EF"}`,
      borderRadius: 11,
      cursor: "pointer",
      display: "flex", alignItems: "center", gap: 10,
      transition: "all 140ms ease-out",
    }}>
      <div style={{
        width: 18, height: 18, borderRadius: "50%",
        border: `2px solid ${on ? "#3B5BDB" : "#C8CFDF"}`,
        background: "#fff", flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        {on && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#3B5BDB" }}/>}
      </div>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 600, color: "#0F1A36" }}>{label}</div>
        {sub && <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// 사수 정보 · 인수인계 섹션 (신규)
// - 사수(전 담당자) 지정 → 결재자 승인 대기 → 승인 후 이전 담당자의 OKR 조회 가능
// - 평가 점수는 안 보이고, KR 내용/측정/기간만 열람
// ─────────────────────────────────────────────
function SupervisorHandover() {
  const [status, setStatus] = React.useState("approved"); // "empty" | "pending" | "approved" | "rejected"
  const [modalOpen, setModalOpen] = React.useState(false);
  const [krModalOpen, setKrModalOpen] = React.useState(false);
  const [selectedKR, setSelectedKR] = React.useState(null);

  // 시나리오: 김지훈은 2024.07.01에 결제정산팀 → 결제플랫폼팀으로 이동, 이지훈 책임의 업무를 인수받음
  const supervisor = {
    empId: "E0987",
    name: "이지훈",
    grade: "책임",
    dept: "운영본부 · 결제플랫폼팀 (現 SRE팀 전배)",
    tenure: "결제플랫폼팀 5년 2개월 재직",
    handoverDate: "2024.06.30",
    avatar: "이",
  };

  // 이전 담당자(이지훈)의 지난 OKR 이력 - 평가 점수는 없음
  const priorOkrs = [
    {
      period: "2024 상반기",
      objective: "결제 게이트웨이 안정화",
      krs: [
        { id: "KR-2024H1-01", format: "수치",     text: "결제 게이트웨이 APM p95 응답속도 900ms → 750ms 개선", baseline: "900ms", goal: "750ms" },
        { id: "KR-2024H1-02", format: "마일스톤", text: "야간 배치 장애 알림 자동화 4단계 중 3단계 완료",       baseline: "1/4",   goal: "3/4" },
        { id: "KR-2024H1-03", format: "수치",     text: "결제 인증모듈 커버리지 55% → 70%",                     baseline: "55%",   goal: "70%" },
      ],
    },
    {
      period: "2023 하반기",
      objective: "핵심 서비스 응답속도 개선",
      krs: [
        { id: "KR-2023H2-01", format: "수치",     text: "결제 게이트웨이 APM p95 응답속도 1200ms → 900ms 개선", baseline: "1200ms", goal: "900ms" },
        { id: "KR-2023H2-02", format: "루브릭",   text: "DB 인덱싱 개선 · 상위 10개 쿼리 성능 튜닝",             baseline: "-",       goal: "루브릭 A" },
        { id: "KR-2023H2-03", format: "수치",     text: "장애 발생 건수 월 3건 → 월 1건 이하",                   baseline: "3건",     goal: "1건" },
      ],
    },
    {
      period: "2023 상반기",
      objective: "결제 인증모듈 리팩토링",
      krs: [
        { id: "KR-2023H1-01", format: "마일스톤", text: "결제 인증모듈 리팩토링 5단계 중 4단계 완료", baseline: "1/5", goal: "4/5" },
        { id: "KR-2023H1-02", format: "수치",     text: "인증 모듈 단위테스트 커버리지 40% → 55%",   baseline: "40%", goal: "55%" },
      ],
    },
  ];

  // 상태별 UI
  if (status === "empty") {
    return (
      <FieldGroup
        icon="🤝" title="사수 정보 · 인수인계"
        desc="1년 이내에 팀을 이동하신 경우, 이전 담당자를 지정하면 그 분의 지난 OKR을 참고할 수 있어요. (평가 점수는 공개되지 않아요)"
        status="pending"
      >
        <div style={{
          border: "1.5px dashed #C5D0F7", borderRadius: 12, padding: "24px 20px",
          background: "linear-gradient(135deg, #F9FBFF, #fff 70%)",
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 10,
        }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24 }}>🤝</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0F1A36" }}>인수인계 받은 담당자가 있나요?</div>
          <div style={{ fontSize: 12.5, color: "#5B6685", lineHeight: 1.55, maxWidth: 440 }}>
            팀 이동으로 이전 담당자로부터 업무를 인수받았다면, 그 분의 지난 OKR을 참고해서 이번 반기 KR을 더 정교하게 작성할 수 있어요.
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>+ 사수 지정하기</Button>
        </div>
        <SupervisorPickModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={() => { setModalOpen(false); setStatus("pending"); }}/>
      </FieldGroup>
    );
  }

  // 승인 대기 / 승인 완료 / 반려
  const badge = {
    pending:  { bg: "#FFF7EC", fg: "#D98023", border: "#FFE0BA", ico: "⏱", label: "결재자 승인 대기" },
    approved: { bg: "#ECFAF1", fg: "#2F9E5E", border: "#BBE9CC", ico: "✓", label: "승인 완료 · 열람 가능" },
    rejected: { bg: "#FFF0F0", fg: "#D14343", border: "#FFD4D4", ico: "×", label: "승인 반려" },
  }[status];

  return (
    <FieldGroup
      icon="🤝" title="사수 정보 · 인수인계"
      desc="지정한 사수의 이전 OKR을 참고할 수 있어요. (평가 점수는 공개되지 않고 OKR 내용만 열람 가능)"
      status={status === "approved" ? "done" : "in-progress"}
    >
      {/* 사수 카드 */}
      <div style={{
        border: `1px solid ${badge.border}`, borderRadius: 12, padding: "16px 18px",
        background: status === "approved" ? "linear-gradient(135deg, #F4FBF7, #fff 70%)" :
                    status === "pending"  ? "linear-gradient(135deg, #FFFBF3, #fff 70%)" :
                                            "linear-gradient(135deg, #FFF6F6, #fff 70%)",
        display: "flex", alignItems: "center", gap: 14, marginBottom: 12,
      }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "#3B5BDB", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 700, flexShrink: 0,
        }}>{supervisor.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36" }}>{supervisor.name}</div>
            <span style={{ fontSize: 11.5, color: "#5B6685", fontWeight: 500 }}>{supervisor.grade}</span>
            <span style={{ fontSize: 10.5, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>· {supervisor.empId}</span>
          </div>
          <div style={{ fontSize: 12, color: "#5B6685", marginBottom: 4 }}>{supervisor.dept}</div>
          <div style={{ fontSize: 11, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>
            인계일 {supervisor.handoverDate} · {supervisor.tenure}
          </div>
        </div>
        <span style={{
          padding: "5px 11px", borderRadius: 999,
          background: badge.bg, color: badge.fg, border: `1px solid ${badge.border}`,
          fontSize: 11.5, fontWeight: 700, flexShrink: 0,
          display: "flex", alignItems: "center", gap: 5,
        }}>
          <span>{badge.ico}</span> {badge.label}
        </span>
      </div>

      {/* 상태별 안내 */}
      {status === "pending" && (
        <div style={{
          padding: "13px 15px", background: "#FFF7EC", border: "1px solid #FFE0BA",
          borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12,
        }}>
          <span style={{ fontSize: 16 }}>⏱</span>
          <div style={{ fontSize: 12.5, color: "#7A4A14", lineHeight: 1.6 }}>
            <b>결재자(정태영 팀장)의 승인을 기다리고 있어요.</b><br/>
            승인이 완료되면 <b>이지훈 책임의 이전 OKR</b>을 열람할 수 있습니다. 보통 1영업일 이내에 처리돼요.
          </div>
          <button onClick={() => window.notYet("결재자에게 알림 재전송")} style={{
            padding: "6px 12px", background: "#fff", border: "1px solid #FFE0BA",
            borderRadius: 7, fontSize: 11.5, color: "#7A4A14", fontWeight: 600, cursor: "pointer",
            fontFamily: "var(--font-sans)", flexShrink: 0, whiteSpace: "nowrap",
          }}>알림 재전송</button>
        </div>
      )}

      {status === "approved" && (
        <>
          <div style={{
            padding: "12px 14px", background: "#ECFAF1", border: "1px solid #BBE9CC",
            borderRadius: 10, display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14,
            fontSize: 12.5, color: "#1E5F3B", lineHeight: 1.55,
          }}>
            <span>🔓</span>
            <div>
              결재자 승인이 완료되어 <b>이지훈 책임의 이전 OKR 3건</b>을 열람하실 수 있어요.
              평가 점수·등급·평가자 코멘트는 <b>공개되지 않으며</b>, KR 내용과 측정 방식만 참고 가능합니다.
            </div>
          </div>

          {/* 이전 담당자 OKR 이력 */}
          <div style={{ fontSize: 12, fontWeight: 700, color: "#5B6685", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 8 }}>
            📚 이지훈 책임의 이전 OKR
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {priorOkrs.map((o, i) => (
              <div key={i} style={{
                border: "1px solid #E1E5EF", borderRadius: 11, background: "#fff",
                padding: "14px 16px",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span style={{
                    padding: "3px 9px", borderRadius: 999,
                    background: "#F1F4FD", color: "#2B5DD9",
                    fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)",
                  }}>{o.period}</span>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{o.objective}</div>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#7C87A4" }}>KR {o.krs.length}개</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {o.krs.map((kr, j) => (
                    <div key={j}
                      onClick={() => { setSelectedKR({ ...kr, objective: o.objective, period: o.period }); setKrModalOpen(true); }}
                      style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "9px 11px",
                        background: "#F9FAFC", border: "1px solid #ECEFF5",
                        borderRadius: 8, cursor: "pointer",
                        transition: "all 140ms",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "#F1F4FD"; e.currentTarget.style.borderColor = "#C5D0F7"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "#F9FAFC"; e.currentTarget.style.borderColor = "#ECEFF5"; }}
                    >
                      <span style={{
                        padding: "2px 7px", background: "#fff", border: "1px solid #E1E5EF",
                        borderRadius: 6, fontSize: 10, color: "#5B6685", fontWeight: 600, fontFamily: "var(--font-mono)",
                        flexShrink: 0,
                      }}>{kr.id}</span>
                      <span style={{
                        padding: "2px 7px", background: "#F4F7FB", color: "#3A4565",
                        borderRadius: 6, fontSize: 10, fontWeight: 600, flexShrink: 0,
                      }}>{kr.format}</span>
                      <span style={{ fontSize: 12, color: "#0F1A36", flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{kr.text}</span>
                      <span style={{ fontSize: 11, color: "#3B5BDB", fontWeight: 600, flexShrink: 0 }}>상세 ›</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* 재지정 옵션 */}
          <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "#7C87A4", display: "flex", alignItems: "center", gap: 6 }}>
              <span>🔒</span> 평가 점수·등급·평가자 코멘트는 공개되지 않아요
            </div>
            <button onClick={() => window.notYet("사수 재지정 요청")} style={{
              padding: "6px 12px", background: "#fff", border: "1px solid #E1E5EF",
              borderRadius: 7, fontSize: 11.5, color: "#5B6685", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}>사수 재지정</button>
          </div>
        </>
      )}

      {/* KR 상세 모달 */}
      <PriorKRDetailModal open={krModalOpen} kr={selectedKR} supervisor={supervisor} onClose={() => setKrModalOpen(false)}/>
    </FieldGroup>
  );
}

// 사수 선택 모달
function SupervisorPickModal({ open, onClose, onSelect }) {
  const [query, setQuery] = React.useState("이지훈");
  if (!open) return null;
  const candidates = [
    { empId: "E0987", name: "이지훈", grade: "책임", dept: "결제플랫폼팀 (現 SRE팀)", handoverDate: "2024.06.30", avatar: "이" },
    { empId: "E0654", name: "이지현", grade: "책임", dept: "결제정산팀",              handoverDate: "-",           avatar: "이" },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,26,54,0.42)", zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "min(560px, 100%)",
        maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 30px 80px -10px rgba(15,26,54,.40)",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤝</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36" }}>사수(전 담당자) 지정</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 1 }}>업무를 인수인계 받은 이전 담당자를 검색해주세요</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, background: "#F4F7FB", border: "none",
            color: "#5B6685", cursor: "pointer", fontSize: 16, fontFamily: "inherit",
          }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "18px 24px" }}>
          <div style={{
            padding: "10px 12px", background: "#F1F4FD", border: "1px solid #DCE3F8", borderRadius: 9,
            fontSize: 12, color: "#2B5DD9", lineHeight: 1.55, marginBottom: 14,
            display: "flex", alignItems: "flex-start", gap: 8,
          }}>
            <span>💡</span>
            <span>지정 후 <b>결재자(정태영 팀장)의 승인</b>이 필요해요. 승인되면 그 분의 이전 OKR 목록이 열립니다.</span>
          </div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#3A4565", display: "block", marginBottom: 6 }}>이름 · 사번으로 검색</label>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              style={{
                flex: 1, padding: "10px 12px", background: "#fff",
                border: "1px solid #E1E5EF", borderRadius: 9,
                fontSize: 13, fontFamily: "var(--font-sans)",
                outline: "none",
              }}/>
            <button style={{
              padding: "10px 16px", background: "#F4F7FB", border: "1px solid #E1E5EF",
              borderRadius: 9, fontSize: 12.5, color: "#3A4565", fontWeight: 600, cursor: "pointer",
              fontFamily: "var(--font-sans)",
            }}>검색</button>
          </div>
          <div style={{ fontSize: 11.5, color: "#7C87A4", marginBottom: 8 }}>검색 결과 {candidates.length}명</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {candidates.map((c, i) => (
              <div key={i} onClick={() => onSelect(c)} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "12px 14px", border: "1px solid #E1E5EF", borderRadius: 10,
                cursor: "pointer", background: "#fff",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#F9FAFC"; e.currentTarget.style.borderColor = "#3B5BDB"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = "#E1E5EF"; }}
              >
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{c.avatar}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: "#0F1A36" }}>{c.name}</div>
                    <span style={{ fontSize: 11.5, color: "#5B6685" }}>{c.grade}</span>
                    <span style={{ fontSize: 10.5, color: "#7C87A4", fontFamily: "var(--font-mono)" }}>· {c.empId}</span>
                  </div>
                  <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 2 }}>{c.dept} · 인계일 {c.handoverDate}</div>
                </div>
                <span style={{ fontSize: 12, color: "#3B5BDB", fontWeight: 700 }}>지정 →</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid #ECEFF5", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
        </div>
      </div>
    </div>
  );
}

// 이전 담당자 KR 상세 모달
function PriorKRDetailModal({ open, kr, supervisor, onClose }) {
  if (!open || !kr) return null;
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(15,26,54,0.42)", zIndex: 60,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, width: "min(640px, 100%)",
        maxHeight: "88vh", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 30px 80px -10px rgba(15,26,54,.40)",
      }}>
        <div style={{ padding: "18px 24px", borderBottom: "1px solid #ECEFF5", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: "#F1F4FD", color: "#3B5BDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>📄</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: "#0F1A36" }}>이전 담당자 KR 상세</div>
            <div style={{ fontSize: 11.5, color: "#7C87A4", marginTop: 1 }}>{supervisor.name} {supervisor.grade} · {kr.period}</div>
          </div>
          <button onClick={onClose} style={{
            width: 28, height: 28, borderRadius: 8, background: "#F4F7FB", border: "none",
            color: "#5B6685", cursor: "pointer", fontSize: 16, fontFamily: "inherit",
          }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          {/* Objective */}
          <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 4 }}>Objective</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0F1A36", marginBottom: 18, letterSpacing: "-0.01em" }}>{kr.objective}</div>

          {/* KR */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ padding: "3px 9px", background: "#F1F4FD", color: "#2B5DD9", borderRadius: 999, fontSize: 11, fontWeight: 700, fontFamily: "var(--font-mono)" }}>{kr.id}</span>
            <span style={{ padding: "3px 9px", background: "#F4F7FB", color: "#3A4565", borderRadius: 999, fontSize: 11, fontWeight: 600 }}>{kr.format}</span>
          </div>
          <div style={{
            padding: "16px 18px", background: "#F9FBFF", border: "1px solid #DCE3F8", borderRadius: 12,
            fontSize: 14, color: "#0F1A36", lineHeight: 1.6, marginBottom: 18,
          }}>{kr.text}</div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 18 }}>
            <div style={{ padding: "12px 14px", background: "#fff", border: "1px solid #E1E5EF", borderRadius: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>Baseline (시작)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#0F1A36", fontFamily: "var(--font-mono)" }}>{kr.baseline}</div>
            </div>
            <div style={{ padding: "12px 14px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 10 }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "#3B5BDB", letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 4 }}>Goal (목표)</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#3B5BDB", fontFamily: "var(--font-mono)" }}>{kr.goal}</div>
            </div>
          </div>

          {/* 참고 가이드 */}
          <div style={{
            padding: "14px 16px", background: "linear-gradient(135deg, #F1F4FD, #fff 70%)",
            border: "1px solid #DCE3F8", borderRadius: 11,
            display: "flex", gap: 12, alignItems: "flex-start",
          }}>
            <div style={{ fontSize: 22 }}>✨</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#1F2A4A", marginBottom: 3 }}>이번 반기 KR 작성 시 참고 팁</div>
              <div style={{ fontSize: 12, color: "#5B6685", lineHeight: 1.6 }}>
                이지훈 책임이 <b>{kr.baseline} → {kr.goal}</b>까지 개선하셨어요. 이번엔 <b>{kr.goal}</b>에서 시작해서 한 단계 더 도전적인 목표를 잡아볼 수 있어요.
              </div>
            </div>
          </div>

          {/* 비공개 안내 */}
          <div style={{
            marginTop: 14, padding: "10px 12px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 9,
            fontSize: 11.5, color: "#7A4A14", lineHeight: 1.55,
            display: "flex", gap: 8, alignItems: "flex-start",
          }}>
            <span>🔒</span>
            <span>평가 점수, 등급, 평가자 코멘트는 인수인계 목적상 공개되지 않아요. KR 내용과 측정 방식만 참고하실 수 있습니다.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function R1ProfileSetup() {
  const [workType, setWorkType] = React.useState("onsite");
  const [jobSeries, setJobSeries] = React.useState("SE");

  // 진행률 계산 (실제로는 폼 검증)
  const filled = 5;
  const total = 6;
  const pct = Math.round((filled / total) * 100);

  return (
    <main style={{ flex: 1, display: "flex", flexDirection: "column", background: "#F4F7FB", overflow: "hidden" }}>
      <TopBar title="마이페이지" subtitle="김지훈 · 운영본부 · 결제플랫폼팀 · 4급갑 SE"/>
      <div style={{ flex: 1, overflowY: "auto", padding: "24px 40px 40px" }}>

        {/* 마이페이지 헤더 (Wizard 아닌 상시 관리 화면) */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, marginBottom: 22 }}>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 700, color: "#00A968", letterSpacing: "0.04em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 8 }}>
              마이페이지
              <span style={{ padding: "2px 8px", borderRadius: 999, background: "#E0F7EC", color: "#00794B", fontSize: 10.5, fontWeight: 700 }}>상시 업데이트</span>
            </div>
            <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700, color: "#0F1A36", letterSpacing: "-0.025em", lineHeight: 1.2 }}>
              내 프로필을 최신 상태로 관리해주세요.
            </h1>
            <p style={{ margin: "8px 0 0", fontSize: 14.5, color: "#5B6685", lineHeight: 1.55, maxWidth: 720 }}>
              직무·근속·자격증 정보는 <b>OKR 작성</b>에서 그대로 불러와 활용해요. 조직 변경·자격증 취득 등 변화가 생기면 여기서 먼저 반영해두면 이후 흐름이 훨씬 매끄러워집니다.
            </p>
          </div>
          <div style={{ flex: 1 }}/>
          <a href="./r1-write-step1.html" style={{ textDecoration: "none" }}>
            <button style={{
              background: "#00A968", color: "#fff", border: "none",
              padding: "10px 18px", borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8,
              boxShadow: "0 1px 2px rgba(0,169,104,.22)",
            }}>
              이 프로필로 OKR 작성 →
            </button>
          </a>
        </div>

        {/* Top — 진행률 + 마스터 데이터 출처 */}
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 18, marginBottom: 22 }}>
          <div style={{ background: "linear-gradient(135deg, #F1F4FD, #fff 70%)", border: "1px solid #C5D0F7", borderRadius: 14, padding: "20px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, background: "#3B5BDB", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>👤</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14.5, fontWeight: 700, color: "#0F1A36" }}>김지훈 님의 프로필 진행률</div>
                <div style={{ fontSize: 12, color: "#5B6685", marginTop: 2 }}>6개 항목 중 {filled}개 입력 완료 · 1개 보완 필요</div>
              </div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "#3B5BDB", fontVariantNumeric: "tabular-nums" }}>{pct}%</div>
            </div>
            <div style={{ height: 8, background: "#fff", border: "1px solid #C5D0F7", borderRadius: 5, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg, #3B5BDB, #5C7AE6)", borderRadius: 5 }}/>
            </div>
          </div>
          <div style={{ background: "#fff", border: "1px solid #E1E5EF", borderRadius: 14, padding: "16px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#7C87A4", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>마스터 데이터 출처</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 12, color: "#3A4565" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#2F9E5E" }}>✓</span> 인사시스템 · 동기화 완료
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#2F9E5E" }}>✓</span> R3 마스터데이터 · 매핑 완료
              </div>
              <div style={{ fontSize: 11, color: "#7C87A4", marginTop: 4, lineHeight: 1.55 }}>
                회색 항목은 인사시스템에서 자동으로 채워졌어요. 수정이 필요하면 인사담당자에게 요청해주세요.
              </div>
            </div>
          </div>
        </div>

        {/* MAIN — 7개 필드 그룹 */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* 1. 직무 / 직렬 */}
          <FieldGroup
            icon="🏢" title="직무 · 직렬"
            desc="인사시스템에서 자동 동기화된 정보예요. 수정이 필요하면 인사담당자에게 요청해주세요."
            status="done"
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
              <div>
                <label style={wizLabelStyle}>본부 · 팀</label>
                <input style={{ ...wizInputStyle, background: "#F9FAFC", color: "#5B6685" }} value="운영본부 · 결제플랫폼팀" readOnly/>
              </div>
              <div>
                <label style={wizLabelStyle}>직급</label>
                <input style={{ ...wizInputStyle, background: "#F9FAFC", color: "#5B6685", fontFamily: "var(--font-mono)" }} value="4급갑" readOnly/>
              </div>
              <div>
                <label style={wizLabelStyle}>직렬</label>
                <div style={{ display: "flex", gap: 4, padding: 4, background: "#F4F7FB", borderRadius: 10 }}>
                  {["SE", "DE", "PM"].map(s => (
                    <button key={s} onClick={() => setJobSeries(s)} style={{
                      flex: 1, padding: "8px 10px", borderRadius: 7,
                      background: jobSeries === s ? "#fff" : "transparent",
                      color: jobSeries === s ? "#0F1A36" : "#7C87A4",
                      fontWeight: jobSeries === s ? 700 : 500,
                      fontFamily: "var(--font-mono)", fontSize: 12.5,
                      border: "none", cursor: "pointer",
                      boxShadow: jobSeries === s ? "0 1px 2px rgba(31,42,74,.08)" : "none",
                    }}>{s}</button>
                  ))}
                </div>
              </div>
            </div>
          </FieldGroup>

          {/* 2. 업무 분장 + 담당 업무 */}
          <FieldGroup
            icon="📝" title="업무 분장 · 담당 업무"
            desc="OKR의 객관성 검증에 활용돼요. 본인이 실제로 책임지는 업무 영역을 정확히 적어주세요."
            status="done"
          >
            <div style={{ display: "grid", gap: 14 }}>
              <div>
                <label style={wizLabelStyle}>주요 업무 분장 <span style={{ color: "#D14343" }}>*</span></label>
                <textarea
                  style={{ ...wizInputStyle, minHeight: 70, resize: "vertical", lineHeight: 1.55 }}
                  defaultValue="결제플랫폼 백엔드 성능/튜닝 — APM 기반 응답속도 개선, 캐시 전략, DB 쿼리 최적화"
                />
                <div style={wizHintStyle}>STEP 3 객관성 검증 시 이 영역과 KR이 일치하는지 자동 확인해요.</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={wizLabelStyle}>담당 시스템 / 도메인</label>
                  <TagInput
                    defaultTags={["결제 게이트웨이", "결제 인증모듈", "야간 배치"]}
                    placeholder="시스템 이름 입력 후 Enter"
                  />
                </div>
                <div>
                  <label style={wizLabelStyle}>주요 협업 대상</label>
                  <TagInput
                    defaultTags={["SRE팀", "인프라팀"]}
                    placeholder="협업 팀 입력 후 Enter"
                  />
                </div>
              </div>
            </div>
          </FieldGroup>

          {/* 3. 근속 정보 */}
          <FieldGroup
            icon="📅" title="근속 정보"
            desc="입사년도와 현 보직 발령일자가 KR 도전성 평가 시 가중치 산정에 참고돼요."
            status="done"
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              <div>
                <label style={wizLabelStyle}>입사년도</label>
                <input style={{ ...wizInputStyle, background: "#F9FAFC", color: "#5B6685", fontFamily: "var(--font-mono)" }} value="2018" readOnly/>
                <div style={wizHintStyle}>전체 근속 <b style={{ color: "#0F1A36" }}>8년 4개월</b></div>
              </div>
              <div>
                <label style={wizLabelStyle}>현 보직 발령일</label>
                <input style={{ ...wizInputStyle, fontFamily: "var(--font-mono)" }} defaultValue="2024.07.01"/>
                <div style={wizHintStyle}>결제플랫폼팀 근속 <b style={{ color: "#0F1A36" }}>1년 0개월</b> · 최근 1년 이내 이동</div>
              </div>
              <div>
                <label style={wizLabelStyle}>이전 직무 경험</label>
                <input style={wizInputStyle} defaultValue="결제정산팀 (3년 6개월)"/>
                <div style={wizHintStyle}>최근 5년 내 주요 경력</div>
              </div>
            </div>
          </FieldGroup>

          {/* 3-b. 사수 정보 · 인수인계 (신규 섹션) */}
          <SupervisorHandover/>

          {/* 4. 근무 형태 */}
          <FieldGroup
            icon="🏠" title="근무 형태"
            desc="상주/파견 여부에 따라 협업 가능 범위와 평가 기준이 달라질 수 있어요."
            status="done"
          >
            <div style={{ display: "flex", gap: 10 }}>
              <Radio value="onsite" current={workType} onChange={setWorkType} label="상주 (본사)" sub="본사 사무실 출근"/>
              <Radio value="dispatch" current={workType} onChange={setWorkType} label="파견" sub="외부 사이트 상주"/>
              <Radio value="remote" current={workType} onChange={setWorkType} label="원격" sub="재택 또는 거점 근무"/>
              <Radio value="hybrid" current={workType} onChange={setWorkType} label="하이브리드" sub="주 N일 출근"/>
            </div>
            {workType === "dispatch" && (
              <div style={{ marginTop: 14, padding: "12px 14px", background: "#FFF7EC", border: "1px solid #FFE0BA", borderRadius: 10, fontSize: 12.5, color: "#7A4A14", lineHeight: 1.55, display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span>💡</span>
                <div>파견 근무자는 <b>고객사 일정에 영향을 받는 KR</b>의 도전성 가중치 산정 시 별도 기준이 적용돼요. 협업 대상에 고객사도 함께 적어주세요.</div>
              </div>
            )}
          </FieldGroup>

          {/* 5. 자격증 */}
          <FieldGroup
            icon="📜" title="자격증 목록"
            desc="보유한 자격증을 등록하면 관련 직무 KR 작성 시 AI 코치가 활용 가이드를 제안해드려요."
            status="in-progress"
          >
            <div style={{ marginBottom: 12 }}>
              <label style={wizLabelStyle}>보유 자격증</label>
              <TagInput
                defaultTags={["AWS SAA", "CKA", "정보처리기사"]}
                placeholder="자격증 이름 입력 후 Enter"
              />
            </div>
            <div style={{ padding: "12px 14px", background: "#F1F4FD", border: "1px solid #C5D0F7", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 16 }}>✨</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: "#1F2A4A", fontWeight: 600 }}>관련 자격증 제안 3건</div>
                <div style={{ fontSize: 11.5, color: "#5B6685", marginTop: 2 }}>담당 업무(결제 백엔드) 기반 추천 — AWS SAP · CKAD · PMP</div>
              </div>
              <Button variant="secondary" size="sm">자격증 추가</Button>
            </div>
          </FieldGroup>

          {/* 6. 약관 동의 */}
          <FieldGroup
            icon="🛡️" title="평가 안내 · AI 코칭 활용 동의"
            status="pending"
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "(필수) 2026년 OKR 기반 개인평가제도 안내문을 확인했어요", checked: true },
                { label: "(필수) 작성한 OKR이 평가자·인사담당자에게 공유됨에 동의해요", checked: true },
                { label: "(선택) AI 코칭 대화 내역이 익명화되어 코칭 품질 개선에 활용되는 것에 동의해요", checked: false },
              ].map((c, i) => (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", background: c.checked ? "#F1F4FD" : "#F9FAFC", border: `1px solid ${c.checked ? "#C5D0F7" : "#E1E5EF"}`, borderRadius: 10, cursor: "pointer" }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, marginTop: 1,
                    background: c.checked ? "#3B5BDB" : "#fff",
                    border: `1.5px solid ${c.checked ? "#3B5BDB" : "#C8CFDF"}`,
                    color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 12, fontWeight: 700, flexShrink: 0,
                  }}>{c.checked && "✓"}</div>
                  <div style={{ fontSize: 13, color: c.checked ? "#0F1A36" : "#3A4565", lineHeight: 1.5 }}>{c.label}</div>
                </label>
              ))}
            </div>
          </FieldGroup>

        </div>

        {/* 마이페이지 액션 바 — Wizard가 아닌 상시 저장 컨트롤 */}
        <div style={{
          marginTop: 28, padding: "18px 22px",
          background: "#fff", border: "1px solid #E6E9E4", borderRadius: 14,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          boxShadow: "0 1px 2px rgba(31,42,74,.04)",
        }}>
          <div style={{ fontSize: 13, color: "#5B6685" }}>
            마지막 저장 · <span style={{ fontFamily: "var(--font-mono)" }}>2026-06-28 14:22</span>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <a href="./r1-employee.html" style={{ textDecoration: "none" }}>
              <button style={{
                background: "#fff", color: "#3A4565",
                border: "1px solid #DDE2E7", padding: "10px 18px",
                borderRadius: 10, fontSize: 14, fontWeight: 500, cursor: "pointer",
              }}>홈으로</button>
            </a>
            <button style={{
              background: "#0A1F17", color: "#fff", border: "none",
              padding: "10px 22px", borderRadius: 10,
              fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>변경사항 저장</button>
          </div>
        </div>
      </div>
    </main>
  );
}

window.R1ProfileSetup = R1ProfileSetup;
