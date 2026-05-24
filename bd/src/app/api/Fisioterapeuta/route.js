import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createFisioterapeutaSchema,
  deleteFisioterapeutaSchema
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createFisioterapeutaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodUsuario, crefito } = parsed.data;

    await pool.query(
      `INSERT INTO Fisioterapeuta (CodUsuario, crefito, ativo)
       VALUES ($1, $2, true)`,
      [CodUsuario, crefito]
    );

    return NextResponse.json(
      { message: "Fisioterapeuta cadastrado com sucesso!" },
      { status: 201 }
    );

  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Fisioterapeuta já cadastrado para este usuário." },
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
      `SELECT CodUsuario, crefito
       FROM Fisioterapeuta
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

    const parsed = deleteFisioterapeutaSchema.safeParse({
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
      `UPDATE Fisioterapeuta
       SET ativo = false
       WHERE CodUsuario = $1
       RETURNING CodUsuario`,
      [CodUsuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Fisioterapeuta não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Fisioterapeuta inativado com sucesso!"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}