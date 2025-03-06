import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface EmailTemplateProps {
  url: string;
  firstname?: string;
}

export default function AuthenticateEmail({ url }: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Votre lien de connexion StudyLink</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logoSection}>
            <Heading style={logoText}>StudyLink</Heading>
          </Section>

          <Section style={contentSection}>
            <Heading style={greeting}>Bonjour 👋</Heading>
            <Text style={paragraph}>
              Cliquez sur le bouton ci-dessous pour vous connecter à StudyLink. Ce lien est valable
              pendant 24 heures.
            </Text>

            <Button style={button} href={url}>
              Se connecter
            </Button>

            <Text style={smallText}>
              Si le bouton ne fonctionne pas, vous pouvez copier et coller ce lien :
            </Text>
            <Text style={link}>
              <Link href={url} style={link}>
                {url}
              </Link>
            </Text>

            <Hr style={hr} />

            <Text style={footer}>
              Si vous n&apos;avez pas demandé cette connexion, vous pouvez ignorer cet email en
              toute sécurité.
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

const smallText = {
  fontSize: '14px',
  color: '#6b7280',
  margin: '0 0 8px',
};

const link = {
  color: '#2563eb',
  fontSize: '14px',
  textDecoration: 'none',
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
