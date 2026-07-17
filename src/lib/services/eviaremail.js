import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const emailTeste = process.env.TEST_EMAIL || 'renallyaciole@gmail.com';

function montarHtml({ nome, email, senhaTemporaria, tipo }) {
  const tipoLabel = {
    psicologo: 'Psicólogo',
    personal: 'Educador Físico',
    fisioterapeuta: 'Fisioterapeuta',
    cliente: 'Cliente',
    redefinicao: 'Redefinição de acesso',
  };

  return `
    <h2>Olá, ${nome}!</h2>
    <p>Seu acesso foi criado como <strong>${tipoLabel[tipo] ?? tipo}</strong>.</p>
    <p><strong>E-mail:</strong> ${email}</p>
    <p><strong>Senha temporária:</strong> <code>${senhaTemporaria}</code></p>
    <p>No primeiro acesso você será redirecionado para criar uma senha pessoal.</p>
  `;
}

async function enviarPorResend({ email, nome, senhaTemporaria, tipo }) {
  if (!resend) {
    throw new Error('RESEND_API_KEY não configurada.');
  }

  const destinatario = emailTeste || email;

  const response = await resend.emails.send({
    from: 'Raggio Academia <onboarding@resend.dev>',
    to: destinatario,
    subject: 'Seu acesso à Raggio Academia',
    html: montarHtml({ nome, email, senhaTemporaria, tipo }),
  });

  if (response?.error) {
    throw new Error(response.error.message || 'Erro no envio via Resend.');
  }

  if (!response?.data?.id) {
    throw new Error('Resposta inesperada do Resend.');
  }

  console.log('E-mail enviado via Resend:', response);
}

async function enviarPorSmtp({ email, nome, senhaTemporaria, tipo }) {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpFrom = process.env.SMTP_FROM || 'raggio@localhost';

  if (!smtpHost || !smtpUser || !smtpPass) {
    throw new Error('Configuração SMTP incompleta.');
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const destinatario = emailTeste || email;

  await transporter.sendMail({
    from: smtpFrom,
    to: destinatario,
    subject: 'Seu acesso à Raggio Academia',
    html: montarHtml({ nome, email, senhaTemporaria, tipo }),
  });

  console.log('E-mail enviado via SMTP.');
}

export async function enviarCredenciais({ email, nome, senhaTemporaria, tipo }) {
  try {
    await enviarPorResend({ email, nome, senhaTemporaria, tipo });
    return { ok: true, provider: 'resend' };
  } catch (error) {
    console.warn('Falha no Resend, tentando SMTP:', error.message);
  }

  try {
    await enviarPorSmtp({ email, nome, senhaTemporaria, tipo });
    return { ok: true, provider: 'smtp' };
  } catch (error) {
    console.error('Falha no envio de e-mail:', error.message);
    return { ok: false, provider: null, error: error.message };
  }
}