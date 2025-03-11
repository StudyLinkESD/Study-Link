'use client';

import type { SwaggerUIProps } from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';

const SwaggerUI = dynamic<SwaggerUIProps>(() => import('swagger-ui-react'), { ssr: false });

type SwaggerSpec = {
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
  };
  paths: Record<string, unknown>;
  components: Record<string, unknown>;
  [key: string]: unknown;
};

export default function ApiDocs() {
  const [spec, setSpec] = useState<SwaggerSpec | null>(null);

  useEffect(() => {
    fetch('/api/docs/spec')
      .then((response) => response.json())
      .then((data: SwaggerSpec) => setSpec(data));
  }, []);

  if (!spec) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Chargement de la documentation...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="prose max-w-none">
        <h1>Documentation de l&apos;API Study Link</h1>
        <SwaggerUI spec={spec} defaultModelsExpandDepth={-1} docExpansion="list" />
      </div>
    </div>
  );
}
