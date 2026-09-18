import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { uploadImageToR2 } from '@/lib/r2';
import { isPreviewMode } from '@/lib/preview-mode';

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
    }

    // Max 10MB input check
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image must be under 10MB' }, { status: 400 });
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
  } catch (err: any) {
    console.error('Upload error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to upload image' },
      { status: 500 }
    );
  }
}
