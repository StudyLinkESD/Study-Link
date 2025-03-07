import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: "Conditions d'utilisation | StudyLink",
  description:
    "Conditions d'utilisation de StudyLink - Les règles qui régissent l'utilisation de notre plateforme",
};

export default function TermsOfServicePage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Conditions d&apos;utilisation</h1>
        <p className="text-muted-foreground">
          Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptation des conditions</h2>
          <p className="mb-4">
            En accédant ou en utilisant la plateforme StudyLink, vous acceptez d&apos;être lié par
            ces conditions d&apos;utilisation. Si vous n&apos;acceptez pas ces conditions, veuillez
            ne pas utiliser notre plateforme.
          </p>
          <p>
            Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications
            prendront effet dès leur publication sur la plateforme. Votre utilisation continue de
            StudyLink après la publication des modifications constitue votre acceptation de ces
            modifications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description du service</h2>
          <p>
            StudyLink est une plateforme qui met en relation des étudiants à la recherche de stages
            ou d&apos;alternances avec des entreprises proposant des opportunités professionnelles.
            Nous facilitons cette mise en relation en permettant aux étudiants de créer des profils
            professionnels et aux entreprises de publier des offres d&apos;emploi. StudyLink
            n&apos;est pas un employeur et n&apos;intervient pas dans les relations contractuelles
            entre les utilisateurs de la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Inscription et comptes utilisateurs</h2>
          <p className="mb-4">
            Pour utiliser certaines fonctionnalités de StudyLink, vous devez créer un compte. Lors
            de l&apos;inscription, vous acceptez de fournir des informations exactes, complètes et à
            jour. Vous êtes responsable de la confidentialité de votre compte et de toutes les
            activités qui s&apos;y déroulent.
          </p>
          <p>
            Nous nous réservons le droit de refuser l&apos;accès, de fermer un compte ou de
            supprimer du contenu à notre seule discrétion, notamment en cas de violation de ces
            conditions d&apos;utilisation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Contenu utilisateur</h2>
          <p className="mb-4">
            En soumettant du contenu sur StudyLink (profils, descriptions, images, etc.), vous nous
            accordez une licence mondiale, non exclusive, gratuite, transférable et pouvant faire
            l&apos;objet d&apos;une sous-licence pour utiliser, reproduire, modifier, adapter,
            publier, traduire, distribuer et afficher ce contenu dans le cadre des services de la
            plateforme.
          </p>
          <p className="mb-4">Vous déclarez et garantissez que :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>
              Vous possédez ou avez obtenu tous les droits nécessaires pour le contenu que vous
              publiez
            </li>
            <li>Le contenu ne porte pas atteinte aux droits d&apos;un tiers</li>
            <li>
              Le contenu n&apos;est pas illégal, obscène, diffamatoire, menaçant, invasif de la vie
              privée, ou autrement répréhensible
            </li>
          </ul>
          <p className="mt-4">
            Nous nous réservons le droit de supprimer tout contenu qui viole ces conditions ou que
            nous jugeons répréhensible à notre seule discrétion.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Comportement des utilisateurs</h2>
          <p className="mb-4">En utilisant StudyLink, vous acceptez de ne pas :</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Utiliser notre service à des fins illégales ou non autorisées</li>
            <li>Violer les lois locales, nationales ou internationales applicables</li>
            <li>
              Usurper l&apos;identité d&apos;une personne ou entité, ou falsifier votre affiliation
              avec une personne ou entité
            </li>
            <li>Collecter ou suivre les informations personnelles d&apos;autres utilisateurs</li>
            <li>Publier des offres frauduleuses ou trompeuses</li>
            <li>Harceler, intimider ou discriminer d&apos;autres utilisateurs</li>
            <li>Interférer avec ou perturber le fonctionnement de notre service</li>
            <li>Engager des activités de spam ou de phishing</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Propriété intellectuelle</h2>
          <p className="mb-4">
            Le service StudyLink et son contenu original, fonctionnalités et fonctionnalités sont et
            resteront la propriété exclusive de StudyLink et de ses concédants de licence. Le
            service est protégé par le droit d&apos;auteur, les marques de commerce et d&apos;autres
            lois en France et à l&apos;étranger.
          </p>
          <p>
            Nos marques et notre habillage commercial ne peuvent pas être utilisés en relation avec
            un produit ou service sans notre consentement écrit préalable.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Vie privée</h2>
          <p>
            Votre utilisation de notre service est également régie par notre politique de
            confidentialité, que vous pouvez consulter{' '}
            <Link href="/privacy-policy" className="text-primary hover:underline">
              ici
            </Link>
            . En utilisant StudyLink, vous consentez à la collecte et à l&apos;utilisation de vos
            informations conformément à cette politique.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Limitation de responsabilité</h2>
          <p className="mb-4">
            StudyLink est fourni &quot;tel quel&quot; et &quot;tel que disponible&quot; sans
            garanties d&apos;aucune sorte, expresses ou implicites. Nous ne garantissons pas que
            notre service sera ininterrompu, opportun, sécurisé ou sans erreur.
          </p>
          <p className="mb-4">
            En aucun cas, StudyLink, ses dirigeants, administrateurs, employés ou agents ne seront
            responsables des dommages indirects, punitifs, accessoires, spéciaux, consécutifs ou
            exemplaires, y compris, sans limitation, des dommages pour perte de profits, de
            clientèle, d&apos;utilisation, de données ou d&apos;autres pertes intangibles résultant
            de :
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Votre utilisation ou incapacité à utiliser notre service</li>
            <li>Tout contenu obtenu à partir du service</li>
            <li>Accès non autorisé ou altération de vos transmissions ou données</li>
            <li>Les déclarations ou comportements de tiers sur le service</li>
            <li>Les relations entre utilisateurs établies via notre plateforme</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Indemnisation</h2>
          <p>
            Vous acceptez d&apos;indemniser, de défendre et de dégager de toute responsabilité
            StudyLink et ses filiales, affiliés, dirigeants, agents, co-marques ou autres
            partenaires et employés, contre toute réclamation, dommage, obligation, perte,
            responsabilité, coût ou dette, et dépense (y compris mais non limité aux honoraires
            d&apos;avocat) découlant de votre utilisation ou accès au service, de votre violation
            des présentes conditions, ou de votre violation des droits d&apos;un tiers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Résiliation</h2>
          <p className="mb-4">
            Nous pouvons résilier ou suspendre votre compte et votre accès à StudyLink
            immédiatement, sans préavis ni responsabilité, pour quelque raison que ce soit, y
            compris, sans limitation, si vous violez les conditions d&apos;utilisation.
          </p>
          <p>
            Vous pouvez également désactiver votre compte à tout moment via les paramètres de votre
            compte. Après la résiliation, votre droit d&apos;utiliser le service cessera
            immédiatement. Certaines dispositions des conditions d&apos;utilisation qui, par leur
            nature, devraient survivre à la résiliation, survivront à la résiliation.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Droit applicable</h2>
          <p>
            Ces conditions sont régies et interprétées conformément aux lois françaises, sans égard
            aux principes de conflits de lois. Notre manquement à faire respecter un droit ou une
            disposition des présentes conditions ne sera pas considéré comme une renonciation à ces
            droits. Si une disposition des présentes conditions est jugée invalide ou inapplicable
            par un tribunal, les dispositions restantes resteront en vigueur.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Contact</h2>
          <p>
            Si vous avez des questions concernant ces conditions d&apos;utilisation, veuillez nous
            contacter à legal@studylink.com.
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
