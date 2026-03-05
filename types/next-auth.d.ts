import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      image?: string | null; 
      divisi?: string | null;
      nomorInduk?: string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: string;
    image?: string | null; 
    divisi?: string | null;
    nomorInduk?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    picture?: string | null; 
    divisi?: string | null;
    nomorInduk?: string | null;
  }
}