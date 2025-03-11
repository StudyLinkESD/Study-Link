import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components';

import * as React from 'react';

interface JobApplicationEmailProps {
  companyName: string;
  jobTitle: string;
  studentName: string;
  studentEmail: string;
  subject: string;
  message: string;
  applicationUrl: string;
}

export default function JobApplicationEmail({
  companyName,
  jobTitle,
  studentName,
  studentEmail,
  subject,
  message,
  applicationUrl,
}: JobApplicationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Nouvelle candidature pour votre offre: {jobTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logoText}>StudyLink</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={greeting}>Bonjour {companyName} 👋</Heading>
            <Text style={paragraph}>
              Vous avez reçu une nouvelle candidature pour votre offre <strong>{jobTitle}</strong>.
            </Text>

            <Text style={subheading}>Informations sur le candidat:</Text>
            <Text style={paragraph}>
              <strong>Nom:</strong> {studentName}
              <br />
              <strong>Email:</strong> {studentEmail}
            </Text>

            <Text style={subheading}>Message du candidat:</Text>
            <Text style={paragraph}>
              <strong>Objet:</strong> {subject}
            </Text>
            <Text style={messageBox}>{message}</Text>

            <Button style={button} href={applicationUrl}>
              Voir la candidature
            </Button>

            <Hr style={hr} />

            <Text style={footer}>
              Cet email a été envoyé automatiquement par StudyLink. Pour gérer vos préférences de
              notification, connectez-vous à votre compte.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f5f5f5',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const container = {
  margin: '40px auto',
  padding: '20px 0 48px',
  maxWidth: '560px',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
};

const logoSection = {
  padding: '0 48px',
  marginBottom: '40px',
};

const logoText = {
  fontSize: '32px',
  fontWeight: '700',
  color: '#000000',
  textAlign: 'center' as const,
  margin: '0',
};

const contentSection = {
  padding: '0 48px',
};

const greeting = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#1a1a1a',
  margin: '0 0 20px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4b5563',
  margin: '0 0 24px',
};

const subheading = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#1a1a1a',
  margin: '0 0 12px',
};

const messageBox = {
  fontSize: '16px',
  lineHeight: '24px',
  color: '#4b5563',
  backgroundColor: '#f9fafb',
  padding: '16px',
  borderRadius: '6px',
  border: '1px solid #e5e7eb',
  margin: '0 0 24px',
  whiteSpace: 'pre-wrap' as const,
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '500',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  padding: '12px 20px',
  marginBottom: '32px',
  border: 'none',
  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
};

const hr = {
  borderColor: '#e5e7eb',
  margin: '32px 0',
};

const footer = {
  fontSize: '12px',
  lineHeight: '16px',
  color: '#6b7280',
  margin: '0',
};
