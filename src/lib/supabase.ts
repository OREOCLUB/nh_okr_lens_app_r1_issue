// supabase.ts — Supabase 클라이언트 싱글턴.
// 환경 변수(.env.local)가 비어 있으면 null — 화면은 더미 데이터 폴백으로 동작한다.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
