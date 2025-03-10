// TODO: Réactiver Swagger une fois la documentation API prête
import { NextResponse } from 'next/server';

import { getApiDocs } from '@/lib/swagger';

export async function GET() {
  return NextResponse.json(getApiDocs());
}
