'use client';

import { useCallback, useEffect, useState } from 'react';
import { userService, UserType } from '@/services/user.service';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Pencil } from 'lucide-react';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Admin, CompanyOwner, School, SchoolOwner, Student, User } from '@prisma/client';
import { Suspense } from 'react';

type AppUser = User & {
  admin: Admin | null;
  schoolOwner: (SchoolOwner & { school: School | null }) | null;
  companyOwner: (CompanyOwner & { company: { id: string; name: string } | null }) | null;
  student: (Student & { school: School | null }) | null;
  firstName: string | null;
  lastName: string | null;
  profilePicture: string | null;
};

const ITEMS_PER_PAGE = 20;

const UsersList = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [currentPage, setCurrentPage] = useState(1);
  const [userType, setUserType] = useState<UserType | 'all'>('all');
  const [school, setSchool] = useState(searchParams.get('school') || 'all');
  const [schools, setSchools] = useState<School[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<AppUser[]>([]);

  const fetchSchools = async () => {
    try {
      const response = await fetch('/api/schools');
      if (!response.ok) throw new Error('Erreur lors du chargement des écoles');
      const data = await response.json();
      setSchools(data);
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getSchoolId = (user: AppUser): string => {
    if (user.schoolOwner?.schoolId) return user.schoolOwner.schoolId;
    if (user.student?.schoolId) return user.student.schoolId;
    return 'all';
  };

  const getUserType = useCallback((user: AppUser): string => {
    if (user.admin && !user.schoolOwner) return 'Administrateur';
    if (user.schoolOwner) return "Propriétaire d'école";
    if (user.companyOwner) return "Propriétaire d'entreprise";
    if (user.student) return 'Étudiant';
    return 'Inconnu';
  }, []);

  const filterAndSetUsers = useCallback(
    (users: AppUser[]) => {
      const filtered = users.filter((user) => {
        const matchesType =
          !userType || getUserType(user).toLowerCase() === userType.replace('_', ' ');
        const matchesSchool = !school || getSchoolId(user) === school;
        const matchesSearch =
          !searchTerm ||
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesSchool && matchesSearch;
      });

      setUsers(filtered);
      setCurrentPage(1);
    },
    [userType, school, searchTerm, getUserType],
  );

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = (await userService.getUsers()) as AppUser[];
      setAllUsers(data);
      filterAndSetUsers(data);
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setIsLoading(false);
    }
  }, [filterAndSetUsers]);

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    filterAndSetUsers(allUsers);
  }, [filterAndSetUsers, allUsers, school, userType, searchTerm]);

  const handleTypeChange = (value: string) => {
    setUserType(value as UserType | 'all');
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('type', value);
    if (value !== 'student') params.delete('school');
    router.push(`?${params.toString()}`);
  };

  const handleSchoolChange = (value: string) => {
    setSchool(value);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.set('school', value);
    router.push(`?${params.toString()}`);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const getUserBadgeVariant = (
    user: AppUser,
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (user.admin && !user.schoolOwner) return 'destructive';
    if (user.schoolOwner) return 'secondary';
    if (user.companyOwner) return 'outline';
    if (user.student) return 'default';
    return 'outline';
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs</h1>

      <div className="flex justify-between items-center gap-4 mb-6">
        <Select value={userType} onValueChange={handleTypeChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Type d'utilisateur" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="school_owner">Propriétaires d&apos;école</SelectItem>
            <SelectItem value="company_owner">Propriétaires d&apos;entreprise</SelectItem>
            <SelectItem value="admin">Administrateurs</SelectItem>
            <SelectItem value="student">Étudiants</SelectItem>
          </SelectContent>
        </Select>

        {userType === 'student' && (
          <Select value={school} onValueChange={handleSchoolChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par école" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les écoles</SelectItem>
              {schools.map((school) => (
                <SelectItem key={school.id} value={school.id}>
                  {school.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table des utilisateurs */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                Photo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {user.profilePicture ? (
                        <Image
                          src={user.profilePicture}
                          alt={`${user.firstName} ${user.lastName}`}
                          width={40}
                          height={40}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-gray-500 text-lg font-semibold">
                          {user.firstName?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getUserBadgeVariant(user)}>{getUserType(user)}</Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination
          currentPage={currentPage}
          totalPages={Math.ceil(users.length / ITEMS_PER_PAGE)}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

const UsersPage = () => {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <UsersList />
    </Suspense>
  );
};

export default UsersPage;
