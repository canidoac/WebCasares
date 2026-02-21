"use server"

import { createClient } from "@/lib/supabase/server"

export type UserActionType =
  | "login"
  | "logout"
  | "password_change"
  | "profile_update"
  | "email_verified"
  | "password_reset_request"
  | "password_reset_complete"
  | "register"

export async function logUserAction(
  userId: number,
  actionType: UserActionType,
  actionDetails?: string,
  ipAddress?: string,
  userAgent?: string,
) {
  const supabase = await createClient()

  const { error } = await supabase.from("UserLogs").insert({
    user_id: userId,
    action_type: actionType,
    action_details: actionDetails,
    ip_address: ipAddress,
    user_agent: userAgent,
  })

  if (error) {
    console.error("[v0] Error logging user action:", error)
  }
}

export async function getUserLogs(userId: number, limit = 50) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from("UserLogs")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("[v0] Error fetching user logs:", error)
    return []
  }

  return data
}
