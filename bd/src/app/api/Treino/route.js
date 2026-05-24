import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createTreinoSchema,
  deleteTreinoSchema,
  updateTreinoSchema,
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createTreinoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { descricao, dataTreino, duracao, CodUsuario } = parsed.data;

    // Verifica se o usuário é um Treinador válido
    const treinadorCheck = await pool.query(
      `SELECT CodUsuario FROM Treinador
       WHERE CodUsuario = $1 AND ativo = true`,
      [CodUsuario]
    );

    if (treinadorCheck.rowCount === 0) {
      return NextResponse.json(
        { error: "Treinador não encontrado ou inativo" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO Treino (descricao, dataTreino, duracao, CodUsuario, ativo)
       VALUES ($1, $2, $3, $4, true)
       RETURNING CodTreino`,
      [descricao, dataTreino, duracao, CodUsuario]
    );

    return NextResponse.json(
      { message: "Treino criado com sucesso!", CodTreino: result.rows[0].codtreino },
      { status: 201 }
    );
  } catch (error) {
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
    const CodUsuario = searchParams.get("CodUsuario");

    let query = `SELECT CodTreino, descricao, dataTreino, duracao, CodUsuario
                 FROM Treino
                 WHERE ativo = true`;
    const params = [];

    if (CodUsuario) {
      query += ` AND CodUsuario = $1`;
      params.push(CodUsuario);
    }

    query += ` ORDER BY dataTreino DESC`;

    const result = await pool.query(query, params);

    return NextResponse.json(result.rows);
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

    const parsed = updateTreinoSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodTreino, descricao, dataTreino, duracao, ativo } = parsed.data;

    let query = `UPDATE Treino SET`;
    const params = [];
    const updates = [];

    if (descricao !== undefined) {
      updates.push(`descricao = $${params.length + 1}`);
      params.push(descricao);
    }

    if (dataTreino !== undefined) {
      updates.push(`dataTreino = $${params.length + 1}`);
      params.push(dataTreino);
    }

    if (duracao !== undefined) {
      updates.push(`duracao = $${params.length + 1}`);
      params.push(duracao);
    }

    if (ativo !== undefined) {
      updates.push(`ativo = $${params.length + 1}`);
      params.push(ativo);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "Nenhum campo para atualizar" },
        { status: 400 }
      );
    }

    query += ` ${updates.join(", ")} WHERE CodTreino = $${params.length + 1} RETURNING CodTreino`;
    params.push(CodTreino);

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Treino não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Treino atualizado com sucesso!" }
    );
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

    const parsed = deleteTreinoSchema.safeParse({
      CodTreino: searchParams.get("CodTreino"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const { CodTreino } = parsed.data;

    const result = await pool.query(
      `UPDATE Treino
       SET ativo = false
       WHERE CodTreino = $1
       RETURNING CodTreino`,
      [CodTreino]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Treino não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Treino deletado com sucesso!" }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
