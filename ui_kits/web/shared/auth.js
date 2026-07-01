// auth.js — 계정 데이터베이스 + 로그인/로그아웃 헬퍼 (전역)
// - localStorage 키: okrlens_current_user
// - window.OKRLensAuth: { USERS, login, logout, getCurrentUser, requireAuth }

(function () {
  // ─────────────────────────────────────────────
  // 계정 목록 (프로토타입 · Supabase RLS는 P2)
  // role: R1(피평가자) | R2(평가자) | R3(인사담당자)
  // ─────────────────────────────────────────────
  const USERS = [
    // ── R1: 피평가자 ──
    { id: "jung.ty",   name: "정태영", role: "R1", dept: "운영본부", team: "결제플랫폼팀",   grade: "3급", jobSeries: "SE", avatarColor: "#3B5BDB" },
    { id: "kim.sr",    name: "김수련", role: "R1", dept: "운영본부", team: "데이터플랫폼팀", grade: "4급", jobSeries: "SE", avatarColor: "#3B5BDB" },
    { id: "lee.jw",    name: "이지원", role: "R1", dept: "IT본부",   team: "인프라운영팀",   grade: "3급", jobSeries: "SM", avatarColor: "#3B5BDB" },

    // ── R2: 평가자 (팀장) ──
    { id: "park.jh",   name: "박정훈", role: "R2", dept: "운영본부", team: "결제플랫폼팀",   grade: "2급", jobSeries: "SE", avatarColor: "#00A968" },
    { id: "choi.mk",   name: "최민경", role: "R2", dept: "IT본부",   team: "인프라운영팀",   grade: "2급", jobSeries: "SM", avatarColor: "#00A968" },

    // ── R3: 인사담당자 ──
    { id: "hr.admin",  name: "한지영", role: "R3", dept: "경영지원본부", team: "인사노무팀", grade: "2급", jobSeries: "HR", avatarColor: "#E07A3C" },
  ];

  const STORAGE_KEY = "okrlens_current_user";

  const ROLE_LABEL = { R1: "피평가자", R2: "평가자", R3: "인사담당자" };
  const ROLE_HOME = {
    R1: "./r1/r1-employee.html",
    R2: "./r2/dashboard.html",
    R3: "./r3/r3-hr.html",
  };

  function login(userId) {
    const user = USERS.find((u) => u.id === userId);
    if (!user) return null;
    const session = { ...user, loginAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    return session;
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getCurrentUser() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  // 인증 필요 페이지에서 호출 — 미인증이면 로그인으로 리다이렉트
  function requireAuth(opts) {
    opts = opts || {};
    const user = getCurrentUser();
    if (!user) {
      window.location.href = "./index.html";
      return null;
    }
    // 역할 제한이 있는 경우
    if (opts.roles && !opts.roles.includes(user.role)) {
      // 자신의 역할 홈으로 리다이렉트
      window.location.href = ROLE_HOME[user.role] || "./role-select.html";
      return null;
    }
    return user;
  }

  window.OKRLensAuth = {
    USERS,
    ROLE_LABEL,
    ROLE_HOME,
    login,
    logout,
    getCurrentUser,
    requireAuth,
  };
})();
