import Link from "next/link";
import { UserX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function StudentNotFound() {
  return (
    <div className="container mx-auto py-16 px-4 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted">
        <UserX className="h-10 w-10 text-muted-foreground" />
      </div>
      
      <h2 className="mt-6 text-2xl font-semibold tracking-tight">
        Profil non trouvé
      </h2>
      
      <p className="mt-2 text-muted-foreground">
        Désolé, le profil étudiant que vous recherchez nexiste pas ou a été supprimé.
      </p>
      
      <Button asChild className="mt-8">
        <Link href="/students">
          Retour à la liste des étudiants
        </Link>
      </Button>
    </div>
  );
}