import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createTreinadorSchema,
  deleteTreinadorSchema
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createTreinadorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodUsuario, cref } = parsed.data;

    await pool.query(
      `INSERT INTO Treinador (CodUsuario, cref, ativo)
       VALUES ($1, $2, true)`,
      [CodUsuario, cref]
    );

    return NextResponse.json(
      { message: "Treinador cadastrado com sucesso!" },
      { status: 201 }
    );

  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Treinador já cadastrado para este usuário." },
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

export async function GET() {
  try {
    const result = await pool.query(
      `SELECT CodUsuario, cref
       FROM Treinador
       WHERE ativo = true
       ORDER BY CodUsuario ASC`
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

    const parsed = deleteTreinadorSchema.safeParse({
      CodUsuario: searchParams.get("CodUsuario")
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID inválido." },
        { status: 400 }
      );
    }

    const { CodUsuario } = parsed.data;

    const result = await pool.query(
      `UPDATE Treinador
       SET ativo = false
       WHERE CodUsuario = $1
       RETURNING CodUsuario`,
      [CodUsuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Treinador não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Treinador inativado com sucesso!"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}