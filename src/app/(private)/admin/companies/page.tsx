'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Search } from 'lucide-react';

interface Company {
  id: string;
  name: string;
  sector?: string;
  companyOwners: {
    user: {
      firstname: string;
      lastname: string;
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
      <h1 className="text-2xl font-bold mb-6">Liste des Entreprises</h1>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table des entreprises */}
      <div className="border rounded-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propriétaire
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Secteur
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
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
                  <td className="px-6 py-4 whitespace-nowrap">{company.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.companyOwners &&
                    company.companyOwners.length > 0 &&
                    company.companyOwners[0]?.user
                      ? `${company.companyOwners[0].user.firstname} ${company.companyOwners[0].user.lastname}`
                      : 'Non assigné'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {company.sector || 'Non spécifié'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
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

      {/* Pagination */}
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
