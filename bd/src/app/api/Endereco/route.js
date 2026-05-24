import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createEnderecoSchema,
  deleteEnderecoSchema,
  updateEnderecoSchema,
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createEnderecoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodUsuario, cep, estado, cidade, bairro, rua, numero } = parsed.data;

    const result = await pool.query(
      `INSERT INTO Endereco (CodUsuario, cep, estado, cidade, bairro, rua, numero)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING CodEndereco`,
      [CodUsuario, cep, estado, cidade, bairro, rua, numero]
    );

    return NextResponse.json(
      { message: "Endereço cadastrado com sucesso!", id: result.rows[0].codendereco },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Endereço já cadastrado para este usuário." },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const codUsuario = searchParams.get("CodUsuario");

    if (!codUsuario) {
      return NextResponse.json(
        { error: "CodUsuario é obrigatório." },
        { status: 400 }
      );
    }

    const id = parseInt(codUsuario);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "CodUsuario inválido." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `SELECT CodEndereco, CodUsuario, cep, estado, cidade, bairro, rua, numero
       FROM Endereco
       WHERE CodUsuario = $1
         AND ativo = true
       ORDER BY CodEndereco ASC`,
      [id]
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);

    const parsed = deleteEnderecoSchema.safeParse({
      CodEndereco: searchParams.get("CodEndereco"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

    const { CodEndereco } = parsed.data;

    const result = await pool.query(
      `UPDATE Endereco
       SET ativo = false
       WHERE CodEndereco = $1
       RETURNING CodEndereco`,
      [CodEndereco]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Endereço não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Endereço inativado com sucesso!",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = updateEnderecoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodEndereco, CodUsuario, cep, estado, cidade, bairro, rua, numero, ativo } = parsed.data;

    const result = await pool.query(
      `UPDATE Endereco
       SET CodUsuario = COALESCE($1, CodUsuario),
           cep        = COALESCE($2, cep),
           estado     = COALESCE($3, estado),
           cidade     = COALESCE($4, cidade),
           bairro     = COALESCE($5, bairro),
           rua        = COALESCE($6, rua),
           numero     = COALESCE($7, numero),
           ativo      = COALESCE($8, ativo)
       WHERE CodEndereco = $9
       RETURNING CodEndereco, CodUsuario, cep, estado, cidade, bairro, rua, numero, ativo`,
      [CodUsuario, cep, estado, cidade, bairro, rua, numero, ativo, CodEndereco]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Endereço não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Dados já existentes." },
        { status: 409 }
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}