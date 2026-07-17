import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function PUT(req, { params }) {
  try {
    const { codusuario } = await params;
    const id = parseInt(codusuario);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "CodUsuario inválido." },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { observacoes } = body;

    const result = await pool.query(
      `
      UPDATE Aluno_Paciente
      SET observacoes = $1
      WHERE codusuario = $2
      RETURNING *
      `,
      [observacoes, id],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Paciente não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        message: "Observações atualizadas com sucesso.",
        paciente: result.rows[0],
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}

