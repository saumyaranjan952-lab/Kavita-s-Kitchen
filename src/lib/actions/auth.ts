"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/hash";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "kavitas-kitchen-super-secret-key-12345"
);

/**
 * Handles admin login action.
 */
export async function login(prevState: any, formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Please enter both username and password." };
  }

  try {
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return { error: "Invalid username or password." };
    }

    // Generate JWT Session Token
    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    // Store token securely in an HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24, // 1 day in seconds
      path: "/",
      sameSite: "lax",
    });

    // Write audit log
    await db.activityLog.create({
      data: {
        adminName: user.username,
        action: "LOGIN",
        details: "Logged into the admin dashboard successfully.",
      },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Login server action error:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

/**
 * Handles admin logout.
 */
export async function logout() {
  try {
    const session = await checkSession();
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");

    if (session) {
      await db.activityLog.create({
        data: {
          adminName: session.username,
          action: "LOGOUT",
          details: "Logged out from the admin dashboard.",
        },
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}

/**
 * Validates the admin JWT token.
 */
export async function checkSession() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      username: payload.username as string,
      role: payload.role as string,
    };
  } catch (error) {
    return null;
  }
}
