import { NextResponse } from "next/server";
import pool from "@/lib/db";
import {
  createProtocoloSchema,
  deleteProtocoloSchema,
  updateProtocoloSchema,
} from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const parsed = createProtocoloSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { descricao, dataProtocolo, CodUsuario } = parsed.data;

    // Verifica se o usuário é um Fisioterapeuta válido
    const fisioterapeutaCheck = await pool.query(
      `SELECT CodUsuario FROM Fisioterapeuta
       WHERE CodUsuario = $1 AND ativo = true`,
      [CodUsuario]
    );

    if (fisioterapeutaCheck.rowCount === 0) {
      return NextResponse.json(
        { error: "Fisioterapeuta não encontrado ou inativo" },
        { status: 404 }
      );
    }

    const result = await pool.query(
      `INSERT INTO Protocolo (descricao, dataProtocolo, CodUsuario, ativo)
       VALUES ($1, $2, $3, true)
       RETURNING CodProtocolo`,
      [descricao, dataProtocolo, CodUsuario]
    );

    return NextResponse.json(
      { message: "Protocolo criado com sucesso!", CodProtocolo: result.rows[0].codprotocolo },
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

    let query = `SELECT CodProtocolo, descricao, dataProtocolo, CodUsuario
                 FROM Protocolo
                 WHERE ativo = true`;
    const params = [];

    if (CodUsuario) {
      query += ` AND CodUsuario = $1`;
      params.push(CodUsuario);
    }

    query += ` ORDER BY dataProtocolo DESC`;

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

    const parsed = updateProtocoloSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { CodProtocolo, descricao, dataProtocolo, ativo } = parsed.data;

    let query = `UPDATE Protocolo SET`;
    const params = [];
    const updates = [];

    if (descricao !== undefined) {
      updates.push(`descricao = $${params.length + 1}`);
      params.push(descricao);
    }

    if (dataProtocolo !== undefined) {
      updates.push(`dataProtocolo = $${params.length + 1}`);
      params.push(dataProtocolo);
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

    query += ` ${updates.join(", ")} WHERE CodProtocolo = $${params.length + 1} RETURNING CodProtocolo`;
    params.push(CodProtocolo);

    const result = await pool.query(query, params);

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Protocolo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Protocolo atualizado com sucesso!" }
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

    const parsed = deleteProtocoloSchema.safeParse({
      CodProtocolo: searchParams.get("CodProtocolo"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ID inválido" },
        { status: 400 }
      );
    }

    const { CodProtocolo } = parsed.data;

    const result = await pool.query(
      `UPDATE Protocolo
       SET ativo = false
       WHERE CodProtocolo = $1
       RETURNING CodProtocolo`,
      [CodProtocolo]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Protocolo não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Protocolo deletado com sucesso!" }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
