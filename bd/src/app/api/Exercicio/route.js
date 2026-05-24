import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createExercicioSchema,
  deleteExercicioSchema,
  updateExercicioSchema,
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createExercicioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { nome, descricao, series, repeticoes, peso, CodTreino, CodProtocolo } = parsed.data;

    // Verifica se o Treino existe
    if (CodTreino) {
      const treinoCheck = await pool.query(
        `SELECT CodTreino FROM Treino
         WHERE CodTreino = $1 AND ativo = true`,
        [CodTreino]
      );

      if (treinoCheck.rowCount === 0) {
        return NextResponse.json(
          { error: "Treino não encontrado ou inativo" },
          { status: 404 }
        );
      }
    }

    // Verifica se o Protocolo existe
    if (CodProtocolo) {
      const protocoloCheck = await pool.query(
        `SELECT CodProtocolo FROM Protocolo
         WHERE CodProtocolo = $1 AND ativo = true`,
        [CodProtocolo]
      );

      if (protocoloCheck.rowCount === 0) {
        return NextResponse.json(
          { error: "Protocolo não encontrado ou inativo" },
          { status: 404 }
        );
      }
    }

    const result = await pool.query(
      `INSERT INTO Exercicio (nome, descricao, series, repeticoes, peso, CodTreino, CodProtocolo, ativo)
       VALUES ($1, $2, $3, $4, $5, $6, $7, true)
       RETURNING CodExercicio`,
      [nome, descricao, series, repeticoes, peso || null, CodTreino || null, CodProtocolo || null]
    );

    return NextResponse.json(
      { message: "Exercício criado com sucesso!", CodExercicio: result.rows[0].codexercicio },
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
    const CodTreino = searchParams.get("CodTreino");
    const CodProtocolo = searchParams.get("CodProtocolo");

    let query = `SELECT CodExercicio, nome, descricao, series, repeticoes, peso, CodTreino, CodProtocolo
                 FROM Exercicio
                 WHERE ativo = true`;
    const params = [];

    if (CodTreino) {
      query += ` AND CodTreino = $1`;
      params.push(CodTreino);
    }

    if (CodProtocolo) {
      query += ` AND CodProtocolo = $${params.length + 1}`;
      params.push(CodProtocolo);
    }

    query += ` ORDER BY CodExercicio ASC`;

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

    const parsed = updateExercicioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodExercicio, nome, descricao, series, repeticoes, peso, ativo } = parsed.data;

    let query = `UPDATE Exercicio SET`;
    const params = [];
    const updates = [];

    if (nome !== undefined) {
      updates.push(`nome = $${params.length + 1}`);
      params.push(nome);
    }

    if (descricao !== undefined) {
      updates.push(`descricao = $${params.length + 1}`);
      params.push(descricao);
    }

    if (series !== undefined) {
      updates.push(`series = $${params.length + 1}`);
      params.push(series);
    }

    if (repeticoes !== undefined) {
      updates.push(`repeticoes = $${params.length + 1}`);
      params.push(repeticoes);
    }

    if (peso !== undefined) {
      updates.push(`peso = $${params.length + 1}`);
      params.push(peso);
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

    query += ` ${updates.join(", ")} WHERE CodExercicio = $${params.length + 1} RETURNING CodExercicio`;
    params.push(CodExercicio);

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Exercício atualizado com sucesso!" }
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

    const parsed = deleteExercicioSchema.safeParse({
      CodExercicio: searchParams.get("CodExercicio"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const { CodExercicio } = parsed.data;

    const result = await pool.query(
      `UPDATE Exercicio
       SET ativo = false
       WHERE CodExercicio = $1
       RETURNING CodExercicio`,
      [CodExercicio]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Exercício deletado com sucesso!" }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
