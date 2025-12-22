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

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: String(SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  try {
    await transporter.verify();
  } catch (e) {
    console.error("SMTP transporter verify failed:", {
      message: e?.message,
      code: e?.code,
      response: e?.response,
    });
    throw e;
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
    throw e;
  }
};

export default sendEmail;
