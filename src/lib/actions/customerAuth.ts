"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/hash";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kavitas-kitchen-super-secret-key-12345"
);

/**
 * Handles customer registration.
 */
export async function customerSignup(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const password = formData.get("password") as string;

  if (!name || !email || !password) {
    return { error: "Please enter all required fields (Name, Email, Password)." };
  }

  try {
    const existing = await db.user.findUnique({
      where: { email },
    });

    if (existing) {
      return { error: "An account with this email already exists." };
    }

    const passwordHash = hashPassword(password);
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code

    const user = await db.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        passwordHash,
        isVerified: false,
        verificationToken,
      },
    });

    // Simulated Email Notification
    console.log(`[SIMULATED EMAIL] To: ${email} | Subject: Verify Your Email - Kavita's Kitchen | Content: Your code is ${verificationToken}`);

    // Create a notification record for the user
    await db.notification.create({
      data: {
        userId: user.id,
        title: "Welcome to Kavita's Kitchen!",
        message: `Please verify your email using the code: ${verificationToken}`,
        type: "CUSTOMER_ORDER",
      },
    });

    return { success: true, email: user.email };
  } catch (error: any) {
    console.error("Signup error:", error);
    return { error: "Failed to create account. Please try again." };
  }
}

/**
 * Verifies email using verification code.
 */
export async function verifyCustomerEmail(email: string, code: string) {
  if (!email || !code) {
    return { error: "Verification details missing." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User not found." };
    }

    if (user.verificationToken !== code) {
      return { error: "Invalid verification code." };
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
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
      maxAge: 60 * 60 * 24 * 30, // 30 days in seconds
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  } catch (error) {
    console.error("Verification error:", error);
    return { error: "Email verification failed." };
  }
}

/**
 * Handles customer login.
 */
export async function customerLogin(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter both email and password." };
  }

  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { error: "Invalid email or password." };
    }

    if (!user.isVerified) {
      return { 
        error: "Please verify your email before logging in.", 
        requiresVerification: true,
        email: user.email 
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
