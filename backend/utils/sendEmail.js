import https from "https";
import fs from "fs/promises";
import path from "path";

const BREVO_API_HOST = "api.brevo.com";
const BREVO_API_PATH = "/v3/smtp/email";

const sanitizeHeaderValue = (v) => {
  return String(v || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/[\r\n]+/g, "");
};

const sanitizeEmail = (v) => {
  const s = String(v || "")
    .trim()
    .replace(/^"|"$/g, "")
    .replace(/[\r\n]+/g, "");
  return s;
};

const isValidEmail = (email) => {
  const s = sanitizeEmail(email);
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
};

const parseEmailFrom = (fromValue) => {
  const raw = sanitizeEmail(fromValue);
  if (!raw) return null;

  const match = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (match) {
    const name = match[1]?.trim();
    const email = match[2]?.trim();
    return {
      name: name || undefined,
      email,
    };
  }

  // If the string contains an email anywhere, extract it.
  const emailMatch = raw.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  if (emailMatch) return { email: emailMatch[0] };

  return { email: raw };
};

const normalizeRecipients = (to) => {
  const rawList = Array.isArray(to) ? to : to ? [to] : [];
  return rawList
    .map((v) => {
      if (!v) return null;
      if (typeof v === "string") return { email: v };
      if (typeof v === "object" && v.email) {
        return { email: String(v.email), name: v.name ? String(v.name) : undefined };
      }
      return { email: String(v) };
    })
    .filter(Boolean);
};

const toBrevoAttachments = async (attachments) => {
  if (!Array.isArray(attachments) || attachments.length === 0) return undefined;

  const out = [];
  for (const att of attachments) {
    try {
      if (!att) continue;
      const filename = att.filename ? String(att.filename) : undefined;
      const filePath = att.path ? String(att.path) : undefined;
      if (!filename || !filePath) continue;

      const abs = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(process.cwd(), filePath);

      const buf = await fs.readFile(abs);
      out.push({ name: filename, content: buf.toString("base64") });
    } catch (e) {
      console.warn("Failed to load email attachment:", e?.message || e);
    }
  }

  return out.length ? out : undefined;
};

const brevoRequest = async ({ apiKey, payload }) => {
  const body = JSON.stringify(payload);

  return new Promise((resolve, reject) => {
    const req = https.request(
      {
        method: "POST",
        host: BREVO_API_HOST,
        path: BREVO_API_PATH,
        headers: {
          accept: "application/json",
          "api-key": sanitizeHeaderValue(apiKey),
          "content-type": "application/json",
          "content-length": Buffer.byteLength(body),
        },
        timeout: Number(process.env.BREVO_TIMEOUT_MS || 10000),
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          const status = res.statusCode || 0;
          const contentType = String(res.headers?.["content-type"] || "");

          let parsedBody = data;
          if (contentType.includes("application/json")) {
            try {
              parsedBody = data ? JSON.parse(data) : undefined;
            } catch {
              parsedBody = data;
            }
          }

          if (status < 200 || status >= 300) {
            return reject({
              status,
              statusText: res.statusMessage,
              body: parsedBody,
            });
          }

          return resolve({ status, body: parsedBody });
        });
      }
    );

    req.on("timeout", () => {
      req.destroy(new Error("Brevo request timed out"));
    });

    req.on("error", (err) => {
      reject(err);
    });

    req.write(body);
    req.end();
  });
};

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  const apiKey = process.env.BREVO_API_KEY || process.env.SMTP_PASS;

  if (!apiKey) {
    console.warn(
      "Email delivery is not configured (missing BREVO_API_KEY/SMTP_PASS). Logging email payload instead."
    );
    console.log({ to, subject, text, html, attachments });
    return;
  }

  const fromParsed = parseEmailFrom(process.env.EMAIL_FROM);
  const fallbackSenderEmail = sanitizeEmail(process.env.BREVO_SENDER_EMAIL);
  const sender =
    fromParsed ||
    (fallbackSenderEmail
      ? {
          email: fallbackSenderEmail,
          name: process.env.BREVO_SENDER_NAME ? String(process.env.BREVO_SENDER_NAME) : undefined,
        }
      : null);

  if (!sender?.email || !isValidEmail(sender.email)) {
    console.warn(
      "Email delivery is not configured (invalid sender). Check EMAIL_FROM/BREVO_SENDER_EMAIL. Logging email payload instead."
    );
    console.warn("Resolved sender:", sender);
    console.warn("Raw EMAIL_FROM:", process.env.EMAIL_FROM);
    console.log({ to, subject, text, html, attachments });
    return;
  }

  const recipients = normalizeRecipients(to);
  if (recipients.length === 0) {
    console.warn("Email send skipped (missing recipient 'to').");
    return;
  }

  const brevoAttachments = await toBrevoAttachments(attachments);

  const payload = {
    sender,
    to: recipients,
    subject: subject ? String(subject) : "(no subject)",
    textContent: text ? String(text) : undefined,
    htmlContent: html ? String(html) : undefined,
    attachment: brevoAttachments,
  };

  try {
    const resp = await brevoRequest({ apiKey, payload });
    console.log("Brevo email sent:", resp?.body);
  } catch (e) {
    console.error("Brevo send email failed:", e);
  }
};

export default sendEmail;
