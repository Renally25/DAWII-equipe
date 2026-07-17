import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { CreateExercicioSchema } from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();
    console.log("Dados recebidos no POST:", body);

    const {
      nome,
      series,
      repeticoes,
      peso,
      descricao,
      descanso,
      codtreino,
      codprotocolo,
    } = body;

    // Deve informar um ou outro, nunca os dois
    if (!codtreino && !codprotocolo) {
      return NextResponse.json(
        { error: "É obrigatório informar codtreino ou codprotocolo." },
        { status: 400 }
      );
    }

    if (codtreino && codprotocolo) {
      return NextResponse.json(
        { error: "Informe apenas codtreino ou codprotocolo." },
        { status: 400 }
      );
    }

    const parsed = CreateExercicioSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "Dados inválidos",
          details: parsed.error.flatten().fieldErrors,
        },
        {
          status: 400,
        }
      );
    }

    // Se for exercício de treino
    if (codtreino) {
      const treinoCheck = await pool.query(
        "SELECT codtreino FROM treino WHERE codtreino = $1",
        [codtreino]
      );

      if (treinoCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Treino não encontrado." },
          { status: 404 }
        );
      }
    }

    // Se for exercício de protocolo
    if (codprotocolo) {
      const protocoloCheck = await pool.query(
        "SELECT codprotocolo FROM protocolo WHERE codprotocolo = $1",
        [codprotocolo]
      );

      if (protocoloCheck.rows.length === 0) {
        return NextResponse.json(
          { error: "Protocolo não encontrado." },
          { status: 404 }
        );
      }
    }

    const result = await pool.query(
      `
      INSERT INTO exercicio
      (
        nome,
        series,
        repeticoes,
        descanso,
        peso,
        descricao,
        codtreino,
        codprotocolo
      )
      VALUES
      (
        $1,$2,$3,$4,$5,$6,$7,$8
      )
      RETURNING *;
      `,
      [
        nome,
        series,
        repeticoes,
        descanso ?? null,
        peso ?? null,
        descricao ?? null,
        codtreino ?? null,
        codprotocolo ?? null,
      ]
    );

    console.log("Exercício criado:", result.rows[0]);

    return NextResponse.json(result.rows[0], {
      status: 201,
    });
  } catch (error) {
    console.error("Erro ao criar exercício:", error);

    return NextResponse.json(
      {
        error: "Erro ao criar exercício",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);

    const codtreino = searchParams.get("codtreino");
    const codprotocolo = searchParams.get("codprotocolo");

    // Deve informar um ou outro
    if (!codtreino && !codprotocolo) {
      return NextResponse.json(
        {
          error: "É obrigatório informar codtreino ou codprotocolo.",
        },
        {
          status: 400,
        }
      );
    }

    if (codtreino && codprotocolo) {
      return NextResponse.json(
        {
          error: "Informe apenas codtreino ou codprotocolo.",
        },
        {
          status: 400,
        }
      );
    }

    let result;

    if (codtreino) {
      result = await pool.query(
        `
        SELECT *
        FROM exercicio
        WHERE codtreino = $1
        ORDER BY codexercicio;
        `,
        [codtreino]
      );
    } else {
      result = await pool.query(
        `
        SELECT *
        FROM exercicio
        WHERE codprotocolo = $1
        ORDER BY codexercicio;
        `,
        [codprotocolo]
      );
    }

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar exercícios:", error);

    return NextResponse.json(
      {
        error: "Erro ao buscar exercícios",
        details: error.message,
      },
      {
        status: 500,
      }
    );
  }
}