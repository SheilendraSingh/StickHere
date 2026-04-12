import nodemailer from "nodemailer";

const requiredEmailEnv = ["EMAIL_HOST", "EMAIL_PORT", "EMAIL_USER", "EMAIL_PASS"];

const isTruthy = (value = "") => {
  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
};

export const getMissingEmailEnv = () =>
  requiredEmailEnv.filter((key) => !process.env[key]);

export const isEmailConfigured = () => getMissingEmailEnv().length === 0;

export const assertEmailConfigured = () => {
  const missing = getMissingEmailEnv();
  if (missing.length === 0) return;
  throw new Error(
    `SMTP is not configured. Missing env vars: ${missing.join(", ")}`,
  );
};

const buildTransporter = () => {
  assertEmailConfigured();

  const port = Number(process.env.EMAIL_PORT || 587);
  const secure = isTruthy(process.env.EMAIL_SECURE) || port === 465;

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = buildTransporter();
  }
  return transporter;
};

export const sendEmail = async ({
  to,
  subject,
  text = "",
  html = "",
  from = process.env.EMAIL_FROM || process.env.EMAIL_USER,
} = {}) => {
  if (!to || !subject) {
    throw new Error("Email `to` and `subject` are required");
  }

  const mail = await getTransporter().sendMail({
    from,
    to,
    subject,
    text,
    html,
  });

  return {
    messageId: mail.messageId,
    accepted: Array.isArray(mail.accepted) ? mail.accepted : [],
    rejected: Array.isArray(mail.rejected) ? mail.rejected : [],
    response: mail.response || "",
  };
};

export const sendTestEmailService = async ({
  to,
  requestedBy = "StickHere User",
} = {}) => {
  const now = new Date().toISOString();
  const subject = "StickHere SMTP Test";
  const text = `SMTP test email from StickHere.\nRequested by: ${requestedBy}\nTime: ${now}`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.5;">
      <h2>StickHere SMTP Test</h2>
      <p>SMTP configuration is working.</p>
      <p><strong>Requested by:</strong> ${requestedBy}</p>
      <p><strong>Time:</strong> ${now}</p>
    </div>
  `;

  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

