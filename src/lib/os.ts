// Frontier OS — Unified Backend
// Replaces the separate FastAPI brain. Everything runs inside Next.js.

import fs from "fs";
import path from "path";
import crypto from "crypto";

const DATA_DIR = path.join(process.cwd(), ".frontier-data");

function dbPath(col: string) { return path.join(DATA_DIR, `${col}.json`); }

function ensure(col: string) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const p = dbPath(col);
  if (!fs.existsSync(p)) fs.writeFileSync(p, "[]");
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

function save(col: string, data: any[]) {
  fs.writeFileSync(dbPath(col), JSON.stringify(data, null, 2));
}

export const db = {
  find: (col: string, query?: any, limit = 50) => {
    let items = ensure(col);
    if (query) {
      items = items.filter((item: any) =>
        Object.entries(query).every(([k, v]) => item[k] === v)
      );
    }
    return items.slice(-limit);
  },
  findOne: (col: string, query: any) => {
    const items = ensure(col);
    return items.find((item: any) =>
      Object.entries(query).every(([k, v]) => item[k] === v)
    );
  },
  insert: (col: string, data: any) => {
    const items = ensure(col);
    const item = {
      _id: `${col}-${Date.now()}`,
      _created: new Date().toISOString(),
      _updated: new Date().toISOString(),
      ...data,
    };
    items.push(item);
    save(col, items);
    return item;
  },
  update: (col: string, query: any, updates: any) => {
    const items = ensure(col);
    let count = 0;
    items.forEach((item: any) => {
      if (Object.entries(query).every(([k, v]) => item[k] === v)) {
        Object.assign(item, updates, { _updated: new Date().toISOString() });
        count++;
      }
    });
    if (count) save(col, items);
    return count;
  },
  delete: (col: string, query: any) => {
    const items = ensure(col);
    const before = items.length;
    const filtered = items.filter((item: any) =>
      !Object.entries(query).every(([k, v]) => item[k] === v)
    );
    save(col, filtered);
    return before - filtered.length;
  },
  stats: () => {
    const stats: Record<string, number> = {};
    if (fs.existsSync(DATA_DIR)) {
      fs.readdirSync(DATA_DIR).forEach(f => {
        if (f.endsWith(".json")) stats[f.replace(".json", "")] = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), "utf-8")).length;
      });
    }
    return stats;
  },
};

// Auth
const AUTH_SECRET = process.env.AUTH_SECRET || "frontier-os-dev";

export const auth = {
  hash: (password: string) => crypto.createHash("sha256").update(`${password}:${AUTH_SECRET}`).digest("hex"),
  makeToken: (userId: string, email: string, plan: string) => {
    const exp = Math.floor(Date.now() / 1000) + 86400 * 7;
    const sig = crypto.createHash("sha256").update(`${userId}:${email}:${plan}:${exp}:${AUTH_SECRET}`).digest("hex").slice(0, 16);
    return `${userId}.${email}.${plan}.${exp}.${sig}`;
  },
  register: (email: string, password: string, name?: string) => {
    if (db.findOne("users", { email })) return { success: false, error: "Email already exists" };
    const user = db.insert("users", { email, name: name || email.split("@")[0], password: auth.hash(password), plan: "free" });
    return { success: true, token: auth.makeToken(user._id, email, "free"), user: { email, name: user.name, plan: "free" } };
  },
  login: (email: string, password: string) => {
    const user = db.findOne("users", { email });
    if (!user) return { success: false, error: "User not found" };
    if (user.password !== auth.hash(password)) return { success: false, error: "Invalid password" };
    return { success: true, token: auth.makeToken(user._id, email, user.plan || "free"), user: { email, name: user.name, plan: user.plan || "free" } };
  },
  requestReset: (email: string) => {
    const user = db.findOne("users", { email });
    if (!user) return { success: false, error: "User not found" };
    const resetToken = crypto.randomBytes(4).toString("hex").toUpperCase();
    db.update("users", { email }, { reset_token: auth.hash(resetToken), reset_expires: Date.now() + 3600000 });
    return { success: true, message: "Password reset code generated", resetToken };
  },
  resetPassword: (email: string, token: string, newPassword: string) => {
    const user = db.findOne("users", { email });
    if (!user) return { success: false, error: "User not found" };
    if (!user.reset_expires || user.reset_expires < Date.now()) return { success: false, error: "Reset token expired" };
    if (user.reset_token !== auth.hash(token.trim().toUpperCase()) && user.reset_token !== auth.hash(token.trim())) return { success: false, error: "Invalid reset token" };
    if (newPassword.length < 6) return { success: false, error: "Password must be at least 6 characters" };
    db.update("users", { email }, { password: auth.hash(newPassword), reset_token: null, reset_expires: null });
    return { success: true, message: "Password updated successfully" };
  },
  requestEmailVerification: (email: string) => {
    const user = db.findOne("users", { email });
    if (!user) return { success: false, error: "User not found" };
    const verifyToken = crypto.randomBytes(3).toString("hex").toUpperCase();
    db.update("users", { email }, { verify_token: auth.hash(verifyToken), verify_expires: Date.now() + 86400000 });
    return { success: true, message: "Verification token generated", verifyToken };
  },
  verifyEmail: (email: string, token: string) => {
    const user = db.findOne("users", { email });
    if (!user) return { success: false, error: "User not found" };
    if (!user.verify_expires || user.verify_expires < Date.now()) return { success: false, error: "Verification token expired" };
    if (user.verify_token !== auth.hash(token.trim().toUpperCase()) && user.verify_token !== auth.hash(token.trim())) return { success: false, error: "Invalid verification token" };
    db.update("users", { email }, { verified: true, verify_token: null, verify_expires: null });
    return { success: true, message: "Email verified successfully" };
  },
};

// AI Chat via OpenRouter
export async function chat(prompt: string, model = "meta-llama/llama-3.3-70b-instruct") {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return { success: false, error: "No API key" };
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model, messages: [{ role: "user", content: prompt }], max_tokens: 1024 }),
    });
    const data = await res.json();
    if (res.ok) return { success: true, content: data.choices?.[0]?.message?.content || "" };
    return { success: false, error: `API: ${res.status}` };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
