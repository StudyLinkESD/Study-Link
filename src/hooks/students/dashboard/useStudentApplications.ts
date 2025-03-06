import { useState, useEffect } from 'react';
import { Session } from 'next-auth';

interface JobApplicationsResponse {
  id: string;
  studentId: string;
  jobId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  job: {
    id: string;
    name: string;
    companyId: string;
    company: {
      name: string;
      logoId: string | null;
    };
  };
}

export function useStudentApplications(session: Session | null) {
  const [applications, setApplications] = useState<JobApplicationsResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        if (session?.user?.id) {
          const userResponse = await fetch(`${apiUrl}/users/${session.user.id}`);
          if (!userResponse.ok) throw new Error('Failed to fetch user data');

          const userData = await userResponse.json();

          if (userData.student) {
            const studentId = userData.student.id;

            if (userData.student.jobRequests && userData.student.jobRequests.length > 0) {
              setApplications(userData.student.jobRequests);
            } else {
              const applicationsResponse = await fetch(
                `${apiUrl}/job-requests?studentId=${studentId}`,
              );
              if (!applicationsResponse.ok) throw new Error('Failed to fetch job applications');

              const applicationsData = await applicationsResponse.json();
              setApplications(applicationsData);
            }
          } else {
            console.log("Cet utilisateur n'a pas de profil étudiant");
          }
        }
      } catch (error) {
        console.error('Error fetching student applications:', error);
        // In case of error, keep any existing applications data
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchApplications();
    } else {
      // For development, set loading state after a delay
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [session, apiUrl]);

  return { applications, setApplications, isLoading };
}
