import { z } from "zod";

export const UserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.email("Email inválido"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  cep: z.string().min(8, "CEP é obrigatório"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  rua: z.string().min(2, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
});

export const DeleteUserSchema = z.object({
  CodUsuario: z.coerce.number().int("ID de usuário inválido"),
});

const hoje = new Date();
hoje.setHours(0, 0, 0, 0);

export const ConsultSchema = z.object({
  dataconsulta: z.coerce.date().min(hoje, { error: "Data inválida" }),
  horaconsulta: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, {
      message: "Horário inválido. Use o formato HH:MM",
    }),
});

export const DiarioSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  humor: z.string().min(1, "Humor é obrigatório"),
});

export const TreinoSchema = z.object({
  descricao: z
    .string()
    .trim()
    .min(5, "A descrição deve possuir no mínimo 5 caracteres.")
    .max(255, "A descrição deve possuir no máximo 255 caracteres."),

  datatreino: z.string().min(1, "A data do treino é obrigatória."),

  duracao: z.coerce.number().positive("A duração deve ser maior que zero."),
});

export const ExercicioSchema = z.object({
  nome: z.string().trim()
    .min(3, "O nome do exercício deve possuir no mínimo 3 caracteres.")
    .max(255, "O nome do exercício deve possuir no máximo 255 caracteres."),

  descricao: z.string().trim().max(1000, "A descrição deve possuir no máximo 1000 caracteres.")
    .optional(),

  series: z.coerce.number().int("O número de séries deve ser um inteiro.").min(1, "O exercício deve possuir pelo menos uma série."),

  repeticoes: z.coerce.number().int("O número de repetições deve ser um inteiro.")
    .min(1, "O exercício deve possuir pelo menos uma repetição."),

  peso: z.coerce.number().min(0, "O peso não pode ser negativo."),
});

export const createUsuarioSchema = UserSchema;
export const updateUsuarioSchema = z.object({
  id: z.coerce.number().int("ID de usuário inválido"),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  email: z.string().email("Email inválido").optional(),
  tipo: z.string().optional(),
  ativo: z.boolean().optional(),
  redefinirSenha: z.boolean().optional(),
});
export const deleteUsuarioSchema = DeleteUserSchema;

export const createEnderecoSchema = z.object({
  CodUsuario: z.coerce.number().int("ID de usuário inválido"),
  cep: z.string().min(8, "CEP é obrigatório"),
  estado: z.string().min(2, "Estado é obrigatório"),
  cidade: z.string().min(2, "Cidade é obrigatória"),
  bairro: z.string().min(2, "Bairro é obrigatório"),
  rua: z.string().min(2, "Rua é obrigatória"),
  numero: z.string().min(1, "Número é obrigatório"),
});
export const updateEnderecoSchema = z.object({
  CodEndereco: z.coerce.number().int("ID de endereço inválido"),
  CodUsuario: z.coerce.number().int("ID de usuário inválido").optional(),
  cep: z.string().min(8, "CEP é obrigatório").optional(),
  estado: z.string().min(2, "Estado é obrigatório").optional(),
  cidade: z.string().min(2, "Cidade é obrigatória").optional(),
  bairro: z.string().min(2, "Bairro é obrigatório").optional(),
  rua: z.string().min(2, "Rua é obrigatória").optional(),
  numero: z.string().min(1, "Número é obrigatório").optional(),
  ativo: z.boolean().optional(),
});
export const deleteEnderecoSchema = z.object({
  CodEndereco: z.coerce.number().int("ID de endereço inválido"),
});

export const createProtocoloSchema = z.object({
  descricao: z.string().min(1, "Descrição é obrigatória"),
  dataprotocolo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Indique a data do treino" })
});

export const createTelefoneSchema = z.object({
  CodUsuario: z.coerce.number().int("ID de usuário inválido"),
  telefone: z.string().min(1, "Telefone é obrigatório"),
});
export const deleteTelefoneSchema = z.object({
  CodUsuario: z.coerce.number().int("ID de usuário inválido"),
});

export const CreateTreinoSchema = z.object({
  duracao: z.coerce.number().min(1, 'indique a duraçaõ média do treino'),
  datatreino: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Indique a data do treino" })
});

export const CreateExercicioSchema = z.object({
  nome: z.string()
    .trim()
    .min(3, "Indique o nome do exercício."),

  series: z.coerce.number()
    .int()
    .min(1, "Indique o número de séries."),

  repeticoes: z.coerce.number()
    .int()
    .min(1, "Indique o número de repetições."),

  peso: z.coerce.number()
    .min(0)
    .optional(),

  descanso: z.coerce.number()
    .min(0)
    .optional(),

  codtreino: z.coerce.number().int().positive().optional(),

  codprotocolo: z.coerce.number().int().positive().optional(),
}).refine(
  (data) =>
    (data.codtreino && !data.codprotocolo) ||
    (!data.codtreino && data.codprotocolo),
  {
    message: "O exercício deve pertencer a um treino ou a um protocolo.",
    path: ["codtreino"],
  }
);
