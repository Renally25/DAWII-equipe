import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { createProtocoloSchema } from "@/lib/validators";

export async function POST(requisicao) {
  try {
    const body = await requisicao.json();

    const { descricao, dataprotocolo, codfisioterapeuta } = body;
    console.log("BODY:", body);
    console.log("codfisioterapeuta:", body.codfisioterapeuta);
    const parsed = createProtocoloSchema.safeParse({
      descricao,
      dataprotocolo,
    });

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
        },
        {
          status: 400,
        },
      );
    }

    const codFisio = Number(codfisioterapeuta);

    if (!Number.isInteger(codFisio) || codFisio <= 0) {
      return NextResponse.json(
        {
          error: "codfisioterapeuta inválido.",
        },
        {
          status: 400,
        },
      );
    }

    // Verifica se o fisioterapeuta existe
    const fisioterapeuta = await pool.query(
      `
      SELECT codusuario
      FROM Fisioterapeuta
      WHERE codusuario = $1
      `,
      [codFisio],
    );

    if (fisioterapeuta.rows.length === 0) {
      return NextResponse.json(
        {
          error: "Fisioterapeuta não encontrado.",
        },
        {
          status: 404,
        },
      );
    }

    const result = await pool.query(
      `
      INSERT INTO Protocolo
      (
        descricao,
        dataprotocolo,
        codfisioterapeuta
      )
      VALUES
      (
        $1,
        $2,
        $3
      )
      RETURNING *;
      `,
      [descricao, dataprotocolo, codFisio],
    );

    return NextResponse.json(result.rows[0], {
      status: 201,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao criar protocolo.",
        details: error.message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function GET(requisicao) {
  try {
    const { searchParams } = new URL(requisicao.url);

    const codfisioterapeuta = searchParams.get("codfisioterapeuta");

    if (!codfisioterapeuta) {
      return NextResponse.json(
        {
          error: "codfisioterapeuta é obrigatório.",
        },
        {
          status: 400,
        },
      );
    }

    const codFisio = Number(codfisioterapeuta);

    if (!Number.isInteger(codFisio) || codFisio <= 0) {
      return NextResponse.json(
        {
          error: "codfisioterapeuta inválido.",
        },
        {
          status: 400,
        },
      );
    }

    const result = await pool.query(
      `
      SELECT *
      FROM Protocolo
      WHERE codfisioterapeuta = $1
      ORDER BY dataprotocolo DESC;
      `,
      [codFisio],
    );

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Erro ao buscar protocolos.",
        details: error.message,
      },
      {
        status: 500,
      },
    );
  }
}
