'use client';

import { AuthorizedSchoolDomain } from '@prisma/client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { EditSchoolForm } from './EditSchoolForm';

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
    return <div className="py-4 text-center">Chargement...</div>;
  }

  if (error) {
    return (
      <div className="py-4 text-center">
        <div className="mb-2 text-red-600">{error}</div>
        <Button onClick={() => fetchSchools(activeFilter)} variant="outline">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
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
              <div className="flex w-20 items-center justify-center border-r bg-gray-50 p-3">
                {school.logo ? (
                  <Image
                    src={school.logo}
                    alt={school.name}
                    className="max-h-full max-w-full object-contain"
                    width={80}
                    height={80}
                  />
                ) : (
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-400">
                    {school.name.charAt(0)}
                  </div>
                )}
              </div>

              <div className="flex flex-grow items-center justify-between px-6 py-2">
                <div className="flex items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{school.name}</h3>
                    <p className="text-sm text-gray-500">{school.domain.domain}</p>
                  </div>
                  <Badge variant={school.isActive ? 'success' : 'destructive'} className="ml-2">
                    {school.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

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
