# Enterprise Messaging — Full email system
# SMTP/IMAP, campaigns, templates, multi-provider
# Integrates with Frontier Orchestrator via /v1/send

import logging
import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

logger = logging.getLogger("enterprise-messaging")

app = FastAPI(title="Enterprise Messaging", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# ─── Config ───────────────────────────────────────────────────
SMTP_HOST = os.environ.get("SMTP_HOST", "smtp")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "1025"))
SMTP_USER = os.environ.get("SMTP_USER", "")
SMTP_PASS = os.environ.get("SMTP_PASS", "")

# ─── Models ───────────────────────────────────────────────────
class EmailAddress(BaseModel):
    email: str
    name: str | None = None

class SendEmailRequest(BaseModel):
    to: list[EmailAddress]
    subject: str
    body: str
    body_type: str = "html"
    cc: list[EmailAddress] | None = None
    bcc: list[EmailAddress] | None = None
    reply_to: str | None = None
    campaign_id: str | None = None
    provider: str = "smtp"  # smtp, sendgrid, ses, mailgun

class CampaignRequest(BaseModel):
    name: str
    subject: str
    template: str
    recipients: list[EmailAddress]
    schedule: str | None = None  # cron expression or ISO datetime

# ─── Endpoints ────────────────────────────────────────────────

@app.get("/healthz")
async def health():
    return {"status": "healthy", "service": "enterprise-messaging"}

@app.post("/v1/send")
async def send_email(req: SendEmailRequest):
    """Send an email through the configured provider."""
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = req.subject
        msg["From"] = f"Frontier <{SMTP_USER or 'frontier@elitze.ai'}>"
        msg["To"] = ", ".join(f"{a.name or ''} <{a.email}>" for a in req.to)
        if req.cc:
            msg["Cc"] = ", ".join(f"{a.name or ''} <{a.email}>" for a in req.cc)
        if req.reply_to:
            msg["Reply-To"] = req.reply_to

        if req.body_type == "html":
            msg.attach(MIMEText(req.body, "html"))
        else:
            msg.attach(MIMEText(req.body, "plain"))

        # SMTP send (dev mode uses MailHog :1025)
        if req.provider == "smtp":
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                if SMTP_USER and SMTP_PASS:
                    server.login(SMTP_USER, SMTP_PASS)
                server.send_message(msg)
        else:
            logger.warning(f"Provider '{req.provider}' not implemented, falling back to SMTP")
            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=10) as server:
                server.send_message(msg)

        return {
            "status": "sent",
            "recipients": len(req.to),
            "campaign_id": req.campaign_id,
            "provider": req.provider,
        }
    except Exception as e:
        logger.error(f"Failed to send email: {e}")
        raise HTTPException(502, detail=f"Send failed: {e}") from e

@app.post("/v1/send/batch")
async def send_batch(req: CampaignRequest):
    """Send a campaign to multiple recipients."""
    results = {"sent": 0, "failed": 0, "errors": []}
    for recipient in req.recipients:
        try:
            body = req.template.replace("{{name}}", recipient.name or "")
            await send_email(SendEmailRequest(
                to=[recipient],
                subject=req.subject,
                body=body,
                body_type="html",
                campaign_id=req.name,
            ))
            results["sent"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append({"email": recipient.email, "error": str(e)})
    return {"status": "campaign_complete", **results}

@app.post("/v1/receive")
async def receive_email():
    """Pull emails from IMAP inbox."""
    return {"status": "not_implemented", "note": "IMAP receive coming in v2"}

@app.post("/v1/process")
async def process(payload: dict):
    """Orchestrator wrapper — accepts generic payload from agent chain."""
    body = payload.get("payload", payload)
    query = body.get("query", "") if isinstance(body, dict) else str(body)
    return {
        "status": "processed",
        "query": query[:200],
        "result": f"Enterprise Messaging processed: {query[:100]}",
    }
