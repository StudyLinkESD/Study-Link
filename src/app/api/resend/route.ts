import { Resend } from "resend";
import { NextRequest } from "next/server";

const resend = new Resend(process.env.NEXT_PUBLIC_AUTH_RESEND_KEY);

export async function POST(req: NextRequest) {
    const body = await req.json();
    const { from, to, subject, url } = body;

    try {
        const { data, error } = await resend.emails.send({
            from,
            to: [to],
            subject,
            html: `<p>Here is your connexion link : ${url} </p>`,
        });

        if (error) {
            return Response.json(
                {error: error.message},
                {status: 500}
            );
        }

        return Response.json({ data, url });
    } catch (error) {
        return Response.json({ error }, { status: 500 });
    }
}