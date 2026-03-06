import NextAuth, { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        // REVISI: Pastikan divisi dan nomorInduk di-return di sini biar bisa ditangkap JWT
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image,
          divisi: user.divisi,      // <-- WAJIB ADA MEK
          nomorInduk: user.nomorInduk // <-- WAJIB ADA MEK
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      // 1. Update token pas user pertama kali login
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.picture = user.image; 
        
        // --- SEKARANG INI PASTI ADA ISINYA ---
        token.divisi = user.divisi;         
        token.nomorInduk = user.nomorInduk; 
      }

      // 2. FITUR PENTING: Update token saat client manggil update()
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.picture = session.user.image;
        if (session.user.divisi) token.divisi = session.user.divisi;
        if (session.user.nomorInduk) token.nomorInduk = session.user.nomorInduk;
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.image = token.picture; 
        session.user.name = token.name;
        
        // --- OPER KE SESSION CLIENT ---
        session.user.divisi = token.divisi;         
        session.user.nomorInduk = token.nomorInduk; 
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };