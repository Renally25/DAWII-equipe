import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createClienteSchema,
  deleteClienteSchema,
  updateClienteSchema
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();
    const parsed = createClienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodUsuario, peso, altura, objetivo, dtCadastro } = parsed.data;

    const existente = await pool.query(
      `SELECT 1 FROM Cliente WHERE CodUsuario = $1 AND ativo = true`,
      [CodUsuario]
    );

    if (existente.rowCount > 0) {
      return NextResponse.json(
        { error: "Cliente já cadastrado para este usuário." },
        { status: 409 }
      );
    }

    const usuarioExiste = await pool.query(
      `SELECT 1 FROM Usuario WHERE id = $1 AND ativo = true`,
      [CodUsuario]
    );

    if (usuarioExiste.rowCount === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado ou inativo." },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO Cliente (CodUsuario, peso, altura, objetivo, dtCadastro, ativo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING CodUsuario, peso, altura, objetivo, dtCadastro`,
      [CodUsuario, peso, altura, objetivo, dtCadastro]
    );

    return NextResponse.json(
      { 
        message: "Cliente cadastrado com sucesso!",
        cliente: result.rows[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erro no POST Cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const CodUsuario = searchParams.get("CodUsuario");

    const query = `
      SELECT c.CodUsuario, c.peso, c.altura, c.objetivo, c.dtCadastro,
             u.nome as nomeUsuario
      FROM Cliente c
      JOIN Usuario u ON c.CodUsuario = u.id
      WHERE c.ativo = true
      ${CodUsuario ? 'AND c.CodUsuario = $1' : ''}
      ORDER BY u.nome ASC
    `;

    const result = await pool.query(
      query, 
      CodUsuario ? [CodUsuario] : []
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro no GET Cliente:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    const parsed = deleteClienteSchema.safeParse({
      CodUsuario: searchParams.get("CodUsuario")
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "CodUsuario inválido." },
        { status: 400 }
      );
    }

    const { CodUsuario } = parsed.data;

    const result = await pool.query(
      `UPDATE Cliente
       SET ativo = false
       WHERE CodUsuario = $1 AND ativo = true
       RETURNING CodUsuario`,
      [CodUsuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou já inativo." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Cliente inativado com sucesso!",
      CodUsuario: result.rows[0].CodUsuario
    });

  } catch (error) {
    console.error("Erro no DELETE Cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(requisicao) {
  try {
    const body = await requisicao.json();
    const parsed = updateClienteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodUsuario, peso, altura, objetivo, ativo } = parsed.data;

    const clienteExiste = await pool.query(
      `SELECT 1 FROM Cliente WHERE CodUsuario = $1 AND ativo = true`,
      [CodUsuario]
    );

    if (clienteExiste.rowCount === 0) {
      return NextResponse.json(
        { error: "Cliente não encontrado ou inativo." },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `UPDATE Cliente
       SET peso = COALESCE($1, peso),
           altura = COALESCE($2, altura),
           objetivo = COALESCE($3, objetivo),
           ativo = COALESCE($4, ativo)
       WHERE CodUsuario = $5
       RETURNING CodUsuario, peso, altura, objetivo, ativo`,
      [peso, altura, objetivo, ativo, CodUsuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Erro ao atualizar cliente." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Cliente atualizado com sucesso!",
      cliente: result.rows[0]
    });

  } catch (error) {
    console.error("Erro no PUT Cliente:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}