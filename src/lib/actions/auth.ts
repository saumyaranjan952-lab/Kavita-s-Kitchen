"use server";

import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, hashPassword } from "@/lib/hash";

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
    const user = await db.admin.findUnique({
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

/**
 * Updates the admin credentials (username and/or password).
 */
export async function updateAdminCredentials(prevState: any, formData: FormData) {
  try {
    const session = await checkSession();
    if (!session) {
      return { error: "Unauthorized. Please log in first." };
    }

    const newUsername = formData.get("newUsername") as string;
    const currentPassword = formData.get("currentPassword") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!newUsername || newUsername.trim() === "") {
      return { error: "Username cannot be empty." };
    }

    // Find the current user
    const user = await db.admin.findUnique({
      where: { username: session.username },
    });

    if (!user) {
      return { error: "Admin user not found in database." };
    }

    const updateData: { username?: string; passwordHash?: string } = {};

    // If changing username
    if (newUsername !== user.username) {
      // Check if new username is already taken
      const existingUser = await db.admin.findUnique({
        where: { username: newUsername },
      });
      if (existingUser) {
        return { error: "Username already taken." };
      }
      updateData.username = newUsername;
    }

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return { error: "Please enter your current password to set a new one." };
      }
      const isPasswordValid = verifyPassword(currentPassword, user.passwordHash);
      if (!isPasswordValid) {
        return { error: "Current password is incorrect." };
      }
      if (newPassword.length < 6) {
        return { error: "New password must be at least 6 characters long." };
      }
      updateData.passwordHash = hashPassword(newPassword);
    }

    if (Object.keys(updateData).length === 0) {
      return { error: "No changes specified." };
    }

    // Update DB
    await db.admin.update({
      where: { id: user.id },
      data: updateData,
    });

    // Write audit log
    await db.activityLog.create({
      data: {
        adminName: session.username,
        action: "UPDATE_CREDENTIALS",
        details: `Updated credentials. Username changed: ${newUsername !== user.username}. Password changed: ${!!newPassword}.`,
      },
    });

    // If username or password changed, clear session cookie so they log in again
    const cookieStore = await cookies();
    cookieStore.delete("admin_session");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating admin credentials:", error);
    return { error: "An unexpected error occurred. Please try again." };
  }
}

