'use client';

import { useState } from 'react';
import { handleUploadFile } from '@/services/uploadFile';

export default function UploadForm() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = await handleUploadFile(event);
    if (url) setFileUrl(url);
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {fileUrl && (
        <p>
          Fichier uploadé :{' '}
          <a href={fileUrl} target="_blank" rel="noopener noreferrer">
            {fileUrl}
          </a>
        </p>
      )}
    </div>
  );
}
