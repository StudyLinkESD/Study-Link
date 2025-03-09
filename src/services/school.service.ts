import { prisma } from '@/lib/prisma';

export async function getAllSchools() {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
        domain: {
          select: {
            domain: true,
          },
        },
      },
    });
    return schools;
  } catch (error) {
    console.error('Error fetching schools:', error);
    throw new Error('Failed to fetch schools');
  }
}

export async function getSchoolByEmailDomain(email: string) {
  try {
    const domain = email.split('@')[1];
    const school = await prisma.school.findFirst({
      where: {
        domain: {
          domain: domain,
        },
      },
      include: {
        domain: true,
      },
    });
    return school;
  } catch (error) {
    console.error('Error fetching school by email domain:', error);
    throw new Error('Failed to fetch school by email domain');
  }
}

export async function validateSchoolEmail(email: string): Promise<boolean> {
  try {
    console.log('Validating email:', email);
    const response = await fetch('/api/validate-school-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();
    console.log('Validation response:', data);

    if (!response.ok) {
      console.error('Validation failed:', data.error);
      return false;
    }

    return data.isValid;
  } catch (error) {
    console.error('Error validating school email:', error);
    return false;
  }
}
