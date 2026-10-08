import { NextRequest, NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { uploadImageToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminUser();
    if (!admin) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in again.' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Max 25MB input check
    if (file.size > 25 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 25MB' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadImageToR2(buffer, {
      folder,
      maxWidth: 1600,
      maxHeight: 1600,
      quality: 80,
    });

    return NextResponse.json({
      url: result.url,
      key: result.key,
      originalSize: result.originalSize,
      compressedSize: result.compressedSize,
    });
  } catch (err: unknown) {
    console.error('Upload error:', err);
    const message = err instanceof Error ? err.message : 'Failed to upload image';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
