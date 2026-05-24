import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createConsultaSchema,
  deleteConsultaSchema,
  updateConsultaSchema,
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createConsultaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const { dataConsulta, horaConsulta, status, observacoes, CodUsuario } =
      parsed.data;

    const conflito = await pool.query(
      `SELECT 1 FROM Consulta
   WHERE CodUsuario = $1
     AND dataConsulta = $2
     AND horaConsulta = $3
     AND ativo = true`,
      [CodUsuario, dataConsulta, horaConsulta],
    );

    if (conflito.rowCount > 0) {
      return NextResponse.json(
        { error: "Já existe uma consulta agendada neste horário." },
        { status: 409 },
      );
    }

    await pool.query(
      `INSERT INTO Consulta (dataConsulta, horaConsulta, status, observacoes, CodUsuario)
            VALUES ($1, $2, $3, $4, $5)`,
      [dataConsulta, horaConsulta, status, observacoes, CodUsuario],
    );

    return NextResponse.json(
      { message: "Consulta agendada com sucesso!" },
      { status: 201 },
    );
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "CodConsulta já existe." },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const result =
      await pool.query(`SELECT CodConsulta, dataConsulta, horaConsulta, status, observacoes, CodUsuario
       FROM Consulta
       WHERE ativo = true
       ORDER BY dataConsulta ASC, horaConsulta ASC`);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);

    const parsed = deleteConsultaSchema.safeParse({
      CodConsulta: searchParams.get("CodConsulta"),
    });

    if (!parsed.success) {
      return NextResponse.json({ error: "ID inválido." }, { status: 400 });
    }

    const { CodConsulta } = parsed.data;

    const result = await pool.query(
      `UPDATE Consulta
       SET ativo = false
       WHERE CodConsulta = $1
       RETURNING CodConsulta`,
      [CodConsulta],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Consulta não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      message: "Consulta deletada com sucesso!",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function PUT(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = updateConsultaSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const {
      CodConsulta,
      dataConsulta,
      horaConsulta,
      status,
      observacoes,
      CodUsuario,
      ativo,
    } = parsed.data;

    const conflito = await pool.query(
      `SELECT 1 FROM Consulta
       WHERE CodUsuario = $1
         AND dataConsulta = $2
         AND horaConsulta = $3
         AND CodConsulta != $4
         AND ativo = true`,
      [CodUsuario, dataConsulta, horaConsulta, CodConsulta],
    );

    if (conflito.rowCount > 0) {
      return NextResponse.json(
        { error: "Já existe uma consulta neste horário para este usuário." },
        { status: 409 },
      );
    }

    const result = await pool.query(
      `UPDATE Consulta
       SET dataConsulta = COALESCE($1, dataConsulta),
           horaConsulta = COALESCE($2, horaConsulta),
           status = COALESCE($3, status),
           observacoes = COALESCE($4, observacoes),
           CodUsuario = COALESCE($5, CodUsuario),
           ativo = COALESCE($6, ativo)
       WHERE CodConsulta = $7
       RETURNING CodConsulta, dataConsulta, horaConsulta, status, observacoes, CodUsuario, ativo`,
      [
        dataConsulta,
        horaConsulta,
        status,
        observacoes,
        CodUsuario,
        ativo,
        CodConsulta,
      ],
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Consulta não encontrada." },
        { status: 404 },
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "Dados já existentes." },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
