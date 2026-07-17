export async function abrirProntuario({
  codusuario,
  setProntuario,
  setObservacoes,
}) {

  try {
    const result = await fetch(`http://localhost:3000/api/Usuario/${codusuario}`);
    console.log(result.status);

    if (!result.ok) {
      throw new Error("Erro ao carregar prontuário.");
    }

    const dados = await result.json();
    console.log(dados);
    setProntuario(dados);
    setObservacoes(dados.observacoes || "");
  } catch (error) {
    console.error(error);
  } 
}

export async function salvarObservacoes({ codusuario, observacoes, setEditandoObs }) {
  try {
    const result = await fetch(`http://localhost:3000/api/Aluno_Paciente/${codusuario}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        observacoes,
      }),
    });

    if (!result.ok) {
      throw new Error("Erro ao salvar.");
    }

    setEditandoObs(false);
  } catch (error) {
    console.error(error);
  }
}

export function calcularIdade(dataNascimento) {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);

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
    const result = await fetch(`http://localhost:3000/api/Diario?codusuario=${codusuario}`);

    if (!result.ok) {
      throw new Error("Erro ao buscar diários.");
    }

    return await result.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}
