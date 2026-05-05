"use server";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient, requireProfile } from "@/lib/supabase/server";

const roleSchema = z.enum(["super_admin", "org_admin", "coordinator", "instructor", "manager", "student", "parent", "child"]);
const createUserSchema = z.object({ full_name: z.string().min(3), email: z.string().email(), role_key: roleSchema });
const updateUserSchema = z.object({ id: z.uuid(), full_name: z.string().min(3), role_key: roleSchema });
const createCourseSchema = z.object({ title: z.string().min(3), workload: z.coerce.number().min(0).max(1000).optional() });
const updateCourseSchema = z.object({ id: z.uuid(), title: z.string().min(3), workload: z.coerce.number().min(0).max(1000), is_active: z.enum(["true", "false"]) });
const createPathSchema = z.object({ title: z.string().min(3), description: z.string().max(500).optional() });
const updatePathSchema = z.object({ id: z.uuid(), title: z.string().min(3), description: z.string().max(500).optional() });
const createAssessmentSchema = z.object({ title: z.string().min(3), min_score: z.coerce.number().min(0).max(100), attempts_allowed: z.coerce.number().min(1).max(10) });
const updateAssessmentSchema = z.object({ id: z.uuid(), title: z.string().min(3), min_score: z.coerce.number().min(0).max(100), attempts_allowed: z.coerce.number().min(1).max(10) });

async function logAction(action: string, metadata: Record<string, unknown>) {
  const { supabase, user, profile } = await requireProfile();
  await supabase.from("activity_logs").insert({ organization_id: profile.organization_id, user_id: user.id, action, metadata });
}

export async function signInAction(formData: FormData): Promise<void> { const supabase = await createClient(); const { error } = await supabase.auth.signInWithPassword({ email: String(formData.get("email")||""), password: String(formData.get("password")||"") }); if (error) redirect("/login?error=1"); redirect("/dashboard"); }
export async function signOutAction(): Promise<void> { const supabase = await createClient(); await supabase.auth.signOut(); redirect("/login"); }
export async function resetPasswordAction(formData: FormData): Promise<void> { const supabase = await createClient(); await supabase.auth.resetPasswordForEmail(String(formData.get("email")||""), { redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login` }); redirect("/recuperar-senha?success=1"); }

export async function createUserAction(formData: FormData): Promise<void> {
  const parsed = createUserSchema.parse({ full_name: formData.get("full_name"), email: formData.get("email"), role_key: formData.get("role_key") });
  const { supabase, profile } = await requireProfile();
  await supabase.from("users_profiles").insert({ id: crypto.randomUUID(), organization_id: profile.organization_id, full_name: parsed.full_name, email: parsed.email, role_key: parsed.role_key });
  await logAction("user.create", { email: parsed.email, role: parsed.role_key });
}
export async function updateUserAction(formData: FormData): Promise<void> { const parsed = updateUserSchema.parse({ id: formData.get("id"), full_name: formData.get("full_name"), role_key: formData.get("role_key") }); const { supabase } = await requireProfile(); await supabase.from("users_profiles").update({ full_name: parsed.full_name, role_key: parsed.role_key }).eq("id", parsed.id); await logAction("user.update", { id: parsed.id }); }
export async function deleteUserAction(formData: FormData): Promise<void> { const id = z.uuid().parse(String(formData.get("id")||"")); const { supabase } = await requireProfile(); await supabase.from("users_profiles").delete().eq("id", id); await logAction("user.delete", { id }); }

export async function createCourseAction(formData: FormData): Promise<void> { const parsed = createCourseSchema.parse({ title: formData.get("title"), workload: formData.get("workload") }); const { supabase, profile } = await requireProfile(); await supabase.from("courses").insert({ organization_id: profile.organization_id, title: parsed.title, workload_hours: parsed.workload ?? 0, is_active: true }); await logAction("course.create", { title: parsed.title }); }
export async function updateCourseAction(formData: FormData): Promise<void> { const parsed = updateCourseSchema.parse({ id: formData.get("id"), title: formData.get("title"), workload: formData.get("workload"), is_active: formData.get("is_active") }); const { supabase } = await requireProfile(); await supabase.from("courses").update({ title: parsed.title, workload_hours: parsed.workload, is_active: parsed.is_active === "true" }).eq("id", parsed.id); await logAction("course.update", { id: parsed.id }); }
export async function deleteCourseAction(formData: FormData): Promise<void> { const id = z.uuid().parse(String(formData.get("id")||"")); const { supabase } = await requireProfile(); await supabase.from("courses").delete().eq("id", id); await logAction("course.delete", { id }); }

export async function createPathAction(formData: FormData): Promise<void> { const parsed = createPathSchema.parse({ title: formData.get("title"), description: formData.get("description") }); const { supabase, profile } = await requireProfile(); await supabase.from("learning_paths").insert({ organization_id: profile.organization_id, title: parsed.title, description: parsed.description ?? "" }); await logAction("path.create", { title: parsed.title }); }
export async function updatePathAction(formData: FormData): Promise<void> { const parsed = updatePathSchema.parse({ id: formData.get("id"), title: formData.get("title"), description: formData.get("description") }); const { supabase } = await requireProfile(); await supabase.from("learning_paths").update({ title: parsed.title, description: parsed.description ?? "" }).eq("id", parsed.id); await logAction("path.update", { id: parsed.id }); }
export async function deletePathAction(formData: FormData): Promise<void> { const id = z.uuid().parse(String(formData.get("id")||"")); const { supabase } = await requireProfile(); await supabase.from("learning_paths").delete().eq("id", id); await logAction("path.delete", { id }); }

export async function createAssessmentAction(formData: FormData): Promise<void> { const parsed = createAssessmentSchema.parse({ title: formData.get("title"), min_score: formData.get("min_score") ?? 70, attempts_allowed: formData.get("attempts_allowed") ?? 2 }); const { supabase, profile } = await requireProfile(); await supabase.from("assessments").insert({ organization_id: profile.organization_id, title: parsed.title, min_score: parsed.min_score, attempts_allowed: parsed.attempts_allowed }); await logAction("assessment.create", { title: parsed.title }); }
export async function updateAssessmentAction(formData: FormData): Promise<void> { const parsed = updateAssessmentSchema.parse({ id: formData.get("id"), title: formData.get("title"), min_score: formData.get("min_score"), attempts_allowed: formData.get("attempts_allowed") }); const { supabase } = await requireProfile(); await supabase.from("assessments").update({ title: parsed.title, min_score: parsed.min_score, attempts_allowed: parsed.attempts_allowed }).eq("id", parsed.id); await logAction("assessment.update", { id: parsed.id }); }
export async function deleteAssessmentAction(formData: FormData): Promise<void> { const id = z.uuid().parse(String(formData.get("id")||"")); const { supabase } = await requireProfile(); await supabase.from("assessments").delete().eq("id", id); await logAction("assessment.delete", { id }); }

