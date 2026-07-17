import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const { codusuario } = await params;

    const id = parseInt(codusuario);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: "CodUsuario inválido." },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `
  SELECT
    u.codusuario,
    u.nome,
    u.email,
    u.cpf,
    u.dtnascimento,
    u.tipousuario,

    t.telefone,

    e.cep,
    e.estado,
    e.cidade,
    e.bairro,
    e.rua,
    e.numero,

    ap.observacoes,
    ap.objetivo

  FROM Usuario u

  LEFT JOIN Telefone t
    ON t.codusuario = u.codusuario

  LEFT JOIN Endereco e
    ON e.codusuario = u.codusuario

  LEFT JOIN Aluno_Paciente ap
    ON ap.codusuario = u.codusuario

  WHERE u.codusuario = $1;
  `,
      [id],
    );
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
