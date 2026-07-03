// dataAccess.ts — DB 접근 단일 지점 (spec: 모든 데이터 접근은 이 래퍼 경유).
// Supabase 미설정이거나 조회에 실패하면 null을 반환하고,
// 각 화면은 기존 더미 데이터를 초기값으로 유지한 채 그대로 동작한다.
import { supabase } from "./supabase";
import type { User } from "./auth";
import type { Member, OKR, RiskAnalysis } from "./mockData";
import type { EvalSystem, TaxonomyGroup, CheckItem } from "./criteria";

const PERIOD = "2026H2";

// ── r3/master 사원정보 탭 ───────────────────────────────────
export interface Employee {
  id: string;
  name: string;
  grade: string;
  band: string;
  series: string;
  team: string;
  role: string;
  evaluator: string; // 평가자 이름 표기 (없으면 '—')
  join: string;
  certs: string[];
}

// ── r3/master 조직 탭 ───────────────────────────────────────
export interface Dept {
  name: string;
  code: string;
  count: number;
  depth: number;
  leader: string;
  sel?: boolean;
}

// ── r3/master Import 탭 ─────────────────────────────────────
export interface ImportRecord {
  file: string;
  year: string;
  rows: number;
  at: string;
  by: string;
  status: string;
}

// ── r3/schedule ─────────────────────────────────────────────
export interface Phase {
  id: string;
  ico: string;
  name: string;
  start: string;
  end: string;
  control: string;
  who: string;
  status: "done" | "active" | "up";
}

// ── r3/metrics ──────────────────────────────────────────────
export interface Metric {
  id: string;
  name: string;
  category: string;
  group: string;
  status: string;
  definition: string;
  formula: string;
  unit: string;
  usage: number;
  orgs: number;
  exampleKR: string;
  warnings?: string[];
}

// ── r3/criteria ─────────────────────────────────────────────
export interface CriteriaData {
  system: EvalSystem;
  taxonomy: TaxonomyGroup[];
  checklist: CheckItem[];
}

// ── r2/review 검토 상세 ─────────────────────────────────────
export interface ReviewOkr {
  id: number;
  status: "approved" | "submitted" | "draft" | "rejected";
  obj: string;
  kr: string;
  format: string;
  baseline: string;
  goal: string;
  weight: number;
  difficulty: string | null;
  measure: string | null;
  plan: string | null;
}

// 작년 OKR 팝업 (okr_history — event null 행)
export interface HistoryOkr {
  year: number;
  obj: string;
  kr: string;
  grade: string;
  difficulty: string | null;
  achievement: number | null;
  result: string | null;
}

// 반려 이력 타임라인 (okr_history — event 행)
export interface HistoryEvent {
  event: "submit" | "reject" | "resubmit";
  at: string;
  note: string;
}

export type { RiskAnalysis };

export type ReviewDecision = "approved" | "rejected" | "adjustment";
export interface WriteResult {
  ok: boolean;
  /** "NO_DB" = Supabase 미설정 (화면은 데모 모드로 로컬 반영) */
  error?: string;
}

/** select 결과가 비어있지 않을 때만 rows 반환, 그 외 null (→ 화면은 더미 유지) */
async function rows<T>(table: string, query: string, order?: string): Promise<T[] | null> {
  if (!supabase) return null;
  let builder = supabase.from(table).select(query);
  if (order) builder = builder.order(order, { ascending: true });
  const { data, error } = await builder;
  if (error || !data || data.length === 0) return null;
  return data as T[];
}

// ── 로그인 사용자 (app/page — login_id 보유 사원만) ──────────
export async function getUsers(): Promise<User[] | null> {
  interface Row { login_id: string | null; name: string; role: User["role"]; dept: string; team: string; grade: string; job_series: string; avatar_color: string | null }
  const data = await rows<Row>("employees", "login_id, name, role, dept, team, grade, job_series, avatar_color", "sort_order");
  if (!data) return null;
  const users = data.filter((r) => r.login_id);
  if (users.length === 0) return null;
  return users.map((r) => ({
    id: r.login_id as string,
    name: r.name,
    role: r.role,
    dept: r.dept,
    team: r.team,
    grade: r.grade,
    jobSeries: r.job_series,
    avatarColor: r.avatar_color ?? "#3B5BDB",
  }));
}

// ── R2 팀원 현황 (okr_submissions ⨝ employees) ──────────────
// evaluatorLoginId를 주면 해당 R2의 전속 팀원만 조회 (평가 라인: R2 1명 → R1 N명, 중복 없음)
export async function getMembers(evaluatorLoginId?: string): Promise<Member[] | null> {
  interface Row {
    employee_id: string; submit_date: string | null; status: Member["status"]; risk: Member["risk"];
    focus: boolean; coaching: boolean; obj: string; risk_analysis: RiskAnalysis | null;
    employees: { grade: string; name: string; job_series: string; work_group: string | null } | null;
  }
  if (!supabase) return null;
  let evaluatorEmpId: string | null = null;
  if (evaluatorLoginId) {
    const { data: me } = await supabase.from("employees").select("id").eq("login_id", evaluatorLoginId).maybeSingle();
    evaluatorEmpId = (me as { id: string } | null)?.id ?? null;
  }
  let query = supabase
    .from("okr_submissions")
    .select("employee_id, submit_date, status, risk, focus, coaching, obj, risk_analysis, employees!inner(grade, name, job_series, work_group)")
    .eq("period", PERIOD);
  if (evaluatorEmpId) query = query.eq("employees.evaluator_id", evaluatorEmpId);
  const { data, error } = await query.order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as unknown as Row[]).map((r) => ({
    id: r.employee_id,
    grade: r.employees?.grade ?? "",
    name: r.employees?.name ?? "",
    series: r.employees?.job_series ?? "",
    group: r.employees?.work_group ?? "",
    submitDate: r.submit_date,
    status: r.status,
    risk: r.risk,
    focus: r.focus,
    coaching: r.coaching,
    obj: r.obj,
    analysis: r.risk_analysis,
  }));
}

// ── R1 본인 OKR ─────────────────────────────────────────────
export async function getR1Okrs(loginId = "jung.ty"): Promise<OKR[] | null> {
  interface Row {
    id: number;
    status: OKR["status"]; obj: string; kr: string; format: string; baseline: string; goal: string;
    weight: number; progress: number; evaluator_from: string | null; evaluator_msg: string | null;
    employees: { login_id: string | null } | null;
  }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("okrs")
    .select("id, status, obj, kr, format, baseline, goal, weight, progress, evaluator_from, evaluator_msg, employees!inner(login_id)")
    .eq("period", PERIOD)
    .eq("employees.login_id", loginId)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as unknown as Row[]).map((r) => ({
    dbId: r.id,
    status: r.status,
    obj: r.obj,
    kr: r.kr,
    format: r.format,
    baseline: r.baseline,
    goal: r.goal,
    weight: r.weight,
    progress: r.progress,
    evaluator: r.evaluator_from && r.evaluator_msg ? { from: r.evaluator_from, msg: r.evaluator_msg } : undefined,
  }));
}

// ── r2/review 팀원 OKR 상세 ─────────────────────────────────
export async function getMemberOkrs(employeeId: string): Promise<ReviewOkr[] | null> {
  interface Row {
    id: number; status: ReviewOkr["status"]; obj: string; kr: string; format: string; baseline: string;
    goal: string; weight: number; difficulty: string | null; measure: string | null; plan: string | null;
  }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("okrs")
    .select("id, status, obj, kr, format, baseline, goal, weight, difficulty, measure, plan")
    .eq("employee_id", employeeId)
    .eq("period", PERIOD)
    .order("sort_order", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return data as Row[];
}

// ── r2/review 작년 OKR (okr_history — 연도 적재 행) ──────────
export async function getMemberHistory(employeeId: string): Promise<HistoryOkr[] | null> {
  interface Row { year: number; obj: string; kr: string; grade: string; difficulty: string | null; achievement: number | null; result: string | null }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("okr_history")
    .select("year, obj, kr, grade, difficulty, achievement, result")
    .eq("emp_no", employeeId)
    .is("event", null)
    .order("year", { ascending: false });
  if (error || !data || data.length === 0) return null;
  return data as Row[];
}

// ── r2/review 반려 이력 타임라인 (okr_history — event 행) ────
export async function getMemberEvents(employeeId: string): Promise<HistoryEvent[] | null> {
  interface Row { event: HistoryEvent["event"]; event_at: string; note: string | null }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("okr_history")
    .select("event, event_at, note")
    .eq("emp_no", employeeId)
    .eq("period", PERIOD)
    .not("event", "is", null)
    .order("id", { ascending: true });
  if (error || !data || data.length === 0) return null;
  return (data as Row[]).map((r) => ({ event: r.event, at: r.event_at, note: r.note ?? "" }));
}

function nowStamp(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

// ── r2/review 처리 저장 (D9 통합형: risk_analysis + 처리 결정 동시 저장) ──
// okr_submissions 상태 갱신 + 해당 팀원 okrs 상태·평가자 메시지 갱신 (R1 홈 연쇄, D3)
export async function saveReviewDecision(args: {
  employeeId: string;
  decision: ReviewDecision;
  message: string;
  evaluatorName: string;
  analysis: RiskAnalysis;
}): Promise<WriteResult> {
  if (!supabase) return { ok: false, error: "NO_DB" };
  const { employeeId, decision, message, evaluatorName, analysis } = args;
  const { error: subErr } = await supabase
    .from("okr_submissions")
    .update({
      status: decision,
      risk: analysis.risk,
      evaluator_msg: message || null,
      decided_at: nowStamp(),
      risk_analysis: analysis,
    })
    .eq("employee_id", employeeId)
    .eq("period", PERIOD);
  if (subErr) return { ok: false, error: subErr.message };
  // R1 화면 연쇄: okrs.status는 approved/rejected 2값으로 매핑 (조정요청 → rejected="함께 정제")
  const { error: okrErr } = await supabase
    .from("okrs")
    .update({
      status: decision === "approved" ? "approved" : "rejected",
      evaluator_from: evaluatorName,
      evaluator_msg: message || null,
    })
    .eq("employee_id", employeeId)
    .eq("period", PERIOD);
  if (okrErr) return { ok: false, error: okrErr.message };
  return { ok: true };
}

// ── r2/review 임시 저장 (D9: risk_analysis만 저장 — 이탈 대비) ──
export async function saveReviewDraft(employeeId: string, analysis: RiskAnalysis): Promise<WriteResult> {
  if (!supabase) return { ok: false, error: "NO_DB" };
  const { error } = await supabase
    .from("okr_submissions")
    .update({ risk: analysis.risk, risk_analysis: analysis })
    .eq("employee_id", employeeId)
    .eq("period", PERIOD);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ════════════════════════════════════════════════════════════
// 쓰기 — R1 OKR 제출·진행률 (supabase/rls_write.sql 정책 필요)
// DB 미연결·실패 시 "local"로 반환 — 화면은 로컬 보존 후 코칭 톤 안내.
// ════════════════════════════════════════════════════════════

export interface SubmitOkrRow {
  obj: string;
  kr: string;
  format: string;
  baseline: string;
  goal: string;
  weight: number;
}

async function employeeIdByLogin(loginId: string): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("employees").select("id").eq("login_id", loginId).limit(1);
  if (error || !data || data.length === 0) return null;
  return (data[0] as { id: string }).id;
}

/** 위저드 제출 — 기존 반기 OKR을 교체하고 제출 현황을 갱신한다 */
export async function submitOkrs(loginId: string, rows: SubmitOkrRow[]): Promise<WriteResult> {
  if (!supabase) return { ok: false, error: "NO_DB" };
  const employeeId = await employeeIdByLogin(loginId);
  if (!employeeId) return { ok: false, error: "사원 정보를 찾지 못했어요" };

  const del = await supabase.from("okrs").delete().eq("employee_id", employeeId).eq("period", PERIOD);
  if (del.error) return { ok: false, error: del.error.message };

  const ins = await supabase.from("okrs").insert(
    rows.map((r, i) => ({
      employee_id: employeeId,
      period: PERIOD,
      status: "submitted",
      obj: r.obj,
      kr: r.kr,
      format: r.format,
      baseline: r.baseline,
      goal: r.goal,
      weight: r.weight,
      progress: 0,
      sort_order: i + 1,
    }))
  );
  if (ins.error) return { ok: false, error: ins.error.message };

  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")}`;
  const up = await supabase.from("okr_submissions").upsert(
    {
      employee_id: employeeId,
      period: PERIOD,
      submit_date: mmdd,
      status: "pending", // R2 화면 기준: 제출·미검토
      obj: rows[0]?.obj ?? "",
    },
    { onConflict: "employee_id,period" }
  );
  if (up.error) return { ok: false, error: up.error.message };
  return { ok: true };
}

/** 나의 OKR 진행률 업데이트 */
export async function updateOkrProgress(dbId: number, progress: number): Promise<WriteResult> {
  if (!supabase) return { ok: false, error: "NO_DB" };
  const { error } = await supabase.from("okrs").update({ progress }).eq("id", dbId);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ── r3/master 사원 마스터 ───────────────────────────────────
export async function getEmployees(): Promise<Employee[] | null> {
  interface Row {
    id: string; name: string; role: string; grade: string; grade_band: string | null; job_series: string;
    team: string; evaluator_id: string | null; join_year: number | null; certs: string[] | null;
  }
  const data = await rows<Row>("employees", "id, name, role, grade, grade_band, job_series, team, evaluator_id, join_year, certs", "sort_order");
  if (!data) return null;
  const nameById = new Map(data.map((r) => [r.id, r.name]));
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    grade: r.grade,
    band: r.grade_band ?? r.grade,
    series: r.job_series,
    team: r.team,
    role: r.role,
    evaluator: (r.evaluator_id && nameById.get(r.evaluator_id)) || "—",
    join: r.join_year ? String(r.join_year) : "—",
    certs: r.certs ?? [],
  }));
}

// ── r3/master 부서 계층 ─────────────────────────────────────
export async function getDepartments(): Promise<Dept[] | null> {
  interface Row { code: string; name: string; parent_code: string | null; leader: string; headcount: number }
  const data = await rows<Row>("departments", "code, name, parent_code, leader, headcount", "sort_order");
  if (!data) return null;
  const parentByCode = new Map(data.map((r) => [r.code, r.parent_code]));
  const depthOf = (code: string): number => {
    let depth = 0;
    let cur = parentByCode.get(code) ?? null;
    while (cur && depth < 10) {
      depth += 1;
      cur = parentByCode.get(cur) ?? null;
    }
    return depth;
  };
  return data.map((r) => ({ name: r.name, code: r.code, count: r.headcount, depth: depthOf(r.code), leader: r.leader }));
}

// ── r3/master 이전 OKR 가져오기 이력 ────────────────────────
export async function getImports(): Promise<ImportRecord[] | null> {
  interface Row { file_name: string; year: string; row_count: number; imported_at: string; imported_by: string; status: string }
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("okr_imports")
    .select("file_name, year, row_count, imported_at, imported_by, status")
    .order("imported_at", { ascending: false });
  if (error || !data || data.length === 0) return null;
  return (data as Row[]).map((r) => ({ file: r.file_name, year: r.year, rows: r.row_count, at: r.imported_at, by: r.imported_by, status: r.status }));
}

// ── r3/schedule 평가 단계 ───────────────────────────────────
export async function getEvalPhases(): Promise<Phase[] | null> {
  interface Row { id: string; ico: string; name: string; start_date: string; end_date: string; control: string; who: string; status: Phase["status"] }
  const data = await rows<Row>("eval_phases", "id, ico, name, start_date, end_date, control, who, status", "sort_order");
  if (!data) return null;
  return data.map((r) => ({ id: r.id, ico: r.ico, name: r.name, start: r.start_date, end: r.end_date, control: r.control, who: r.who, status: r.status }));
}

// ── r3/metrics 표준 지표 라이브러리 ─────────────────────────
export async function getMetrics(): Promise<Metric[] | null> {
  interface Row {
    id: string; name: string; status: string; category: string; group_name: string; definition: string;
    formula: string; unit: string; usage: number; orgs: number; example_kr: string; warnings: string[] | null;
  }
  const data = await rows<Row>("metrics", "id, name, status, category, group_name, definition, formula, unit, usage, orgs, example_kr, warnings", "sort_order");
  if (!data) return null;
  return data.map((r) => ({
    id: r.id,
    name: r.name,
    category: r.category,
    group: r.group_name,
    status: r.status,
    definition: r.definition,
    formula: r.formula,
    unit: r.unit,
    usage: r.usage,
    orgs: r.orgs,
    exampleKR: r.example_kr,
    warnings: r.warnings && r.warnings.length > 0 ? r.warnings : undefined,
  }));
}

// ── r3/criteria 평가 기준 (3테이블 병렬 조회) ────────────────
export async function getCriteria(): Promise<CriteriaData | null> {
  if (!supabase) return null;
  interface SystemRow { version: string; config: Omit<EvalSystem, "version"> }
  interface TaxonomyRow { id: TaxonomyGroup["id"]; title: string; descr: string; color: string; items: string[] }
  interface ChecklistRow { no: number; text: string; tag: string; edited: boolean }
  const [system, taxonomy, checklist] = await Promise.all([
    rows<SystemRow>("criteria_system", "version, config"),
    rows<TaxonomyRow>("criteria_taxonomy", "id, title, descr, color, items", "sort_order"),
    rows<ChecklistRow>("criteria_checklist", "no, text, tag, edited", "no"),
  ]);
  if (!system || !taxonomy || !checklist) return null;
  return {
    system: { version: system[0].version, ...system[0].config },
    taxonomy: taxonomy.map((t) => ({ id: t.id, title: t.title, desc: t.descr, color: t.color, items: t.items })),
    checklist: checklist.map((c) => ({ no: c.no, text: c.text, tag: c.tag, edited: c.edited || undefined })),
  };
}
