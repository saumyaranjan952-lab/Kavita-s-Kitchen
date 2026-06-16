"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/hash";
import { sendEmail, sendSMS } from "@/lib/notifications";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kavitas-kitchen-super-secret-key-12345"
);

/**
 * Detects if the identifier is an Email or a 10-digit Indian Mobile Number.
 * Normalizes the input (stripping country codes, whitespace, etc.).
 */
export async function detectIdentifierType(identifier: string): 
  Promise<
    | { type: "email"; normalized: string }
    | { type: "mobile"; normalized: string }
    | { type: "invalid"; error: string }
  > {
  
  const trimmed = identifier.trim();
  
  // Normalize phone number (strip whitespace, dashes, parens)
  let cleanPhone = trimmed.replace(/[\s\-\(\)]/g, "");
  
  // Strip optional leading +91, 91, or 0
  if (cleanPhone.startsWith("+91")) {
    cleanPhone = cleanPhone.substring(3);
  } else if (cleanPhone.startsWith("91") && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  } else if (cleanPhone.startsWith("0") && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Treat as email if it contains any alphabetic characters or '@'
  const hasLettersOrAt = /[a-zA-Z]/.test(trimmed) || trimmed.includes("@");

  if (!hasLettersOrAt && trimmed.length > 0) {
    // Validate as 10-digit Indian mobile number
    const isNumeric = /^\d+$/.test(cleanPhone);
    const isValidIndianMobile = isNumeric && /^[6-9]\d{9}$/.test(cleanPhone);
    if (isValidIndianMobile) {
      return { type: "mobile", normalized: cleanPhone };
    }
    return { type: "invalid", error: "❌ Invalid Mobile Number" };
  }

  // Validate as email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return { type: "email", normalized: trimmed.toLowerCase() };
  }
  return { type: "invalid", error: "❌ Invalid Email Address" };
}

/**
 * Handles customer registration.
 */
/**
 * Handles customer registration.
 */
export async function customerSignup(prevState: any, formData: FormData) {
  const name = (formData.get("name") as string || "").trim();
  const email = (formData.get("email") as string || "").trim();
  const phone = (formData.get("phone") as string || "").trim();
  const password = formData.get("password") as string;

  if (!name || !email || !phone || !password) {
    return { error: "Please enter all required fields (Name, Email, Mobile Number, Password)." };
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "❌ Invalid Email Address" };
  }

  const phoneDetection = await detectIdentifierType(phone);
  if (phoneDetection.type !== "mobile") {
    return { error: "❌ Invalid Mobile Number" };
  }
  const normalizedPhone = phoneDetection.normalized;

  try {
    // Check if an account already exists and is fully verified
    const existingEmailUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (existingEmailUser && existingEmailUser.emailVerified && existingEmailUser.phoneVerified) {
      return { error: "An account with this email already exists." };
    }

    const existingPhoneUser = await db.user.findFirst({
      where: { phone: normalizedPhone },
    });
    if (existingPhoneUser && existingPhoneUser.emailVerified && existingPhoneUser.phoneVerified) {
      return { error: "An account with this phone number already exists." };
    }

    // Reuse existing unverified user, or create new
    const passwordHash = hashPassword(password);
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
    const emailCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    let user;
    if (existingEmailUser) {
      user = await db.user.update({
        where: { id: existingEmailUser.id },
        data: {
          name,
          phone: normalizedPhone,
          passwordHash,
          emailCode,
          emailCodeExpires,
          verificationAttempts: 0,
          emailVerified: false,
          phoneVerified: false,
          isVerified: false,
        },
      });
    } else if (existingPhoneUser) {
      user = await db.user.update({
        where: { id: existingPhoneUser.id },
        data: {
          name,
          email: email.toLowerCase(),
          passwordHash,
          emailCode,
          emailCodeExpires,
          verificationAttempts: 0,
          emailVerified: false,
          phoneVerified: false,
          isVerified: false,
        },
      });
    } else {
      user = await db.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          phone: normalizedPhone,
          passwordHash,
          emailCode,
          emailCodeExpires,
          verificationAttempts: 0,
          emailVerified: false,
          phoneVerified: false,
          isVerified: false,
        },
      });
    }

    // Send actual Email Notification
    await sendEmail({
      to: user.email,
      subject: "Verify Your Kavita's Kitchen Account",
      text: `Welcome to Kavita's Kitchen!\n\nYour verification code is: ${emailCode}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #0f3d2e; text-align: center;">Welcome to Kavita's Kitchen!</h2>
          <p>Hi ${name},</p>
          <p>Thank you for signing up. Please verify your account using the 6-digit verification code below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d4af37; background: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #d4af37;">${emailCode}</span>
          </div>
          <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
        </div>
      `,
    });

    // Create a notification record for the user
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Verify Your Kavita's Kitchen Account",
        message: `Welcome to Kavita's Kitchen! Your verification code is: ${emailCode}`,
        type: "CUSTOMER_ORDER",
      },
    });

    return { success: true, email: user.email, step: "email" };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

/**
 * Verifies email using verification code.
 */
export async function verifyCustomerEmailCode(email: string, code: string) {
  if (!email || !code) {
    return { error: "Verification details missing." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.verificationAttempts >= 5) {
      return { error: "❌ Too Many Attempts" };
    }

    if (!user.emailCodeExpires || user.emailCodeExpires < new Date()) {
      return { error: "❌ OTP Expired" };
    }

    if (user.emailCode !== code) {
      await db.user.update({
        where: { id: user.id },
        data: { verificationAttempts: { increment: 1 } },
      });
      return { error: "❌ Invalid Verification Code" };
    }

    // Generate phone OTP
    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const phoneCodeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailCode: null,
        emailCodeExpires: null,
        phoneCode,
        phoneCodeExpires,
        verificationAttempts: 0, // Reset attempts for phone step
      },
    });

    // Send actual Mobile OTP SMS
    if (user.phone) {
      await sendSMS({
        to: user.phone,
        message: `Your Kavita's Kitchen mobile verification OTP is ${phoneCode}. Valid for 10 minutes.`,
      });
    }

    // Create a notification record
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Mobile Verification OTP Sent",
        message: `Your Mobile OTP code is: ${phoneCode}`,
        type: "CUSTOMER_ORDER",
      },
    });

    return { success: true, step: "mobile" };
  } catch (error) {
    console.error("Email verification error:", error);
    return { error: "Email verification failed. Please try again." };
  }
}

/**
 * Backward compatibility wrapper
 */
export async function verifyCustomerEmail(email: string, code: string) {
  return verifyCustomerEmailCode(email, code);
}

/**
 * Verifies mobile number using OTP.
 */
export async function verifyCustomerPhoneOTP(email: string, otp: string) {
  if (!email || !otp) {
    return { error: "Verification details missing." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: "User not found." };
    }

    if (!user.emailVerified) {
      return { error: "Please verify your email first." };
    }

    if (user.verificationAttempts >= 5) {
      return { error: "❌ Too Many Attempts" };
    }

    if (!user.phoneCodeExpires || user.phoneCodeExpires < new Date()) {
      return { error: "❌ OTP Expired" };
    }

    if (user.phoneCode !== otp) {
      await db.user.update({
        where: { id: user.id },
        data: { verificationAttempts: { increment: 1 } },
      });
      return { error: "❌ Invalid OTP" };
    }

    // Success! Fully verify user account
    await db.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        isVerified: true, // both verified
        phoneCode: null,
        phoneCodeExpires: null,
        verificationAttempts: 0,
      },
    });

    // Automatically log user in after successful verification
    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Mobile verification error:", error);
    return { error: "Mobile verification failed. Please try again." };
  }
}

/**
 * Resends verification code/OTP.
 */
export async function resendVerificationCode(email: string, type: "email" | "mobile") {
  if (!email) {
    return { error: "Email address missing." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: "User not found." };
    }

    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    if (type === "email") {
      await db.user.update({
        where: { id: user.id },
        data: {
          emailCode: newCode,
          emailCodeExpires: expires,
          verificationAttempts: 0,
        },
      });

      await sendEmail({
        to: user.email,
        subject: "Verify Your Kavita's Kitchen Account",
        text: `Welcome to Kavita's Kitchen!\n\nYour verification code is: ${newCode}\n\nThis code expires in 10 minutes.`,
        html: `
          <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px;">
            <h2 style="color: #0f3d2e; text-align: center;">Kavita's Kitchen</h2>
            <p>Please verify your account using the new 6-digit verification code below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d4af37; background: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #d4af37;">${newCode}</span>
            </div>
            <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
          </div>
        `,
      });
    } else {
      if (!user.emailVerified) {
        return { error: "Please verify your email first." };
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          phoneCode: newCode,
          phoneCodeExpires: expires,
          verificationAttempts: 0,
        },
      });

      if (user.phone) {
        await sendSMS({
          to: user.phone,
          message: `Your Kavita's Kitchen mobile verification OTP is ${newCode}. Valid for 10 minutes.`,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Resend error:", error);
    return { error: "Failed to resend code. Please try again." };
  }
}

/**
 * Handles customer login.
 */
export async function customerLogin(prevState: any, formData: FormData) {
  const emailOrPhone = (formData.get("emailOrPhone") as string || formData.get("email") as string || "").trim();
  const password = formData.get("password") as string;

  if (!emailOrPhone || !password) {
    return { error: "Please enter both email/mobile and password." };
  }

  const detection = await detectIdentifierType(emailOrPhone);
  if (detection.type === "invalid") {
    return { error: detection.error };
  }

  try {
    let user;
    if (detection.type === "email") {
      user = await db.user.findUnique({
        where: { email: detection.normalized },
      });
      if (!user) {
        return { error: "❌ Invalid Email Address" };
      }
    } else {
      user = await db.user.findFirst({
        where: { phone: detection.normalized },
      });
      if (!user) {
        return { error: "❌ Invalid Mobile Number" };
      }
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return { error: "❌ Incorrect Password" };
    }

    // Require both email and mobile number verification
    if (!user.emailVerified || !user.phoneVerified) {
      // Re-trigger verification codes if missing/expired
      const emailCode = user.emailCode || Math.floor(100000 + Math.random() * 900000).toString();
      const emailCodeExpires = user.emailCodeExpires || new Date(Date.now() + 10 * 60 * 1000);
      
      let phoneCode = user.phoneCode;
      let phoneCodeExpires = user.phoneCodeExpires;
      if (user.emailVerified && !phoneCode) {
        phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
        phoneCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
      }

      await db.user.update({
        where: { id: user.id },
        data: {
          emailCode,
          emailCodeExpires,
          phoneCode,
          phoneCodeExpires,
        }
      });

      if (!user.emailVerified) {
        await sendEmail({
          to: user.email,
          subject: "Verify Your Kavita's Kitchen Account",
          text: `Welcome back!\n\nYour verification code is: ${emailCode}\n\nThis code expires in 10 minutes.`,
          html: `
            <div style="font-family: sans-serif; padding: 20px; max-width: 600px; margin: auto; border: 1px solid #eaeaea; border-radius: 10px;">
              <h2 style="color: #0f3d2e; text-align: center;">Kavita's Kitchen</h2>
              <p>Please verify your account using the 6-digit verification code below:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #d4af37; background: #f9f9f9; padding: 10px 20px; border-radius: 5px; border: 1px dashed #d4af37;">${emailCode}</span>
              </div>
              <p style="font-size: 12px; color: #666; text-align: center;">This code will expire in 10 minutes.</p>
            </div>
          `,
        });
      } else {
        if (user.phone) {
          await sendSMS({
            to: user.phone,
            message: `Your Kavita's Kitchen mobile verification OTP is ${phoneCode}. Valid for 10 minutes.`,
          });
        }
      }

      return { 
        error: "Please verify your email and mobile number before logging in.", 
        requiresVerification: true,
        email: user.email,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
      };
    }

    // Generate JWT Session Token
    const token = await new SignJWT({
      id: user.id,
      name: user.name,
      email: user.email,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("30d")
      .sign(JWT_SECRET);

    const cookieStore = await cookies();
    cookieStore.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login server action error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Handles customer logout.
 */
export async function customerLogout() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("session");
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}

/**
 * Validates the customer JWT token and returns user details.
 */
export async function checkCustomerSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    
    // Fetch full fresh profile details from DB
    const user = await db.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        createdAt: true,
      }
    });

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Triggers customer password recovery email.
 */
export async function forgotPassword(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  if (!email) {
    return { error: "Please enter your email address." };
  }

  try {
    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return { error: "No account found with this email." };
    }

    const resetToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour

    await db.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpires,
      },
    });

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
    console.log(`[SIMULATED EMAIL] Password Reset Link: ${resetLink}`);

    return { success: true, message: "A password reset link has been simulated in logs. Please proceed to reset." };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "Something went wrong. Please try again." };
  }
}

/**
 * Resets user password using reset token.
 */
export async function resetPassword(prevState: any, formData: FormData) {
  const token = formData.get("token") as string;
  const newPassword = formData.get("newPassword") as string;

  if (!token || !newPassword || newPassword.length < 6) {
    return { error: "Invalid token or password must be at least 6 characters." };
  }

  try {
    const user = await db.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() },
      },
    });

    if (!user) {
      return { error: "Reset token is invalid or has expired." };
    }

    const passwordHash = hashPassword(newPassword);

    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetToken: null,
        resetTokenExpires: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "Failed to reset password. Please try again." };
  }
}
