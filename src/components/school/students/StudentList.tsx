'use client';

import { Student, User } from '@prisma/client';
import { Mail, Search } from 'lucide-react';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type StudentWithUser = Student & {
  user: User;
};

interface StudentListProps {
  initialStudents: StudentWithUser[];
}

const ITEMS_PER_PAGE = 10;

export function StudentList({ initialStudents }: StudentListProps) {
  const [students] = useState<StudentWithUser[]>(initialStudents);
  const [filteredStudents, setFilteredStudents] = useState<StudentWithUser[]>(initialStudents);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const filtered = students.filter((student) => {
      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'active'
            ? student.status === 'ACTIVE'
            : student.status !== 'ACTIVE';

      const matchesAvailability =
        availabilityFilter === 'all'
          ? true
          : availabilityFilter === 'available'
            ? student.availability
            : !student.availability;

      const matchesSearch =
        searchTerm === ''
          ? true
          : student.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.skills.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesStatus && matchesAvailability && matchesSearch;
    });

    setFilteredStudents(filtered);
    setCurrentPage(1);
  }, [students, statusFilter, availabilityFilter, searchTerm]);

  const displayedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actifs</SelectItem>
              <SelectItem value="inactive">Inactifs</SelectItem>
            </SelectContent>
          </Select>

          <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrer par disponibilité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes disponibilités</SelectItem>
              <SelectItem value="available">Disponibles</SelectItem>
              <SelectItem value="unavailable">Non disponibles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            type="text"
            placeholder="Rechercher un étudiant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-16 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Étudiant
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Compétences
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Statut
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Disponibilité
              </th>
              <th className="w-[200px] px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {displayedStudents.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center">
                  Aucun étudiant trouvé
                </td>
              </tr>
            ) : (
              displayedStudents.map((student) => (
                <tr key={student.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                      {student.user.profilePicture ? (
                        <Image
                          src={student.user.profilePicture}
                          alt={`${student.user.firstName} ${student.user.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-semibold text-gray-500">
                          {student.user.firstName?.[0] || ''}
                          {student.user.lastName?.[0] || ''}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {student.user.firstName} {student.user.lastName}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="text-sm text-gray-500">{student.studentEmail}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.skills.split(',').map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={student.status === 'ACTIVE' ? 'success' : 'destructive'}>
                      {student.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Badge variant={student.availability ? 'success' : 'destructive'}>
                      {student.availability ? 'Disponible' : 'Non disponible'}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex justify-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`mailto:${student.studentEmail}`} className="flex items-center">
                          <Mail className="mr-2 h-4 w-4" />
                          Contacter
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Précédent
          </Button>
          <span className="flex items-center px-2">
            Page {currentPage} sur {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
