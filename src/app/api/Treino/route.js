import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { CreateTreinoSchema } from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();
    const { descricao, datatreino, duracao, codusuario } = body;

    const parsed = CreateTreinoSchema.safeParse({
      datatreino,
      duracao,
    });

    if (!parsed.success) {
      console.log(parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const codusuarioParsed = Number(codusuario);
    if (!Number.isInteger(codusuarioParsed) || codusuarioParsed <= 0) {
      return NextResponse.json(
        { error: "codusuario inválido" },
        { status: 400 },
      );
    }

    // Garante que o codusuario exista (relação obrigatória com Usuario)
    const usuarioCheck = await pool.query(
      `SELECT codusuario FROM Usuario WHERE codusuario = $1`,
      [codusuarioParsed],
    );

    if (usuarioCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "codusuario não encontrado" },
        { status: 404 },
      );
    }

    const result = await pool.query(
      `INSERT INTO treino 
      (descricao, datatreino, duracao, codusuario) 
      VALUES ($1, $2, $3, $4) 
      RETURNING *`,
      [descricao || null, datatreino, duracao, codusuarioParsed],
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao criar treino:", error);
    return NextResponse.json(
      {
        error: "Erro ao criar treino",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);
    let codusuario = searchParams.get("codusuario");

    if (!codusuario) {
      return NextResponse.json(
        { error: "codusuario é obrigatório" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `SELECT * FROM treino WHERE codusuario = $1 ORDER BY datatreino DESC`,
      [codusuario],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar treinos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar treinos", details: error.message },
      { status: 500 },
    );
  }
}