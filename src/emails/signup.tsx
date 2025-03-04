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

export default function SignupEmail({ url, firstname = 'étudiant' }: EmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>Bienvenue sur StudyLink - Votre lien de connexion</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={logo}>
            <Heading style={{ ...heading, textAlign: 'center' }}>StudyLink</Heading>
          </Section>
          <Section style={section}>
            <Heading style={heading}>Bonjour {firstname} 👋</Heading>
            <Text style={text}>
              Merci de rejoindre StudyLink ! Pour finaliser votre connexion, cliquez sur le bouton
              ci-dessous.
            </Text>
            <Button style={button} href={url}>
              Se connecter à StudyLink
            </Button>
            <Text style={text}>
              Si le bouton ne fonctionne pas, vous pouvez aussi copier et coller ce lien dans votre
              navigateur :
            </Text>
            <Text style={link}>
              <Link href={url} style={link}>
                {url}
              </Link>
            </Text>
            <Hr style={hr} />
            <Text style={footer}>
              Ce lien expirera dans 24 heures. Si vous n'avez pas demandé cette connexion, vous
              pouvez ignorer cet email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
  borderRadius: '8px',
  maxWidth: '600px',
};

const logo = {
  margin: '0 auto',
};

const section = {
  padding: '0 48px',
};

const heading = {
  fontSize: '24px',
  letterSpacing: '-0.5px',
  lineHeight: '1.3',
  fontWeight: '400',
  color: '#484848',
  padding: '17px 0 0',
};

const text = {
  margin: '0 0 16px',
  fontSize: '16px',
  lineHeight: '24px',
  color: '#484848',
};

const button = {
  backgroundColor: '#000000',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  marginBottom: '20px',
  padding: '12px 20px',
};

const link = {
  color: '#2754C5',
  fontSize: '14px',
  textDecoration: 'underline',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};
