import { NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { UserSchema, DeleteUserSchema } from "@/lib/validators";
import { enviarCredenciais } from "@/lib/services/eviaremail";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    console.log(body, "Dados recebidos");

    const { nome, email, cpf, cep, estado, cidade, bairro, rua, numero, telefone, tipoUsuario } = body;

    const parsed = UserSchema.safeParse({
      nome,
      email,
      cpf,
      cep,
      estado,
      cidade,
      bairro,
      rua,
      numero,
      telefone,
      tipoUsuario,
    });

    if (!parsed.success) {
      console.error(parsed.error.flatten().fieldErrors);

      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // limpa cpf
    const cpfLimpo = cpf.replace(/\D/g, "");

    // gera senha aleatória
    const senhaGerada = randomBytes(4).toString("hex");

    // criptografa senha
    const senhaHash = await bcrypt.hash(senhaGerada, 10);

    // cria usuário
    const usuarioResult = await pool.query(
      `INSERT INTO Usuario (
        nome,
        email,
        senha,
        cpf,
        tipoUsuario,
        primeiro_acesso,
        ativo
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        true,
        true
      )
      RETURNING codusuario`,
      [nome, email, senhaHash, cpfLimpo, tipoUsuario],
    );

    const codUsuario = usuarioResult.rows[0].codusuario;

    // salva telefone
    await pool.query(
      `INSERT INTO Telefone (
        codusuario,
        telefone,
        ativo
      )
      VALUES ($1, $2, true)`,
      [codUsuario, telefone],
    );

    // salva endereço
    await pool.query(
      `INSERT INTO Endereco (
        codusuario,
        cep,
        estado,
        cidade,
        bairro,
        rua,
        numero,
        ativo
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        true
      )`,
      [codUsuario, cep, estado, cidade, bairro, rua, numero],
    );

    let emailEnviado = false;
    let emailErro = null;

    try {
      const resultadoEmail = await enviarCredenciais({
        email,
        nome,
        senhaTemporaria: senhaGerada,
        tipo: tipoUsuario,
      });

      emailEnviado = resultadoEmail?.ok === true;
      emailErro = resultadoEmail?.ok ? null : resultadoEmail?.error || "Falha ao enviar e-mail.";
    } catch (error) {
      console.error("Erro no envio de e-mail após cadastro:", error);
      emailErro = error.message;
    }

    return NextResponse.json(
      {
        message: "Usuário cadastrado com sucesso!",
        senhaTemporaria: senhaGerada,
        emailEnviado,
        emailErro,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("ERRO:", error);

    if (error.code === "23505") {
      return NextResponse.json(
        {
          error: "Email ou CPF já cadastrado.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT
        codusuario,
        nome,
        email,
        cpf,
        tipoUsuario,
        primeiro_acesso,
        ativo
       FROM Usuario
       WHERE ativo = true
       ORDER BY codusuario ASC`,
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);

    const parsed = DeleteUserSchema.safeParse({
      CodUsuario: searchParams.get("CodUsuario"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "ID inválido.",
        },
        { status: 400 },
      );
    }

    const { CodUsuario } = parsed.data;

    const result = await pool.query(
      `UPDATE Usuario
       SET ativo = false
       WHERE codusuario = $1
       RETURNING codusuario, nome`,
      [CodUsuario],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        {
          error: "Usuário não encontrado.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Usuário inativado com sucesso!",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      { status: 500 },
    );
  }
}

export async function PUT(requisicao) {
  try {
    const body = await requisicao.json();

    const { codusuario, nome, email, cpf, cep, estado, cidade, bairro, rua, numero, telefone, tipoUsuario } =
      body;

    // limpa cpf
    const cpfLimpo = cpf ? cpf.replace(/\D/g, "") : null; //caso eu não mude

    // atualiza usuario
    const usuarioResult = await pool.query( //coalesce se for null, mantém o valor antigo
      `UPDATE Usuario
       SET
        nome = COALESCE($1, nome), 
        email = COALESCE($2, email),
        cpf = COALESCE($3, cpf),
        tipoUsuario = COALESCE($4, tipoUsuario)
       WHERE codusuario = $5
       RETURNING codusuario`,
      [nome, email, cpfLimpo, tipoUsuario, codusuario],
    );

    if (usuarioResult.rowCount === 0) {
      return NextResponse.json(
        {
          error: "Usuário não encontrado.",
        },
        { status: 404 },
      );
    }

    // atualiza telefone
    await pool.query(
      `UPDATE Telefone
       SET telefone = COALESCE($1, telefone)
       WHERE codusuario = $2`,
      [telefone, codusuario],
    );

    // atualiza endereço
    await pool.query(
      `UPDATE Endereco
       SET cep = COALESCE($2, cep),
        estado = COALESCE($3, estado),
        cidade = COALESCE($4, cidade),
        bairro = COALESCE($5, bairro),
        rua = COALESCE($6, rua),
        numero = COALESCE($7, numero)
       WHERE codusuario = $1`,
      [codusuario, cep, estado, cidade, bairro, rua, numero],
    );

    return NextResponse.json(
      {
        message: "Usuário atualizado com sucesso!",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro interno no servidor.",
      },
      { status: 500 },
    );
  }
}
