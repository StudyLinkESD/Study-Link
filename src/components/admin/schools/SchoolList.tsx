'use client';

import { AuthorizedSchoolDomain } from '@prisma/client';
import { useEffect, useState } from 'react';
import { EditSchoolForm } from './EditSchoolForm';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Search, Users } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Input } from '@/components/ui/input';
import Link from 'next/link';

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

const ITEMS_PER_PAGE = 10;

export function SchoolList({ onEdit, onEditEnd }: SchoolListProps) {
  const [schools, setSchools] = useState<SchoolWithDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [editingSchool, setEditingSchool] = useState<SchoolWithDomain | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filteredSchools, setFilteredSchools] = useState<SchoolWithDomain[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSchools = async (filter: string) => {
    try {
      const queryParams = filter !== 'all' ? `?isActive=${filter === 'active'}` : '';
      const response = await fetch(`/api/schools${queryParams}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setSchools(data);
      setFilteredSchools(data);
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

  useEffect(() => {
    const filtered = schools.filter((school) => {
      const matchesFilter =
        activeFilter === 'all'
          ? true
          : activeFilter === 'active'
            ? school.isActive
            : !school.isActive;
      const matchesSearch =
        searchTerm === ''
          ? true
          : school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            school.domain.domain.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
    setFilteredSchools(filtered);
    setCurrentPage(1);
  }, [schools, activeFilter, searchTerm]);

>>>>>>> e0760dd (:sparkles: added actions on schools list && added a start of company / users lists)
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

  const displayedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const displayedSchools = filteredSchools.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4">
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

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher une école..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Logo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Domaine
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-[340px]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : displayedSchools.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Aucune école trouvée
                </td>
              </tr>
            ) : (
              displayedSchools.map((school) => (
                <tr key={school.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {school.logo ? (
                        <Image
                          src={school.logo}
                          alt={school.name}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-lg font-semibold">
                          {school.name.charAt(0)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{school.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{school.domain.domain}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={school.isActive ? 'success' : 'destructive'}>
                      {school.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/users?type=student&school=${school.id}`}
                          className="flex items-center"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Étudiants
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <Link
                          href={`/admin/users?type=school_owner&school=${school.id}`}
                          className="flex items-center"
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Administrateurs
                        </Link>
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingSchool(school)}>
                        Modifier
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredSchools.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredSchools.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
