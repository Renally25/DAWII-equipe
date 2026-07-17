import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import pool from "@/lib/db";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        const result = await pool.query(
          "SELECT codusuario, nome, email, senha, tipousuario FROM usuario WHERE email = $1",
          [credentials.email]
        );
        const usuario = result.rows[0];

        if (usuario && usuario.senha === credentials.password) {
          return {
            id: usuario.codusuario, 
            name: usuario.nome,
            email: usuario.email,
            tipousuario: usuario.tipousuario, 
          };
        }
        return null;
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tipousuario = user.tipousuario; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.tipousuario = token.tipousuario; 
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
