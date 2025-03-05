import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ProfileField {
  name: string;
  completed: boolean;
  required: boolean;
}

interface ProfileCompletionProps {
  fields: ProfileField[];
}

export default function ProfileCompletion({ fields }: ProfileCompletionProps) {
  const requiredFields = fields.filter(field => field.required);
  const completedRequiredFields = requiredFields.filter(field => field.completed);
  const completedOptionalFields = fields.filter(field => !field.required && field.completed);

  const requiredProgress = Math.round((completedRequiredFields.length / requiredFields.length) * 100);
  const totalProgress = Math.round(
    ((completedRequiredFields.length + completedOptionalFields.length) / fields.length) * 100
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">
          Progression du profil
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Informations requises</span>
              <span className="font-medium">{requiredProgress}%</span>
            </div>
            <Progress value={requiredProgress} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between mb-2 text-sm">
              <span>Profil complet</span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          <div className="mt-4 space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center text-sm">
                {field.completed ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
                )}
                <span className={field.completed ? "text-muted-foreground" : "font-medium"}>
                  {field.name}
                </span>
                {field.required && !field.completed && (
                  <span className="ml-2 text-xs text-red-500">Requis</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 