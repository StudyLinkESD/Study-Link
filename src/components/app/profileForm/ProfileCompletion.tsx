import { AlertCircle, CheckCircle2 } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ProfileField {
  name: string;
  completed: boolean;
  required: boolean;
}

interface ProfileCompletionProps {
  fields: ProfileField[];
}

export default function ProfileCompletion({ fields }: ProfileCompletionProps) {
  const requiredFields = fields.filter((field) => field.required);
  const completedRequiredFields = requiredFields.filter((field) => field.completed);
  const completedOptionalFields = fields.filter((field) => !field.required && field.completed);

  const requiredProgress = Math.round(
    (completedRequiredFields.length / requiredFields.length) * 100,
  );
  const totalProgress = Math.round(
    ((completedRequiredFields.length + completedOptionalFields.length) / fields.length) * 100,
  );

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Progression du profil</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Informations requises</span>
              <span className="font-medium">{requiredProgress}%</span>
            </div>
            <Progress value={requiredProgress} className="h-2" />
          </div>

          <div>
            <div className="mb-2 flex justify-between text-sm">
              <span>Profil complet</span>
              <span className="font-medium">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>

          <div className="mt-4 space-y-2">
            {fields.map((field, index) => (
              <div key={index} className="flex items-center text-sm">
                {field.completed ? (
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="mr-2 h-4 w-4 text-yellow-500" />
                )}
                <span className={field.completed ? 'text-muted-foreground' : 'font-medium'}>
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
