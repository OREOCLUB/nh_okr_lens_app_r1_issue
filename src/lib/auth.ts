// auth.ts — 프로토타입 인증 (localStorage 세션). Supabase 연동은 P2.
// 원본 ui_kits/web/shared/auth.js 이식 + Next 라우트로 매핑.

export type Role = "R1" | "R2" | "R3";

export interface User {
  id: string;
  name: string;
  role: Role;
  dept: string;
  team: string;
  grade: string;
  jobSeries: string;
  avatarColor: string;
}

export interface Session extends User {
  loginAt: number;
}

export const USERS: User[] = [
  // ── R1: 피평가자 ──
  { id: "jung.ty", name: "정태영", role: "R1", dept: "운영본부", team: "결제플랫폼팀", grade: "3급", jobSeries: "SE", avatarColor: "#3B5BDB" },
  { id: "kim.sr", name: "김수련", role: "R1", dept: "운영본부", team: "데이터플랫폼팀", grade: "4급", jobSeries: "SE", avatarColor: "#3B5BDB" },
  { id: "lee.jw", name: "이지원", role: "R1", dept: "IT본부", team: "인프라운영팀", grade: "3급", jobSeries: "SM", avatarColor: "#3B5BDB" },
  // ── R2: 평가자 (팀장) ──
  { id: "park.jh", name: "박정훈", role: "R2", dept: "운영본부", team: "결제플랫폼팀", grade: "2급", jobSeries: "SE", avatarColor: "#00A968" },
  { id: "choi.mk", name: "최민경", role: "R2", dept: "IT본부", team: "인프라운영팀", grade: "2급", jobSeries: "SM", avatarColor: "#00A968" },
  // ── R3: 인사담당자 ──
  { id: "hr.admin", name: "한지영", role: "R3", dept: "경영지원본부", team: "인사노무팀", grade: "2급", jobSeries: "HR", avatarColor: "#E07A3C" },
];

export const ROLE_LABEL: Record<Role, string> = {
  R1: "피평가자",
  R2: "평가자",
  R3: "인사담당자",
};

// 역할별 홈 (Next 라우트)
export const ROLE_HOME: Record<Role, string> = {
  R1: "/r1",
  R2: "/r2",
  R3: "/r3",
};

const STORAGE_KEY = "okrlens_current_user";

export function login(userId: string): Session | null {
  const user = USERS.find((u) => u.id === userId);
  if (!user) return null;
  return loginAs(user);
}

// DB(dataAccess.getUsers)에서 조회한 사용자 객체로 로그인
export function loginAs(user: User): Session {
  const session: Session = { ...user, loginAt: Date.now() };
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
  return session;
}

export function logout() {
  if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}
