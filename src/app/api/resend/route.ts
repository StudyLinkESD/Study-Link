import {Resend} from "resend";
import {NextRequest} from "next/server";
import {PrismaClient} from "@prisma/client";

const resend = new Resend(process.env.NEXT_PUBLIC_AUTH_RESEND_KEY);
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
    const body = await req.json();
    const {from, to, subject, url, email, firstname, lastname} = body;

    if (!email) {
        return Response.json({error: "L'email est requis."}, {status: 400});
    }

    const normalizedEmail = email.toLowerCase();

    const user = await prisma.user.findUnique({
        where: {email: normalizedEmail},
    });

    if (!user) {
        if (!firstname || !lastname) {
            return Response.json(
                {error: "Veuillez créer un compte en fournissant nom et prénom."},
                {status: 400}
            );
        }

        await prisma.user.create({
            data: {
                email: normalizedEmail,
                firstname,
                lastname,
            },
        });
    }

    try {
        const {data, error} = await resend.emails.send({
            from,
            to: [to],
            subject,
            html: `<p>Voici votre lien de connexion : ${url}</p>`,
        });

        if (error) {
            return Response.json({error: error.message}, {status: 500});
        }

        return Response.json({data, url});
    } catch (error) {
        return Response.json({error}, {status: 500});
    }
}
