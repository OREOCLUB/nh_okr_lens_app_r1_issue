// certDb.ts — 자격증 검색 DB (R1 STEP 0 · 마이페이지).
// 조회 우선순위: Supabase certifications 테이블(회사가 등급표 관리) → 이 로컬 시드 폴백.
// 회사(R3)가 자격증별 등급표(company_grade)를 입력하면 검색 리스트에 등급 배지로 표시되고,
// "회사 분류" 필터로 회사가 분류해둔 목록만 검색할 수 있다.

export interface CertItem {
  id: string;
  name: string;
  issuer: string; // 발급 기관
  category: string; // 분류 — 클라우드 / 보안 / 데이터 / PM / 인프라 / 개발 / 국가기술 …
  companyGrade: string | null; // 회사 자격증 등급표 (S/A/B/C) — R3가 입력, 없으면 미분류
  aliases: string[]; // 검색 동의어 (약어·한글명)
}

// 로컬 시드 — Supabase 미연결 시 사용. 회사 등급은 예시값.
export const CERT_SEED: CertItem[] = [
  { id: "C001", name: "AWS Solutions Architect Professional", issuer: "Amazon", category: "클라우드", companyGrade: "S", aliases: ["AWS SAP", "솔루션스아키텍트"] },
  { id: "C002", name: "AWS Solutions Architect Associate", issuer: "Amazon", category: "클라우드", companyGrade: "A", aliases: ["AWS SAA"] },
  { id: "C003", name: "CKA (Certified Kubernetes Administrator)", issuer: "CNCF", category: "클라우드", companyGrade: "A", aliases: ["CKA", "쿠버네티스"] },
  { id: "C004", name: "CKAD (Certified Kubernetes Application Developer)", issuer: "CNCF", category: "클라우드", companyGrade: "B", aliases: ["CKAD"] },
  { id: "C005", name: "PMP (Project Management Professional)", issuer: "PMI", category: "PM", companyGrade: "A", aliases: ["PMP", "프로젝트관리"] },
  { id: "C006", name: "정보처리기사", issuer: "한국산업인력공단", category: "국가기술", companyGrade: "B", aliases: ["정처기"] },
  { id: "C007", name: "정보보안기사", issuer: "한국산업인력공단", category: "보안", companyGrade: "A", aliases: ["보안기사"] },
  { id: "C008", name: "CISSP", issuer: "ISC2", category: "보안", companyGrade: "S", aliases: ["씨습"] },
  { id: "C009", name: "CISA", issuer: "ISACA", category: "보안", companyGrade: "A", aliases: ["감사사"] },
  { id: "C010", name: "SQLD (SQL 개발자)", issuer: "한국데이터산업진흥원", category: "데이터", companyGrade: "C", aliases: ["SQLD"] },
  { id: "C011", name: "SQLP (SQL 전문가)", issuer: "한국데이터산업진흥원", category: "데이터", companyGrade: "A", aliases: ["SQLP"] },
  { id: "C012", name: "ADsP (데이터분석 준전문가)", issuer: "한국데이터산업진흥원", category: "데이터", companyGrade: "C", aliases: ["ADsP", "데이터분석"] },
  { id: "C013", name: "ADP (데이터분석 전문가)", issuer: "한국데이터산업진흥원", category: "데이터", companyGrade: "S", aliases: ["ADP"] },
  { id: "C014", name: "OCP (Oracle Certified Professional)", issuer: "Oracle", category: "데이터", companyGrade: "B", aliases: ["OCP", "오라클"] },
  { id: "C015", name: "네트워크관리사 2급", issuer: "ICQA", category: "인프라", companyGrade: null, aliases: ["네관사"] },
  { id: "C016", name: "리눅스마스터 1급", issuer: "KAIT", category: "인프라", companyGrade: "B", aliases: ["리눅스"] },
  { id: "C017", name: "TOPCIT", issuer: "IITP", category: "개발", companyGrade: null, aliases: ["탑싯"] },
  { id: "C018", name: "Azure Administrator Associate", issuer: "Microsoft", category: "클라우드", companyGrade: "B", aliases: ["AZ-104", "애저"] },
];

/**
 * 자격증 검색 — 이름·동의어·분류·발급기관 부분 일치.
 * companyOnly=true면 회사가 등급표로 분류해둔 목록만.
 * 정렬: 회사 등급 보유 우선(S→A→B→C) → 이름순.
 */
export function searchCerts(list: CertItem[], query: string, companyOnly = false): CertItem[] {
  const q = query.trim().toLowerCase();
  const gradeOrder = (g: string | null) => (g ? "SABCD".indexOf(g.charAt(0)) : 99);
  return list
    .filter((c) => !companyOnly || c.companyGrade)
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.issuer.toLowerCase().includes(q) ||
        c.aliases.some((a) => a.toLowerCase().includes(q))
    )
    .sort((a, b) => gradeOrder(a.companyGrade) - gradeOrder(b.companyGrade) || a.name.localeCompare(b.name, "ko"));
}

export const CERT_GRADE_COLOR: Record<string, { bg: string; fg: string }> = {
  S: { bg: "#F0E9FB", fg: "#7C4DD9" },
  A: { bg: "#E5EBFB", fg: "#3B5BDB" },
  B: { bg: "#ECFAF1", fg: "#2F9E5E" },
  C: { bg: "#FFF7EC", fg: "#D98023" },
};
