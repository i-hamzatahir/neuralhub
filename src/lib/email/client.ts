interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail({ to, subject, html, text }: SendEmailOptions) {
  const resendKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "NeuralHub <onboarding@resend.dev>";

  if (resendKey) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${error}`);
    }
    return;
  }

  // Dev fallback — log to console when no email provider configured
  console.log("\n📧 Email (dev mode — no RESEND_API_KEY set)");
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body:\n${text ?? html}\n`);
}

export function buildVerificationEmail(name: string, url: string) {
  return {
    subject: "Verify your NeuralHub email",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #09090b;">Welcome to NeuralHub, ${name}!</h2>
        <p style="color: #71717a; line-height: 1.6;">
          Please verify your email address to complete your registration.
        </p>
        <a href="${url}" style="display: inline-block; background: #5e6ad2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Verify Email
        </a>
        <p style="color: #a1a1aa; font-size: 13px;">
          This link expires in 24 hours. If you didn't create an account, ignore this email.
        </p>
      </div>
    `,
    text: `Welcome to NeuralHub, ${name}! Verify your email: ${url}`,
  };
}

export function buildPasswordResetEmail(name: string, url: string) {
  return {
    subject: "Reset your NeuralHub password",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #09090b;">Password Reset</h2>
        <p style="color: #71717a; line-height: 1.6;">
          Hi ${name}, we received a request to reset your password.
        </p>
        <a href="${url}" style="display: inline-block; background: #5e6ad2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Reset Password
        </a>
        <p style="color: #a1a1aa; font-size: 13px;">
          This link expires in 1 hour. If you didn't request this, ignore this email.
        </p>
      </div>
    `,
    text: `Reset your NeuralHub password: ${url}`,
  };
}

export function buildNewsletterConfirmEmail(name: string, url: string) {
  return {
    subject: "Confirm your NeuralHub newsletter subscription",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #09090b;">Confirm your subscription</h2>
        <p style="color: #71717a; line-height: 1.6;">
          Hi ${name}, thanks for subscribing to NeuralHub. Confirm your email to start receiving curated AI and tech articles.
        </p>
        <a href="${url}" style="display: inline-block; background: #5e6ad2; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500; margin: 16px 0;">
          Confirm subscription
        </a>
        <p style="color: #a1a1aa; font-size: 13px;">
          This link expires in 48 hours. If you didn't subscribe, ignore this email.
        </p>
      </div>
    `,
    text: `Confirm your NeuralHub newsletter subscription: ${url}`,
  };
}

export function buildNewsletterWelcomeEmail(name: string, unsubscribeUrl: string) {
  return {
    subject: "You're subscribed to NeuralHub",
    html: `
      <div style="font-family: Inter, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #09090b;">Welcome aboard, ${name}!</h2>
        <p style="color: #71717a; line-height: 1.6;">
          You're confirmed. We'll send curated articles on AI, data science, and technology to your inbox.
        </p>
        <p style="color: #a1a1aa; font-size: 13px;">
          <a href="${unsubscribeUrl}" style="color: #71717a;">Unsubscribe</a> anytime.
        </p>
      </div>
    `,
    text: `Welcome to the NeuralHub newsletter. Unsubscribe: ${unsubscribeUrl}`,
  };
}
