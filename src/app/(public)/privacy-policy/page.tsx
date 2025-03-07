import Link from 'next/link';

import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Politique de confidentialité | StudyLink',
  description: 'Politique de confidentialité de StudyLink - Comment nous protégeons vos données',
};

export default function PrivacyPolicyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8">
        <h1 className="mb-2 text-3xl font-bold">Politique de confidentialité</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">Introduction</h2>
          <p className="mb-4">
            Chez StudyLink, nous accordons une grande importance à la protection de votre vie
            privée. Cette politique de confidentialité explique comment nous collectons, utilisons,
            partageons et protégeons vos informations personnelles lorsque vous utilisez notre
            plateforme.
          </p>
          <p>
            En utilisant StudyLink, vous acceptez les pratiques décrites dans cette politique de
            confidentialité. Nous nous réservons le droit de modifier cette politique à tout moment.
            Toute modification sera publiée sur cette page, et nous vous encourageons à la consulter
            régulièrement.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Informations que nous collectons</h2>
          <p className="mb-2">
            Pour fournir nos services, nous collectons les types d&apos;informations suivants :
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Informations d&apos;inscription :</strong> Lorsque vous créez un compte sur
              StudyLink, nous collectons votre nom, prénom, adresse e-mail, et statut (étudiant,
              représentant d&apos;entreprise).
            </li>
            <li>
              <strong>Informations de profil :</strong> Vous pouvez choisir de fournir des
              informations supplémentaires telles que votre photo de profil, CV, compétences,
              expériences professionnelles, et préférences professionnelles.
            </li>
            <li>
              <strong>Informations d&apos;authentification :</strong> Si vous vous connectez via des
              services tiers comme Google, nous recevons certaines informations de ces services
              conformément aux autorisations que vous avez accordées.
            </li>
            <li>
              <strong>Données d&apos;utilisation :</strong> Nous collectons des informations sur la
              façon dont vous interagissez avec notre plateforme, comme les pages visitées, les
              offres consultées, et les actions effectuées.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Comment nous utilisons vos informations</h2>
          <p className="mb-2">Nous utilisons vos informations pour :</p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Fournir, améliorer et personnaliser nos services</li>
            <li>Faciliter la mise en relation entre étudiants et entreprises</li>
            <li>
              Vous envoyer des communications importantes concernant votre compte ou notre
              plateforme
            </li>
            <li>
              Vous proposer des offres pertinentes en fonction de votre profil et de vos préférences
            </li>
            <li>Assurer la sécurité de notre plateforme et prévenir les fraudes</li>
            <li>Analyser et améliorer l&apos;expérience utilisateur de notre plateforme</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Partage d&apos;informations</h2>
          <p className="mb-4">
            Nous partageons vos informations uniquement dans les circonstances suivantes :
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <strong>Avec les entreprises et écoles partenaires :</strong> Si vous êtes étudiant,
              votre profil et vos informations professionnelles peuvent être partagés avec les
              entreprises utilisant notre plateforme. De même, les informations des entreprises sont
              partagées avec les étudiants.
            </li>
            <li>
              <strong>Avec nos prestataires de services :</strong> Nous travaillons avec des
              entreprises tierces qui nous aident à fournir et améliorer nos services (hébergement,
              analyse, etc.).
            </li>
            <li>
              <strong>Si requis par la loi :</strong> Nous pouvons divulguer vos informations si
              nous sommes légalement tenus de le faire ou si nous pensons de bonne foi que cette
              divulgation est nécessaire pour protéger nos droits, votre sécurité ou celle
              d&apos;autrui.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour
            protéger vos informations contre tout accès non autorisé, modification, divulgation ou
            destruction. Cependant, aucune méthode de transmission sur Internet ou de stockage
            électronique n&apos;est totalement sécurisée, et nous ne pouvons garantir la sécurité
            absolue de vos données.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Conservation des données</h2>
          <p>
            Nous conservons vos informations aussi longtemps que nécessaire pour fournir nos
            services et respecter nos obligations légales. Si vous souhaitez supprimer votre compte,
            certaines informations peuvent être conservées pour des raisons légales ou
            administratives.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Vos droits</h2>
          <p className="mb-4">
            Selon votre lieu de résidence, vous pouvez avoir certains droits concernant vos données
            personnelles, notamment :
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>Accéder à vos données personnelles</li>
            <li>Rectifier des informations inexactes</li>
            <li>Supprimer vos données (dans certaines circonstances)</li>
            <li>Limiter le traitement de vos données</li>
            <li>Recevoir vos données dans un format structuré (portabilité)</li>
            <li>Vous opposer au traitement de vos données</li>
          </ul>
          <p className="mt-4">
            Pour exercer ces droits, contactez-nous à l&apos;adresse email privacy@studylink.com.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Transferts internationaux</h2>
          <p>
            Nos services peuvent être fournis en utilisant des ressources et serveurs situés dans
            différents pays. Vos données peuvent être transférées et traitées en dehors du pays où
            vous résidez, y compris aux États-Unis. Dans ces cas, nous nous assurons qu&apos;un
            niveau de protection adéquat est appliqué à vos données conformément aux lois
            applicables.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Utilisation par les mineurs</h2>
          <p>
            Nos services ne s&apos;adressent pas aux personnes de moins de 16 ans. Nous ne
            collectons pas sciemment des informations personnelles auprès d&apos;enfants de moins de
            16 ans. Si vous apprenez qu&apos;un enfant nous a fourni des informations personnelles
            sans consentement parental, veuillez nous contacter.
          </p>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">Contact</h2>
          <p>
            Si vous avez des questions concernant cette politique de confidentialité ou nos
            pratiques en matière de protection des données, veuillez nous contacter à
            privacy@studylink.com.
          </p>
        </section>
      </div>

      <div className="mt-12 flex justify-center">
        <Button asChild variant="outline">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </div>
  );
}
