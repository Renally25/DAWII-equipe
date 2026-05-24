// app/api/test-email/route.js
import { NextResponse } from "next/server";
import { enviarCredenciais } from "@/lib/services/eviaremail";

export async function GET() {
  try {
    await enviarCredenciais({
      email:            "renallyaciole@gmail.com", 
      nome:             "João Silva",
      senhaTemporaria:  "ABC123",
      tipo:             "paciente",
    });

    return NextResponse.json({ message: "E-mail enviado com sucesso!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}