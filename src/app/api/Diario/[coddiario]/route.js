import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { coddiario } = await params;

    const id = Number(coddiario);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "CodDiario inválido." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      `
      SELECT
        d.coddiario,
        d.descricao,
        d.humor,
        d.datadiario,
        u.nome
      FROM diario d
      JOIN usuario u
        ON u.codusuario = d.codusuario
      WHERE d.coddiario = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Diário não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}