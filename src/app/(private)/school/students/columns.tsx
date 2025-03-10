'use client';

import { Student, User } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

type StudentWithUser = Student & {
  user: User;
};

export const columns: ColumnDef<StudentWithUser>[] = [
  {
    accessorKey: 'user',
    header: 'Étudiant',
    cell: ({ row }) => {
      const user = row.getValue('user') as User;
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user.profilePicture || ''} />
            <AvatarFallback>
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">
              {user.firstName} {user.lastName}
            </div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'studentEmail',
    header: 'Email étudiant',
  },
  {
    accessorKey: 'status',
    header: 'Statut',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      return (
        <Badge variant={status === 'ACTIVE' ? 'success' : 'destructive'}>
          {status === 'ACTIVE' ? 'Actif' : 'Inactif'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'skills',
    header: 'Compétences',
    cell: ({ row }) => {
      const skills = (row.getValue('skills') as string).split(',');
      return (
        <div className="flex flex-wrap gap-1">
          {skills.map((skill, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {skill.trim()}
            </Badge>
          ))}
        </div>
      );
    },
  },
  {
    accessorKey: 'availability',
    header: 'Disponibilité',
    cell: ({ row }) => {
      const availability = row.getValue('availability') as boolean;
      return (
        <Badge variant={availability ? 'success' : 'destructive'}>
          {availability ? 'Disponible' : 'Non disponible'}
        </Badge>
      );
    },
  },
];
