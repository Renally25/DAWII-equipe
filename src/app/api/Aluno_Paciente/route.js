import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const pacientesResult = await pool.query(
      `SELECT codusuario, nome, cpf
       FROM usuario
       WHERE tipousuario = 'aluno-paciente'
         AND ativo = true
       ORDER BY codusuario ASC`,
    );

    return NextResponse.json({
      pacientes: pacientesResult.rows,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        error: "Erro ao buscar dados os pacientes-alunos",
      },
      { status: 500 },
    );
  }
}