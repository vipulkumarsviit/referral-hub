import nodemailer from 'nodemailer';
type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

async function getTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) return null;

  try {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } catch {
    return null;
  }
}

export async function sendEmail(payload: EmailPayload) {
  const transport = await getTransport();
  if (!transport) return { skipped: true } as const;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "no-reply@referralhub.com";

  await transport.sendMail({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  });

  return { skipped: false } as const;
}
