import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { CodEndereco } = params;

    const id = parseInt(CodEndereco);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "CodEndereco inválido." },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM Endereco WHERE CodEndereco = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Endereco não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
