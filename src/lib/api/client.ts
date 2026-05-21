import type { ApiResult } from "@/lib/api/response";
import {
  communities,
  conversations,
  currentUser,
  events,
  feedPosts,
  jobs,
  mentors,
  messages,
  notifications,
  users,
} from "@/lib/mock";

const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

function demoData(url: string): unknown {
  if (url === "/api/users/me") return currentUser;
  if (url === "/api/users/suggestions") return users.slice(1);
  if (url === "/api/posts") return feedPosts;
  if (url === "/api/communities") return communities.filter((community) => !community.is_private);
  if (url === "/api/jobs") return jobs;
  if (url === "/api/events") return events;
  if (url === "/api/mentorship/matches" || url === "/api/mentorship/profiles") return mentors;
  if (url === "/api/notifications") return notifications;
  if (url === "/api/messages/weekly-count") return { week_start: "2026-05-18", count: 3, remaining: 7 };
  if (url.startsWith("/api/messages/")) return messages;
  if (url === "/api/prayer-times") return { name: "Asr", time: "16:23", minutes_until: 82 };
  return null;
}

export async function apiGet<T>(url: string): Promise<T> {
  if (demoMode) return demoData(url) as T;
  const response = await fetch(url);
  const json = await response.json() as ApiResult<T>;
  if (!response.ok || json.error) throw new Error(json.error ?? "request_failed");
  return json.data as T;
}

export async function apiSend<T>(url: string, method: "POST" | "PATCH" | "DELETE", body?: unknown): Promise<T> {
  if (demoMode) return demoData(url) as T;
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await response.json() as ApiResult<T>;
  if (!response.ok || json.error) throw new Error(json.error ?? "request_failed");
  return json.data as T;
}
