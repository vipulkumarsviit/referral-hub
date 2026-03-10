const brand = {
  name: "ReferralHub",
  primary: "#4F6EF7",
  dark: "#1A1A2E",
  background: "#F8F7F4",
};

function layout({
  title,
  preview,
  body,
  logoUrl,
}: {
  title: string;
  preview: string;
  body: string;
  logoUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:${brand.background};font-family:'Plus Jakarta Sans',Arial,sans-serif;color:${brand.dark};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
    ${preview}
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${brand.background};padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:20px;box-shadow:0 20px 60px rgba(26,26,46,0.08);overflow:hidden;">
          <tr>
            <td style="padding:24px 28px;border-bottom:1px solid rgba(26,26,46,0.08);">
              <div style="display:flex;align-items:center;gap:12px;">
                <div style="width:40px;height:40px;border-radius:12px;background:${brand.dark};display:inline-flex;align-items:center;justify-content:center;overflow:hidden;">
                  <img src="${logoUrl}" alt="${brand.name} logo" width="40" height="40" style="display:block;width:40px;height:40px;object-fit:cover;" />
                </div>
                <div>
                  <div style="font-size:16px;font-weight:700;letter-spacing:-0.02em;">${brand.name}</div>
                  <div style="font-size:12px;color:rgba(26,26,46,0.6);">Referrals, verified.</div>
                </div>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 28px;border-top:1px solid rgba(26,26,46,0.08);background:#fbfaf8;">
              <div style="font-size:12px;color:rgba(26,26,46,0.6);line-height:1.6;">
                You’re receiving this email because you have an account with ${brand.name}.
                <br />
                Need help? Reply to this email.
              </div>
            </td>
          </tr>
        </table>
        <div style="font-size:11px;color:rgba(26,26,46,0.5);margin-top:16px;">
          © ${new Date().getFullYear()} ${brand.name}
        </div>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function welcomeEmail({
  name,
  dashboardUrl,
  logoUrl,
}: {
  name?: string;
  dashboardUrl: string;
  logoUrl: string;
}) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;">Welcome${name ? `, ${name}` : ""}.</h2>
    <p style="margin:0 0 16px;color:rgba(26,26,46,0.7);line-height:1.6;">
      Your account is ready. Start exploring verified referral opportunities and keep track of your applications.
    </p>
    <a href="${dashboardUrl}" style="display:inline-block;background:${brand.primary};color:#fff;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:12px;">Go to dashboard</a>
  `;

  return {
    subject: "Welcome to ReferralHub",
    html: layout({
      title: "Welcome to ReferralHub",
      preview: "Your account is ready.",
      body,
      logoUrl,
    }),
    text: `Welcome to ReferralHub. Go to your dashboard: ${dashboardUrl}`,
  };
}

export function resetPasswordEmail({
  resetUrl,
  logoUrl,
}: {
  resetUrl: string;
  logoUrl: string;
}) {
  const body = `
    <h2 style="margin:0 0 8px;font-size:22px;">Reset your password</h2>
    <p style="margin:0 0 16px;color:rgba(26,26,46,0.7);line-height:1.6;">
      Use the button below to reset your password. This link expires in 1 hour.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background:${brand.primary};color:#fff;text-decoration:none;font-weight:600;padding:12px 18px;border-radius:12px;">Reset password</a>
    <p style="margin:16px 0 0;color:rgba(26,26,46,0.6);font-size:12px;">If you didn’t request this, you can safely ignore this email.</p>
  `;

  return {
    subject: "Reset your ReferralHub password",
    html: layout({
      title: "Reset your ReferralHub password",
      preview: "Reset your password securely.",
      body,
      logoUrl,
    }),
    text: `Reset your password: ${resetUrl}`,
  };
}
