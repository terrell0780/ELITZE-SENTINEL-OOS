import { NextRequest, NextResponse } from "next/server";
import { db, auth, chat } from "@/lib/os";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, ...params } = body;

  try {
    switch (action) {
      case "register": return NextResponse.json(auth.register(params.email, params.password, params.name));
      case "login": return NextResponse.json(auth.login(params.email, params.password));
      case "reset-request": return NextResponse.json(auth.requestReset(params.email));
      case "reset-password": return NextResponse.json(auth.resetPassword(params.email, params.token, params.newPassword));
      case "verify-request": return NextResponse.json(auth.requestEmailVerification(params.email));
      case "verify-email": return NextResponse.json(auth.verifyEmail(params.email, params.token));
      case "sendEmail": {
        const brainUrl = process.env.NEXT_PUBLIC_RUNTIME_API || "http://localhost:8052";
        try {
          const res = await fetch(`${brainUrl}/v1/email/send`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ to: params.to, subject: params.subject, body: params.body, from_email: params.from_email })
          });
          if (res.ok) return NextResponse.json(await res.json());
        } catch {}
        const email = { from: params.from_email || "terrell0780@gmail.com", to: params.to, subject: params.subject, body: params.body, date: new Date().toLocaleString(), status: "saved" };
        db.insert("emails", email);
        return NextResponse.json({ success: true, message: "Saved to database" });
      }
      case "createCheckout": {
        const brainUrl = process.env.NEXT_PUBLIC_RUNTIME_API || "http://localhost:8052";
        try {
          const res = await fetch(`${brainUrl}/v1/payments/create-checkout`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ plan: params.plan, email: params.email })
          });
          if (res.ok) return NextResponse.json(await res.json());
        } catch {}
        return NextResponse.json({ url: `/upgrade?plan=${params.plan}&email=${params.email}`, success: true });
      }
      case "chat": return NextResponse.json(await chat(params.prompt, params.model));
      case "find": return NextResponse.json({ data: db.find(params.collection, params.query, params.limit) });
      case "insert": return NextResponse.json({ data: db.insert(params.collection, params.data) });
      case "update": return NextResponse.json({ updated: db.update(params.collection, params.query, params.data) });
      case "delete": return NextResponse.json({ deleted: db.delete(params.collection, params.query) });
      case "stats": return NextResponse.json(db.stats());
      default: return NextResponse.json({
        error_code: "UNAVAILABLE",
        message: "Unknown action requested",
        request_id: `req-${Date.now()}`,
        component: "api_gateway",
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({
      error_code: "FAILED",
      message: e.message || "Internal server error",
      request_id: `req-${Date.now()}`,
      component: "api_gateway",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  if (action === "stats") return NextResponse.json(db.stats());
  return NextResponse.json({
    error_code: "UNAVAILABLE",
    message: "HTTP GET not supported for this action. Use POST.",
    request_id: `req-${Date.now()}`,
    component: "api_gateway",
    timestamp: new Date().toISOString()
  }, { status: 400 });
}
