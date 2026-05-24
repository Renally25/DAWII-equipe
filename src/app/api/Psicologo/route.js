import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createPsicologoSchema,
  deletePsicologoSchema
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createPsicologoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodUsuario, crp } = parsed.data;

    await pool.query(
      `INSERT INTO Psicologo (CodUsuario, crp, ativo)
       VALUES ($1, $2, true)`,
      [CodUsuario, crp]
    );

    return NextResponse.json(
      { message: "Psicólogo cadastrado com sucesso!" },
      { status: 201 }
    );

  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Psicólogo já cadastrado para este usuário." },
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
      `SELECT CodUsuario, crp
       FROM Psicologo
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

    const parsed = deletePsicologoSchema.safeParse({
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
      `UPDATE Psicologo
       SET ativo = false
       WHERE CodUsuario = $1
       RETURNING CodUsuario`,
      [CodUsuario]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Psicólogo não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Psicólogo inativado com sucesso!"
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}