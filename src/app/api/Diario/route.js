import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { DiarioSchema } from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    console.log(body, "Dados recebidos");

    const { descricao, humor, codusuario } = body;

    const parsed = DiarioSchema.safeParse({
      descricao,
      humor,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: parsed.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    const result = await pool.query(
      `INSERT INTO diario (
        descricao,
        humor,
        codusuario
      )
      VALUES ($1, $2, $3)
      RETURNING coddiario, datadiario`,
      [descricao, humor, codusuario]
    );

    return NextResponse.json(
      {
        message: "Diário criado com sucesso!",
        diario: result.rows[0],
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Erro no POST Diario:", error);

    return NextResponse.json(
      {
        error: "Erro interno do servidor.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(requisicao) {
  const { searchParams } = new URL(requisicao.url);
  const codusuario = searchParams.get('codusuario');

  try {
    let diarioResult;

    if (codusuario) {
      // Retorna apenas os diários do usuário logado
      diarioResult = await pool.query(
        `SELECT d.coddiario, d.descricao, d.humor, d.datadiario, u.nome
         FROM diario d
         JOIN usuario u ON u.codusuario = d.codusuario
         WHERE d.codusuario = $1
         ORDER BY d.datadiario DESC;`, // mais recentes primeiro
        [codusuario]
      );
    } else {
      // Retorna  TODOS os diários do sistema
      diarioResult = await pool.query(
        `SELECT d.coddiario, d.descricao, d.humor, d.datadiario, u.nome
         FROM diario d
         JOIN usuario u ON u.codusuario = d.codusuario
         ORDER BY d.datadiario DESC;`
      );
    }

    return NextResponse.json(diarioResult.rows);

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar dados do banco." },
      { status: 500 }
    );
  }
}

