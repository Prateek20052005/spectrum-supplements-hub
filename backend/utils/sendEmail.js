let cachedTransporter;
let cachedSmtpKey;

const getSmtpKey = (env) => {
  return [
    env.SMTP_HOST,
    env.SMTP_PORT,
    env.SMTP_USER,
    env.SMTP_PASS,
    env.SMTP_SECURE,
  ].join("|");
};

const getTransporter = async () => {
  let nodemailer;
  try {
    const imported = await import("nodemailer");
    nodemailer = imported?.default || imported;
  } catch {
    console.warn(
      "Email delivery is not configured (missing optional dependency 'nodemailer')."
    );
    return null;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) return null;

  const key = getSmtpKey(process.env);
  if (cachedTransporter && cachedSmtpKey === key) return cachedTransporter;

  cachedSmtpKey = key;
  cachedTransporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    connectionTimeout: Number(process.env.SMTP_CONNECTION_TIMEOUT_MS || 7000),
    socketTimeout: Number(process.env.SMTP_SOCKET_TIMEOUT_MS || 7000),
    greetingTimeout: Number(process.env.SMTP_GREETING_TIMEOUT_MS || 7000),
  });

  return cachedTransporter;
};

const sendEmail = async ({ to, subject, text, html, attachments }) => {
  let nodemailer;
  try {
    const imported = await import("nodemailer");
    nodemailer = imported?.default || imported;
  } catch {
    console.warn(
      "Email delivery is not configured (missing optional dependency 'nodemailer')."
    );
    console.log({ to, subject, text, html, attachments });
    return;
  }

  const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_SECURE,
    EMAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn(
      "Email delivery is not configured (missing SMTP env vars). Logging email payload instead."
    );
    console.log({ to, subject, text, html, attachments });
    return;
  }

  const transporter = await getTransporter();
  if (!transporter) {
    console.warn(
      "Email delivery is not configured (missing nodemailer or SMTP env vars). Logging email payload instead."
    );
    console.log({ to, subject, text, html, attachments });
    return;
  }

  const shouldVerify = String(process.env.SMTP_VERIFY || "false").toLowerCase() === "true";
  if (shouldVerify) {
    try {
      await transporter.verify();
    } catch (e) {
      console.error("SMTP transporter verify failed:", {
        message: e?.message,
        code: e?.code,
        response: e?.response,
      });
      return;
    }
  }

  try {
    await transporter.sendMail({
      from: EMAIL_FROM || SMTP_USER,
      to,
      subject,
      text,
      html,
      attachments: Array.isArray(attachments) ? attachments : undefined,
    });
  } catch (e) {
    console.error("SMTP sendMail failed:", {
      message: e?.message,
      code: e?.code,
      response: e?.response,
    });
    return;
  }
};

export default sendEmail;
