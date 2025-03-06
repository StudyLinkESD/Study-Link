'use client';

import { AuthorizedSchoolDomain } from '@prisma/client';
import { useEffect, useState } from 'react';
import { EditSchoolForm } from './EditSchoolForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

type SchoolWithDomain = {
  id: string;
  name: string;
  domainId: string;
  logo: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  domain: AuthorizedSchoolDomain;
};

interface SchoolListProps {
  onEdit: () => void;
  onEditEnd: () => void;
}

export function SchoolList({ onEdit, onEditEnd }: SchoolListProps) {
  const [schools, setSchools] = useState<SchoolWithDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [editingSchool, setEditingSchool] = useState<SchoolWithDomain | null>(null);

  const fetchSchools = async (filter: string) => {
    try {
      const queryParams = filter !== 'all' ? `?isActive=${filter === 'active'}` : '';
      const response = await fetch(`/api/schools${queryParams}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSchools(data);
      setError(null);
    } catch (error) {
      console.error('Erreur lors de la récupération des écoles:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'Une erreur est survenue lors du chargement des écoles',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchools(activeFilter);
  }, [activeFilter]);

  const handleEditSuccess = () => {
    setEditingSchool(null);
    onEditEnd();
    fetchSchools(activeFilter);
  };

  useEffect(() => {
    if (editingSchool) {
      onEdit();
    }
  }, [editingSchool, onEdit]);

  if (editingSchool) {
    return (
      <div>
        <EditSchoolForm
          school={editingSchool}
          onSuccess={handleEditSuccess}
          onCancel={() => {
            setEditingSchool(null);
            onEditEnd();
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <div className="text-red-600 mb-2">{error}</div>
        <Button onClick={() => fetchSchools(activeFilter)} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select value={activeFilter} onValueChange={setActiveFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les écoles</SelectItem>
            <SelectItem value="active">Écoles actives</SelectItem>
            <SelectItem value="inactive">Écoles inactives</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {schools.map((school) => (
          <Card key={school.id} className="overflow-hidden py-0">
            <div className="flex items-stretch">
              {/* Section logo */}
              <div className="w-20 bg-gray-50 p-3 flex items-center justify-center border-r">
                {school.logo ? (
                  <Image
                    src={school.logo}
                    alt={school.name}
                    className="max-w-full max-h-full object-contain"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400">
                    {school.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Section informations */}
              <div className="flex-grow px-6 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-500">{school.domain.domain}</p>
                  </div>
                  <Badge variant={school.isActive ? 'success' : 'destructive'} className="ml-2">
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                {/* Section actions */}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingSchool(school)}>
                    Modifier
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
        {schools.length === 0 && (
          <Card className="p-6">
            <p className="text-center text-gray-500">Aucune école trouvée</p>
          </Card>
        )}
      </div>
    </div>
  );
}
