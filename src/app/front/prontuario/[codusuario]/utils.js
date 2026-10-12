export async function abrirProntuario({
  codusuario,
  setProntuario,
  setObservacoes,
}) {
  try {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Usuario/${codusuario}`,
    );

    if (!result.ok) {
      throw new Error("Erro ao carregar prontuário.");
    }

    const dados = await result.json();
    setProntuario(dados);
    setObservacoes(dados.observacoes || "");
  } catch (error) {
    console.error(error);
  }
}

// Agora devolve true/false para a tela poder mostrar o resultado ao usuário
export async function salvarObservacoes({
  codusuario,
  observacoes,
  setEditandoObs,
}) {
  try {
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Aluno_Paciente/${codusuario}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          observacoes,
        }),
      },
    );

    if (!result.ok) {
      throw new Error("Erro ao salvar.");
    }

    setEditandoObs(false);
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
}

// Lê "1990-01-15" ou "1990-01-15T00:00:00" como data LOCAL
// (new Date("1990-01-15") é UTC e pode mostrar o dia anterior no Brasil).
export function lerDataLocal(valor) {
  if (!valor) return null;
  const [ano, mes, dia] = String(valor).split("T")[0].split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

export function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = lerDataLocal(dataNascimento);

  if (!nascimento) return null;

  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const mes = hoje.getMonth() - nascimento.getMonth();

  if (mes < 0 || (mes === 0 && hoje.getDate() < nascimento.getDate())) {
    idade--;
  }

  return idade;
}

export async function pegarDiarios({ codusuario }) {
  try {
    // Passamos o 'codusuario' como query param na URL
    const result = await fetch(
      `${process.env.NEXT_PUBLIC_AUTH_API}/api/Diario?codusuario=${codusuario}`,
    );

    if (!result.ok) {
      throw new Error("Erro ao buscar diários.");
    }

    return await result.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}