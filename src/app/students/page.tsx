import StudentList from "@/components/app/students/StudentList";

const exampleStudents = [
  {
    id: "1",
    firstName: "Thomas",
    lastName: "Dubois",
    photoUrl: "",
    status: "Alternant" as const,
    skills: [
      { id: "react", name: "React" },
      { id: "javascript", name: "JavaScript" },
    ],
    availability: "Septembre 2025",
    school: "École Supérieure de Développement Web"
  },
];

export default function StudentsPage() {
  return (
    <main>
      <StudentList 
        students={exampleStudents} 
        title="Découvrez nos étudiants"
      />
    </main>
  );
}