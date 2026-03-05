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

        // FIX: Return image juga biar kebaca session
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.image, 
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
        token.picture = user.image; // Mapping image ke picture
        
        // --- TAMBAHAN BARU ---
        token.divisi = user.divisi;         
        token.nomorInduk = user.nomorInduk; 
      }

      // 2. FITUR PENTING: Update token saat client manggil update() (Misal ganti foto profil)
      if (trigger === "update" && session) {
        token.name = session.user.name;
        token.picture = session.user.image;
        // Kalau divisi bisa diupdate dari client, masukin sini juga (tapi kan ini dilock admin, jadi aman)
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.role = token.role;
        session.user.id = token.id;
        session.user.image = token.picture; // Pastikan image masuk session
        session.user.name = token.name;
        
        // --- TAMBAHAN BARU ---
        session.user.divisi = token.divisi;         
        session.user.nomorInduk = token.nomorInduk; 
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };