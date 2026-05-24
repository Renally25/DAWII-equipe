import { NextResponse } from "next/server";
import pool from "@/lib/db";
import crypto from "crypto";
import bcrypt from "bcrypt";
import {
  createUsuarioSchema,
  updateUsuarioSchema,
  deleteUsuarioSchema
} from "@/lib/validators";
import { enviarCredenciais } from "@/lib/services/eviaremail";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();
    const parsed = createUsuarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, email, tipo, registroProfissional } = parsed.data;

    const existente = await pool.query(
      `SELECT 1 FROM Usuario WHERE email = $1 AND ativo = true`,
      [email]
    );

    if (existente.rowCount > 0) {
      return NextResponse.json(
        { error: "Email já cadastrado e ativo." },
        { status: 409 }
      );
    }

    const senhaTemporaria = crypto.randomBytes(6).toString("hex").toUpperCase();
    const senhaHash = await bcrypt.hash(senhaTemporaria, 10);

    const result = await pool.query(
      `INSERT INTO Usuario (nome, email, senha, tipo, registro_profissional, primeiro_acesso)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING id, nome, email, tipo, ativo, criado_em`,
      [nome, email, senhaHash, tipo, registroProfissional]
    );

    enviarCredenciais({ email, nome, senhaTemporaria, tipo }).catch(error => {
      console.error("Erro ao enviar email de boas-vindas:", error);
    });

    return NextResponse.json(
      { 
        message: "Cadastro realizado! Credenciais enviadas por email.", 
        user: result.rows[0] 
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Email ou registro profissional já cadastrado." },
        { status: 409 }
      );
    }
    console.error("Erro no POST Usuario:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const tipo = searchParams.get("tipo");

    const tiposValidos = ['admin', 'profissional', 'cliente'];
    if (tipo && !tiposValidos.includes(tipo)) {
      return NextResponse.json(
        { error: "Tipo inválido. Use: admin, profissional ou cliente." }, 
        { status: 400 }
      );
    }

    const query = `SELECT id, nome, email, tipo, registro_profissional, ativo, criado_em
       FROM Usuario
       WHERE ativo = true
       ${tipo ? 'AND tipo = $1' : ''}
       ORDER BY nome ASC
       LIMIT 100`;

    const result = await pool.query(query, tipo ? [tipo] : []);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro no GET Usuario:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const parsed = deleteUsuarioSchema.safeParse({
      id: searchParams.get("id"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const { id } = parsed.data;

    const result = await pool.query(
      `UPDATE Usuario 
       SET ativo = false 
       WHERE id = $1 AND ativo = true 
       RETURNING id, nome`,
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado ou já inativo." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Usuário inativado com sucesso!",
      user: result.rows[0]
    });
  } catch (error) {
    console.error("Erro no DELETE Usuario:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(requisicao) {
  const client = await pool.connect();

  try {
    const body = await requisicao.json();
    const parsed = updateUsuarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { id, nome, email, tipo, ativo, redefinirSenha } = parsed.data;

    const usuarioExiste = await client.query(
      'SELECT id, email, nome FROM Usuario WHERE id = $1 AND ativo = true', 
      [id]
    );

    if (usuarioExiste.rowCount === 0) {
      client.release();
      return NextResponse.json(
        { error: 'Usuário não encontrado ou inativo.' }, 
        { status: 404 }
      );
    }

    await client.query('BEGIN'); 

    let emailParaEnviar = null;
    let nomeParaEnviar = null;
    let novaSenhaParaEnviar = null;

    if (redefinirSenha) {
      const novaSenha = crypto.randomBytes(6).toString('hex').toUpperCase();
      const senhaHash = await bcrypt.hash(novaSenha, 10);

      await client.query(
        `UPDATE Usuario 
         SET senha = $1, primeiro_acesso = true 
         WHERE id = $2`,
        [senhaHash, id]
      );

      emailParaEnviar = usuarioExiste.rows[0].email;
      nomeParaEnviar = usuarioExiste.rows[0].nome;
      novaSenhaParaEnviar = novaSenha;
    }

    const result = await client.query(
      `UPDATE Usuario
       SET nome  = COALESCE($1, nome),
           email = COALESCE($2, email),
           tipo   = COALESCE($3, tipo),
           ativo  = COALESCE($4, ativo)
       WHERE id = $5
       RETURNING id, nome, email, tipo, ativo, criado_em`,
      [nome, email, tipo, ativo, id]
    );

    await client.query('COMMIT'); 

    if (emailParaEnviar) {
      enviarCredenciais({
        email: emailParaEnviar,
        nome: nomeParaEnviar,
        senhaTemporaria: novaSenhaParaEnviar,
        tipo: 'redefinicao' 
      }).catch(err => {
        console.error('Erro ao enviar email de redefinição:', err);
      });
    }

    client.release();
    return NextResponse.json(result.rows[0]);

  } catch (error) {
    await client.query('ROLLBACK'); 
    client.release();
    
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'E-mail já cadastrado e ativo.' }, 
        { status: 409 }
      );
    }
    
    console.error("Erro no PUT Usuario:", error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' }, 
      { status: 500 }
    );
  }
}