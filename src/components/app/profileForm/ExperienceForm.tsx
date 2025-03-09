import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PlusCircle, Trash2 } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// npm install react-day-picker date-fns @radix-ui/react-popover

type SimpleExperience = {
  id: string;
  company: string;
  position: string;
  period: string;
  type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
  startDate?: Date;
  endDate?: Date;
};

interface ExperienceFormProps {
  experiences: SimpleExperience[];
  onChange: (experiences: SimpleExperience[]) => void;
}

export default function ExperienceForm({ experiences, onChange }: ExperienceFormProps) {
  const [showDatePickers, setShowDatePickers] = useState(true);

  // Charger les expériences depuis localStorage au chargement du composant
  useEffect(() => {
    const loadExperiencesFromStorage = () => {
      try {
        const storedExperiences = localStorage.getItem('userExperiences');
        if (storedExperiences && experiences.length === 0) {
          const parsedExperiences = JSON.parse(storedExperiences);
          // Convertir les dates de chaînes en objets Date
          const formattedExperiences = parsedExperiences.map(
            (exp: {
              id: string;
              company: string;
              position: string;
              period: string;
              type: 'Stage' | 'Alternance' | 'CDI' | 'CDD' | 'Autre';
              startDate?: string;
              endDate?: string;
            }) => ({
              ...exp,
              startDate: exp.startDate ? new Date(exp.startDate) : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            }),
          );
          onChange(formattedExperiences);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des expériences depuis localStorage:', error);
      }
    };

    loadExperiencesFromStorage();
  }, [experiences.length, onChange]);

  // Sauvegarder les expériences dans localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem('userExperiences', JSON.stringify(experiences));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des expériences dans localStorage:', error);
    }
  }, [experiences]);

  const handleAddExperience = () => {
    const newExperience: SimpleExperience = {
      id: `exp-${Date.now()}`,
      company: '',
      position: '',
      period: '',
      type: 'Stage',
    };
    onChange([...experiences, newExperience]);
  };

  const handleRemoveExperience = (id: string) => {
    onChange(experiences.filter((exp) => exp.id !== id));
  };

  const handleUpdateExperience = (id: string, field: keyof SimpleExperience, value: unknown) => {
    onChange(
      experiences.map((exp) => {
        if (exp.id === id) {
          const updatedExp = { ...exp, [field]: value };

          // Mettre à jour la période si les dates sont définies
          if (field === 'startDate' || field === 'endDate') {
            const startDateStr = updatedExp.startDate
              ? format(updatedExp.startDate, 'MMMM yyyy', { locale: fr })
              : '';
            const endDateStr = updatedExp.endDate
              ? format(updatedExp.endDate, 'MMMM yyyy', { locale: fr })
              : 'Présent';
            updatedExp.period =
              startDateStr && (endDateStr || 'Présent') ? `${startDateStr} - ${endDateStr}` : '';
          }

          return updatedExp;
        }
        return exp;
      }),
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Expériences professionnelles</h3>
        <Button
          variant="outline"
          size="sm"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setShowDatePickers(!showDatePickers);
          }}
          className="text-xs"
        >
          {showDatePickers ? 'Saisie manuelle' : 'Sélecteur de date'}
        </Button>
      </div>

      {experiences.length === 0 ? (
        <div className="rounded-md border bg-gray-50 py-8 text-center">
          <div className="text-muted-foreground mb-4">Aucune expérience ajoutée</div>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.preventDefault();
              handleAddExperience();
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter votre première expérience
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((experience) => (
            <div
              key={experience.id}
              className="space-y-4 rounded-md border p-4 transition-colors hover:border-gray-300"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  {experience.company || 'Nouvelle expérience'}
                  {experience.position && ` - ${experience.position}`}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemoveExperience(experience.id);
                  }}
                  className="text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor={`company-${experience.id}`}>Entreprise</Label>
                  <Input
                    id={`company-${experience.id}`}
                    value={experience.company}
                    onChange={(e) =>
                      handleUpdateExperience(experience.id, 'company', e.target.value)
                    }
                    placeholder="Nom de l'entreprise"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`position-${experience.id}`}>Poste</Label>
                  <Input
                    id={`position-${experience.id}`}
                    value={experience.position}
                    onChange={(e) =>
                      handleUpdateExperience(experience.id, 'position', e.target.value)
                    }
                    placeholder="Intitulé du poste"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor={`type-${experience.id}`}>Type</Label>
                  <Select
                    value={experience.type}
                    onValueChange={(value) => handleUpdateExperience(experience.id, 'type', value)}
                  >
                    <SelectTrigger id={`type-${experience.id}`}>
                      <SelectValue placeholder="Type de contrat" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stage">Stage</SelectItem>
                      <SelectItem value="Alternance">Alternance</SelectItem>
                      <SelectItem value="CDI">CDI</SelectItem>
                      <SelectItem value="CDD">CDD</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showDatePickers ? (
                  <>
                    <div className="space-y-2">
                      <Label>Date de début</Label>
                      <DatePicker
                        selected={experience.startDate}
                        onChange={(date) =>
                          handleUpdateExperience(experience.id, 'startDate', date)
                        }
                        placeholder="Sélectionner une date"
                        showMonthYearPicker
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Date de fin</Label>
                      <div className="space-y-1">
                        <DatePicker
                          selected={experience.endDate}
                          onChange={(date) =>
                            handleUpdateExperience(experience.id, 'endDate', date)
                          }
                          placeholder="Présent / À définir"
                          showMonthYearPicker
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          type="button"
                          className="mt-1 h-7 w-full text-xs"
                          onClick={(e) => {
                            e.preventDefault();
                            handleUpdateExperience(experience.id, 'endDate', undefined);
                          }}
                        >
                          Marquer comme &quot;Présent&quot;
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor={`period-${experience.id}`}>Période</Label>
                    <Input
                      id={`period-${experience.id}`}
                      value={experience.period}
                      onChange={(e) =>
                        handleUpdateExperience(experience.id, 'period', e.target.value)
                      }
                      placeholder="Ex: Juin 2022 - Août 2022"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={(e) => {
              e.preventDefault();
              handleAddExperience();
            }}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Ajouter une expérience
          </Button>
        </div>
      )}
    </div>
  );
}
