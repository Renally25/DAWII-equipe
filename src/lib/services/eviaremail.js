import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function enviarCredenciais({ email, nome, senhaTemporaria, tipo }) {
  const tipoLabel = {
    psicologo:      'Psicólogo',
    personal:       'Educador Físico',
    fisioterapeuta: 'Fisioterapeuta',
    cliente:       'Cliente',
  };

  const response = await resend.emails.send({
    from: 'Raggio Academia <onboarding@resend.dev>',
    to: email,
    subject: 'Seu acesso à Raggio Academia',
    html: `
      <h2>Olá, ${nome}!</h2>
      <p>Seu acesso foi criado como <strong>${tipoLabel[tipo] ?? tipo}</strong>.</p>
      <p><strong>E-mail:</strong> ${email}</p>
      <p><strong>Senha temporária:</strong> <code>${senhaTemporaria}</code></p>
      <p>No primeiro acesso você será redirecionado para criar uma senha pessoal.</p>
    `,
  });
  console.log(response);
}