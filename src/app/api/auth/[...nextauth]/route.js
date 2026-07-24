import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import pool from "@/lib/db";

export const authOptions = {
  pages: {
    signIn: "/front/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "email@exemplo.com",
        },

        senha: {
          label: "Senha",
          type: "password",
        },
      },

      async authorize(credentials) {
        try {
          console.log("LOGIN:", credentials.email);

          if (!credentials?.email || !credentials?.senha) {
            return null;
          }

          // Busca usuário no banco
          const resultado = await pool.query(
            `
            SELECT 
              codusuario,
              nome,
              email,
              senha,
              tipousuario,
              ativo
            FROM Usuario
            WHERE email = $1
            LIMIT 1
            `,
            [credentials.email],
          );

          const usuario = resultado.rows[0];
          console.log("USUARIO DO BANCO:", usuario);

          if (!usuario) {
            console.log("Usuário não encontrado");
            return null;
          }

          if (!usuario.ativo) {
            console.log("Usuário desativado");
            return null;
          }

          // Compara senha digitada com hash do banco
          const senhaValida = await bcrypt.compare(
            credentials.senha,
            usuario.senha,
          );

          console.log("SENHA VALIDA:", senhaValida);

          if (!senhaValida) {
            console.log("Senha incorreta");
            return null;
          }

          console.log("RETORNANDO USUARIO:", {
            id: usuario.codusuario,
            nome: usuario.nome,
            email: usuario.email,
            tipousuario: usuario.tipousuario,
          });
          // O que retorna aqui vai para o JWT
          return {
            id: usuario.codusuario,
            nome: usuario.nome,
            email: usuario.email,
            tipousuario: usuario.tipousuario,
          };
        } catch (error) {
          console.error("Erro no login:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.nome = user.nome;
        token.email = user.email;
        token.tipousuario = user.tipousuario;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.nome = token.nome;
        session.user.email = token.email;
        session.user.tipousuario = token.tipousuario;
      }

      return session;
    },
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
