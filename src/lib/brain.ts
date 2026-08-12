"use client";

export const brain = {
  async chat(prompt: string, model = "meta-llama/llama-3.3-70b-instruct") {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [{ role: "user", content: prompt }], model }),
      });
      return await res.json();
    } catch (e) {
      return { success: false, error: "AI unreachable" };
    }
  },

  async submitMission(goal: string, priority = 0.5) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "submitMission", goal, priority }),
    });
    return res.json();
  },

  async listMissions() {
    const res = await fetch("/api/os?action=listMissions");
    return res.json();
  },

  async generateVideo(prompt: string, duration = "15s", style = "cinematic", engine = "auto") {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generateVideo", prompt, duration, style, engine }),
    });
    return res.json();
  },

  async videoStatus(jobId: string) {
    const res = await fetch(`/api/os?action=videoStatus&jobId=${encodeURIComponent(jobId)}`);
    return res.json();
  },

  async find(collection: string, query?: Record<string, any>) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "find", collection, query }),
    });
    return res.json();
  },

  async insert(collection: string, data: Record<string, any>) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "insert", collection, data }),
    });
    return res.json();
  },

  async update(collection: string, query: Record<string, any>, updateData: Record<string, any>) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "update", collection, query, data: updateData }),
    });
    return res.json();
  },

  async delete(collection: string, query: Record<string, any>) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", collection, query }),
    });
    return res.json();
  },

  async stats() {
    const res = await fetch("/api/os?action=stats");
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "login", email, password }),
    });
    return res.json();
  },

  async register(email: string, password: string, name?: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "register", email, password, name }),
    });
    return res.json();
  },

  async requestPasswordReset(email: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-request", email }),
    });
    return res.json();
  },

  async resetPassword(email: string, token: string, newPassword: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset-password", email, token, newPassword }),
    });
    return res.json();
  },

  async requestEmailVerification(email: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-request", email }),
    });
    return res.json();
  },

  async verifyEmail(email: string, token: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verify-email", email, token }),
    });
    return res.json();
  },

  async sendEmail(to: string, subject: string, body: string, from_email?: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "sendEmail", to, subject, body, from_email }),
    });
    return res.json();
  },

  async createCheckout(plan: string, email: string) {
    const res = await fetch("/api/os", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "createCheckout", plan, email }),
    });
    return res.json();
  },
};