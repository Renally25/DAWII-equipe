import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(){
  
}

export async function GET(requisicao) {
  const { searchParams } = new URL(requisicao.url);

  const codusuario = searchParams.get("codusuario");

  try {

    const pacientesResult = await pool.query(
      `SELECT codusuario, nome, cpf
       FROM usuario
       WHERE tipousuario = 'aluno-paciente'
       AND ativo = true
       ORDER BY nome`
    );

    let consultasResult;

    if (codusuario) {
      consultasResult = await pool.query(
        `SELECT
            codconsulta,
            dataconsulta,
            horaconsulta,
            observacoes
         FROM consulta
         WHERE codusuario = $1
         ORDER BY dataconsulta, horaconsulta`,
        [codusuario]
      );
    } else {
      consultasResult = await pool.query(
        `SELECT
            codconsulta,
            dataconsulta,
            horaconsulta,
            observacoes
         FROM consulta
         ORDER BY dataconsulta, horaconsulta`
      );
    }

    const diarioResult = await pool.query(
      `SELECT coddiario, datadiario, descricao
       FROM diario`
    );

    return NextResponse.json({
      pacientes: pacientesResult.rows,
      consultas: consultasResult.rows,
      diarios: diarioResult.rows,
    });

  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao buscar dados",
      },
      {
        status: 500,
      }
    );
  }
}