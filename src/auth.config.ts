import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const { pathname } = nextUrl;
      const isOnDashboard = pathname.startsWith("/dashboard");
      
      if (isOnDashboard) {
        if (!isLoggedIn) return false;

        // Granular Role-Based Access Control
        if (pathname.startsWith("/dashboard/reports") || 
            pathname.startsWith("/dashboard/inventory") || 
            pathname.startsWith("/dashboard/menu")) {
          return role === "ADMIN" || role === "MANAGER";
        }

        if (pathname.startsWith("/dashboard/users")) {
          return role === "ADMIN";
        }

        if (pathname.startsWith("/dashboard/pos")) {
          return role === "ADMIN" || role === "MANAGER" || role === "CASHIER";
        }

        if (pathname.startsWith("/dashboard/kitchen")) {
          return role === "ADMIN" || role === "MANAGER" || role === "KITCHEN_STAFF";
        }

        return true; 
      } else if (isLoggedIn) {
        if (pathname === "/login") {
            return Response.redirect(new URL("/dashboard", nextUrl));
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
