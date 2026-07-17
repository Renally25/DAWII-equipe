import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ message: "Rota disponível para testes." });
}