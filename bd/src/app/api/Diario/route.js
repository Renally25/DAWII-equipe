import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createDiarioSchema,
  deleteDiarioSchema,
  updateDiarioSchema,
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createDiarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { dataDiario, descricao, humor, notaTreino, CodUsuario } = parsed.data;

    const result = await pool.query(
      `INSERT INTO Diario (dataDiario, descricao, humor, notaTreino, CodUsuario, ativo)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING CodDiario`,
      [dataDiario, descricao, humor, notaTreino, CodUsuario]
    );

    return NextResponse.json(
      { message: "Diário registrado com sucesso!", id: result.rows[0].coddiario },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Você já registrou o diário deste dia." },
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
      `SELECT CodDiario, dataDiario, descricao, humor, notaTreino
       FROM Diario
       WHERE CodUsuario = $1
         AND ativo = true
       ORDER BY dataDiario DESC`,
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

    const parsed = deleteDiarioSchema.safeParse({
      CodDiario: searchParams.get("CodDiario"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

    const { CodDiario } = parsed.data;

    const result = await pool.query(
      `UPDATE Diario
       SET ativo = false
       WHERE CodDiario = $1
       RETURNING CodDiario`,
      [CodDiario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Diário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Diário inativado com sucesso!",
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

    const parsed = updateDiarioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodDiario, CodUsuario, descricao, humor, notaTreino, ativo } = parsed.data;

    const result = await pool.query(
      `UPDATE Diario
       SET descricao  = COALESCE($1, descricao),
           humor      = COALESCE($2, humor),
           notaTreino = COALESCE($3, notaTreino),
           ativo      = COALESCE($4, ativo)
       WHERE CodDiario  = $5
         AND CodUsuario = $6
       RETURNING CodDiario, dataDiario, descricao, humor, notaTreino, ativo`,
      [descricao, humor, notaTreino, ativo, CodDiario, CodUsuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Diário não encontrado." },
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