import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { CreateExercicioSchema } from "@/lib/validators";

export async function DELETE(requisicao, { params }) {
  try {
    const { codexercicio } = await params;
    
    if (!codexercicio) {
      return NextResponse.json(
        { error: "ID do exercício é obrigatório" },
        { status: 400 }
      );
    }

    // Verifica se o exercício existe
    const exercicioCheck = await pool.query(
      "SELECT codexercicio FROM exercicio WHERE codexercicio = $1",
      [codexercicio]
    );

    if (exercicioCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      "DELETE FROM exercicio WHERE codexercicio = $1 RETURNING *",
      [codexercicio]
    );

    return NextResponse.json({ 
      message: "Exercício excluído com sucesso",
      exercicio: result.rows[0] 
    });
  } catch (error) {
    console.error("Erro ao excluir exercício:", error);
    return NextResponse.json(
      { error: "Erro ao excluir exercício", details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(requisicao, { params }) {
  try {
    const { codexercicio } = await params;
    
    if (!codexercicio) {
      return NextResponse.json(
        { error: "ID do exercício é obrigatório" },
        { status: 400 }
      );
    }

    const body = await requisicao.json();
    console.log("Dados recebidos no PUT:", body);

    const { nome, series, repeticoes, peso, descricao, descanso, codtreino } = body;

    const dadosParaSchema = {
      nome: nome ? nome.trim() : "",
      series: series ? parseInt(series) : 0,
      repeticoes: repeticoes ? parseInt(repeticoes) : 0,
      descanso: descanso ? parseFloat(descanso) : 60,
      peso: peso ? parseFloat(peso) : null,
      descricao: descricao ? descricao.trim() : null,
      codtreino: codtreino ? parseInt(codtreino) : 0,
    };

    const parsed = CreateExercicioSchema.safeParse(dadosParaSchema);

    if (!parsed.success) {
      console.log("Erro de validação:", parsed.error.flatten().fieldErrors);
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Verifica se o exercício existe
    const exercicioCheck = await pool.query(
      "SELECT codexercicio FROM exercicio WHERE codexercicio = $1",
      [codexercicio]
    );

    if (exercicioCheck.rows.length === 0) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      );
    }

    const { nome: nomeValidado, series: seriesValidado, repeticoes: repeticoesValidado,
            descanso: descansoValidado, peso: pesoValidado, descricao: descricaoValidado } = parsed.data;

    const result = await pool.query(
      `UPDATE exercicio 
      SET 
        nome = $1, 
        series = $2, 
        repeticoes = $3, 
        descanso = $4, 
        peso = $5, 
        descricao = $6,
        codtreino = $7
      WHERE codexercicio = $8
      RETURNING *`,
      [
        nomeValidado,
        seriesValidado,
        repeticoesValidado,
        descansoValidado,
        pesoValidado,
        descricaoValidado,
        codtreino,
        codexercicio
      ]
    );

    console.log("Exercício atualizado:", result.rows[0]);
    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao atualizar exercício:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar exercício", details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(requisicao, { params }) {
  try {
    const { codexercicio } = await params;
    
    if (!codexercicio) {
      return NextResponse.json(
        { error: "ID do exercício é obrigatório" },
        { status: 400 }
      );
    }

    const result = await pool.query(
      "SELECT * FROM exercicio WHERE codexercicio = $1",
      [codexercicio]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Exercício não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao buscar exercício:", error);
    return NextResponse.json(
      { error: "Erro ao buscar exercício", details: error.message },
      { status: 500 }
    );
  }
}