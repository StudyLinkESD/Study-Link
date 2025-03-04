import { Resend } from 'resend';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const resend = new Resend(process.env.AUTH_RESEND_KEY);
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { from, to, subject, html, url } = body;

    if (!to) {
      return Response.json({ error: 'L\'email du destinataire est requis.' }, { status: 400 });
    }

    const normalizedEmail = to.toLowerCase();

    await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    try {
      const { data, error } = await resend.emails.send({
        from,
        to: [normalizedEmail],
        subject,
        html,
      });

      if (error) {
        return Response.json({ error: error.message }, { status: 500 });
      }

      return Response.json({ data, url });
    } catch (error) {
      return Response.json({ error }, { status: 500 });
    }
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
