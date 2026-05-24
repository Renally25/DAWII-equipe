import {email, z} from 'zod';

export const UserSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF é obrigatório"),
  endereco: z.string().min(1, "Endereço é obrigatório"),
  telefone: z.string().min(1, "Telefone é obrigatório")
});

export const DeleteUserSchema = z.object({
    CodUsuario: z.coerce.number().int("ID de usuário inválido") 
});