import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Skill = {
  id: string;
  name: string;
};

export type StudentCardProps = {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string;
  status: "Alternant" | "Stagiaire";
  skills: Skill[];
  availability?: string;
  school?: string;
};

export default function StudentCard({
  id,
  firstName,
  lastName,
  photoUrl,
  status,
  skills,
  availability,
  school,
}: StudentCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-gray-200 dark:border-gray-700">
            {photoUrl ? (
              <AvatarImage src={photoUrl} alt={`Photo de ${firstName} ${lastName}`} />
            ) : (
              <AvatarFallback>
                {firstName.charAt(0)}
                {lastName.charAt(0)}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold">
              {firstName} {lastName}
            </h3>
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={status === "Alternant" ? "default" : "secondary"}>
                {status}
              </Badge>
              
              {availability && (
                <span className="text-xs text-muted-foreground">
                  {availability}
                </span>
              )}
            </div>
            
            {school && (
              <span className="text-xs text-muted-foreground mt-1">
                {school}
              </span>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <h4 className="text-sm font-medium mb-2">
            Compétences
          </h4>
          <div className="flex flex-wrap gap-1">
            {skills.slice(0, 5).map((skill) => (
              <Badge key={skill.id} variant="outline" className="text-xs">
                {skill.name}
              </Badge>
            ))}
            {skills.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{skills.length - 5}
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-muted/50 p-3">
        <Link 
          href={`/students/${id}`}
          className="text-sm text-primary hover:underline flex ml-auto items-center"
        >
          Voir le profil
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 ml-1" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5l7 7-7 7" 
            />
          </svg>
        </Link>
      </CardFooter>
    </Card>
  );
}