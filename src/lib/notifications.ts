import nodemailer from "nodemailer";

/**
 * Sends a verification or transactional email.
 * Supports Resend, custom SMTP (Nodemailer), and auto-generating an Ethereal Email test account as a fallback.
 */
export async function sendEmail({ to, subject, html, text }: { to: string; subject: string; html: string; text: string }) {
  // 1. Try Resend if configured
  if (process.env.RESEND_API_KEY) {
    try {
      const from = process.env.EMAIL_FROM || "Kavita's Kitchen <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from,
          to,
          subject,
          html,
          text,
        }),
      });
      if (res.ok) {
        console.log(`[RESEND EMAIL] Successfully sent email to ${to}`);
        return { success: true, provider: "resend" };
      } else {
        const errorText = await res.text();
        console.error(`[RESEND EMAIL ERROR] Failed to send: ${errorText}`);
      }
    } catch (err) {
      console.error("[RESEND EMAIL EXCEPTION]", err);
    }
  }

  // 2. Try SMTP if configured
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const port = parseInt(process.env.SMTP_PORT || "587");
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM || `"Kavita's Kitchen" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text,
        html,
      });

      console.log(`[SMTP EMAIL] Successfully sent email to ${to}. MessageId: ${info.messageId}`);
      return { success: true, provider: "smtp" };
    } catch (err) {
      console.error("[SMTP EMAIL EXCEPTION]", err);
    }
  }

  // 3. Fallback to Ethereal mock email for testing/development
  try {
    console.log(`[EMAIL FALLBACK] Creating Ethereal Test Account...`);
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    const info = await transporter.sendMail({
      from: `"Kavita's Kitchen" <no-reply@kavitaskitchen.com>`,
      to,
      subject,
      text,
      html,
    });

    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[SIMULATED EMAIL] To: ${to} | Subject: ${subject}`);
    console.log(`[SIMULATED EMAIL] Preview URL: ${previewUrl}`);
    return { success: true, provider: "ethereal", previewUrl };
  } catch (err) {
    console.error("[ETHEREAL EMAIL EXCEPTION]", err);
  }

  return { success: false };
}

/**
 * Sends an SMS message / OTP code.
 * Supports Twilio, MSG91, Fast2SMS, and logs a simulated console message as a fallback.
 */
export async function sendSMS({ to, message }: { to: string; message: string }) {
  let formattedTo = to.trim();
  if (!formattedTo.startsWith("+")) {
    if (formattedTo.length === 10) {
      formattedTo = `+91${formattedTo}`;
    } else {
      formattedTo = `+${formattedTo}`;
    }
  }

  // 1. Try Twilio if configured
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const basicAuth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const res = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${basicAuth}`,
          },
          body: new URLSearchParams({
            To: formattedTo,
            From: process.env.TWILIO_PHONE_NUMBER,
            Body: message,
          }),
        }
      );

      if (res.ok) {
        console.log(`[TWILIO SMS] Successfully sent SMS to ${formattedTo}`);
        return { success: true, provider: "twilio" };
      } else {
        const errorText = await res.text();
        console.error(`[TWILIO SMS ERROR] Failed to send: ${errorText}`);
      }
    } catch (err) {
      console.error("[TWILIO SMS EXCEPTION]", err);
    }
  }

  // 2. Try MSG91 if configured
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const cleanPhone = formattedTo.replace("+", "");
      const res = await fetch("https://api.msg91.com/api/v5/otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "authkey": process.env.MSG91_AUTH_KEY,
        },
        body: JSON.stringify({
          template_id: process.env.MSG91_TEMPLATE_ID,
          mobile: cleanPhone,
          otp: message.match(/\d+/)?.[0] || "",
        }),
      });

      if (res.ok) {
        console.log(`[MSG91 SMS] Successfully sent OTP to ${cleanPhone}`);
        return { success: true, provider: "msg91" };
      } else {
        const errorText = await res.text();
        console.error(`[MSG91 SMS ERROR] Failed to send: ${errorText}`);
      }
    } catch (err) {
      console.error("[MSG91 SMS EXCEPTION]", err);
    }
  }

  // 3. Try Fast2SMS if configured
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const cleanPhone = formattedTo.replace("+91", "").replace("+", "");
      const res = await fetch(
        `https://www.fast2sms.com/dev/bulkV2?authorization=${process.env.FAST2SMS_API_KEY}&variables_values=${encodeURIComponent(message)}&route=otp&numbers=${cleanPhone}`,
        { method: "GET" }
      );
      if (res.ok) {
        console.log(`[FAST2SMS] Successfully sent OTP to ${cleanPhone}`);
        return { success: true, provider: "fast2sms" };
      } else {
        const errorText = await res.text();
        console.error(`[FAST2SMS ERROR] Failed to send: ${errorText}`);
      }
    } catch (err) {
      console.error("[FAST2SMS EXCEPTION]", err);
    }
  }

  // Fallback to console simulation
  console.log(`[SIMULATED SMS] To: ${formattedTo} | Content: ${message}`);
  return { success: true, provider: "simulated" };
}
