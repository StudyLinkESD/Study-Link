// src/components/StudentList.tsx
"use client";

import { useState, useEffect } from "react";
import StudentCard, { StudentCardProps } from "./StudentCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

type Student = Omit<StudentCardProps, "skills"> & {
  skills: { id: string; name: string }[];
};

type StudentListProps = {
  students: Student[];
  title?: string;
};

export default function StudentList({ students, title = "Liste des étudiants" }: StudentListProps) {
  const [filteredStudents, setFilteredStudents] = useState<Student[]>(students);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const studentsPerPage = 9;

  // Extraire toutes les compétences uniques pour le filtre
  const allSkills = Array.from(
    new Set(students.flatMap((student) => student.skills.map(s => s.name)))
  ).sort();
  
  // Appliquer les filtres
  useEffect(() => {
    let result = [...students];
    
    // Filtre par statut
    if (statusFilter !== "all") {
      result = result.filter((student) => student.status === statusFilter);
    }
    
    // Filtre par terme de recherche (prénom, nom ou école)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(
        (student) =>
          student.firstName.toLowerCase().includes(searchLower) ||
          student.lastName.toLowerCase().includes(searchLower) ||
          (student.school && student.school.toLowerCase().includes(searchLower))
      );
    }
    
    // Filtre par compétences sélectionnées
    if (selectedSkills.length > 0) {
      result = result.filter((student) =>
        selectedSkills.every((skill) =>
          student.skills.some((s) => s.name.toLowerCase() === skill.toLowerCase())
        )
      );
    }
    
    setFilteredStudents(result);
    setCurrentPage(1); // Réinitialiser à la première page après chaque filtre
  }, [statusFilter, searchTerm, selectedSkills, students]);
  
  // Calculer la pagination
  const indexOfLastStudent = currentPage * studentsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  
  // Ajouter une compétence au filtre
  const addSkillFilter = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };
  
  // Retirer une compétence du filtre
  const removeSkillFilter = (skill: string) => {
    setSelectedSkills(selectedSkills.filter((s) => s !== skill));
  };
  
  // Réinitialiser tous les filtres
  const resetFilters = () => {
    setStatusFilter("all");
    setSearchTerm("");
    setSelectedSkills([]);
  };
  
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
        <p className="text-muted-foreground">
          {filteredStudents.length} étudiant{filteredStudents.length !== 1 ? "s" : ""} trouvé{filteredStudents.length !== 1 ? "s" : ""}
        </p>
      </div>
      
      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="all" className="w-full" onValueChange={setStatusFilter}>
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
              <TabsList>
                <TabsTrigger value="all">Tous</TabsTrigger>
                <TabsTrigger value="Alternant">Alternants</TabsTrigger>
                <TabsTrigger value="Stagiaire">Stagiaires</TabsTrigger>
              </TabsList>
              
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            {/* Filtres de compétences */}
            <div className="mb-4">
              <Label className="mb-2 block">Filtrer par compétences</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="px-2 py-1">
                    {skill}
                    <button
                      onClick={() => removeSkillFilter(skill)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Select onValueChange={addSkillFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Ajouter une compétence" />
                </SelectTrigger>
                <SelectContent>
                  {allSkills
                    .filter((skill) => !selectedSkills.includes(skill))
                    .map((skill) => (
                      <SelectItem key={skill} value={skill}>
                        {skill}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedSkills.length > 0 || searchTerm || statusFilter !== "all" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="mb-4"
              >
                Réinitialiser les filtres
              </Button>
            ) : null}
            
            <TabsContent value="all" className="mt-0">
              {renderStudentGrid()}
            </TabsContent>
            <TabsContent value="Alternant" className="mt-0">
              {renderStudentGrid()}
            </TabsContent>
            <TabsContent value="Stagiaire" className="mt-0">
              {renderStudentGrid()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6">
          <nav className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Précédent
            </Button>
            
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Suivant
            </Button>
          </nav>
        </div>
      )}
    </div>
  );
  
  function renderStudentGrid() {
    if (currentStudents.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <Search className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Aucun étudiant trouvé</h3>
          <p className="text-muted-foreground">
            Aucun étudiant ne correspond à vos critères de recherche.
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentStudents.map((student) => (
          <StudentCard
            key={student.id}
            {...student}
          />
        ))}
      </div>
    );
  }
}