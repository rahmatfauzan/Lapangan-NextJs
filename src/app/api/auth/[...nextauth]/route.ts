import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const authoptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  secret: "111",
  providers: [
    CredentialsProvider({
      name: "Credentials",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "Masukkan email" },
        password: {
          label: "Password",
          type: "password",
          placeholder: "Masukkan password",
        },
      },
      async authorize(credentials) {
        const { email, password } = credentials as {
          email: string;
          password: string;
        };

        if (email === "admin@example.com" && password === "password") {
          const user: any = {
            id: 1,
            name: "Admin",
            email: "admin@example.com",
            role: "admin",
          };
          return user;
        } else {
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, account, user }: any) {
      if (account?.provider === "credentials") {
        token.email = user.email;
        token.fullname = user.name; // Make sure this matches the property from the user
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if ("email" in token) {
        session.user.email = token.email;
      }
      if ("fullname" in token) {
        session.user.fullname = token.fullname;
      }
      if ("role" in token) {
        session.user.role = token.role;
      }
      return session; // Add the return statement
    },
  },
};

const handler = NextAuth(authoptions);
export { handler as GET, handler as POST };
