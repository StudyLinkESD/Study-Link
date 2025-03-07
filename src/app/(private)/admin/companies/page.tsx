'use client';

import { Search } from 'lucide-react';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';

interface Company {
  id: string;
  name: string;
  sector?: string;
  companyOwners: {
    user: {
      firstName: string;
      lastName: string;
    };
  }[];
}

const ITEMS_PER_PAGE = 20;

const CompaniesList = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/companies');
      if (!response.ok) throw new Error('Erreur lors du chargement des entreprises');
      const data = await response.json();
      setCompanies(data);
      setFilteredCompanies(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = companies.filter((company) =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
      setFilteredCompanies(filtered);
      setCurrentPage(1);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchTerm, companies]);

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Liste des Entreprises</h1>

      <div className="mb-6 flex gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Rechercher une entreprise..."
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
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Secteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Chargement...
                </td>
              </tr>
            ) : paginatedCompanies.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center">
                  Aucune entreprise trouvée
                </td>
              </tr>
            ) : (
              paginatedCompanies.map((company) => (
                <tr key={company.id}>
                  <td className="whitespace-nowrap px-6 py-4">{company.name}</td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {company.companyOwners &&
                    company.companyOwners.length > 0 &&
                    company.companyOwners[0]?.user
                      ? `${company.companyOwners[0].user.firstName} ${company.companyOwners[0].user.lastName}`
                      : 'Non assigné'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    {company.sector || 'Non spécifié'}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Button variant="ghost" size="sm">
                      Modifier
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredCompanies.length > 0 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE)}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default CompaniesList;
