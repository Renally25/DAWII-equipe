export function lerDataLocal(valor) {
  if (!valor) return null;
  const [ano, mes, dia] = String(valor).split("T")[0].split("-").map(Number);
  if (!ano || !mes || !dia) return null;
  return new Date(ano, mes - 1, dia);
}

export function formatarData(valor) {
  const data = lerDataLocal(valor);
  return data ? data.toLocaleDateString("pt-BR") : "";
}

export function mascararCpf(cpf) {
  const digitos = String(cpf || "").replace(/\D/g, "");
  if (digitos.length !== 11) return cpf || "—";
  return `***.***.***-${digitos.slice(9)}`;
}