import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import crypto from 'crypto';

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucketName = process.env.R2_BUCKET_NAME || 'media';
const publicUrl = process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || '';

function getR2Client(): S3Client {
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('Cloudflare R2 credentials are missing in environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

export interface UploadImageOptions {
  folder?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
}

/**
 * Compresses an image to high-efficiency WebP and uploads it to Cloudflare R2.
 * Returns the public CDN URL.
 */
export async function uploadImageToR2(
  fileBuffer: Buffer,
  options: UploadImageOptions = {}
): Promise<{ url: string; key: string; originalSize: number; compressedSize: number }> {
  const {
    folder = 'uploads',
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 80,
  } = options;

  const originalSize = fileBuffer.length;

  // Compress & resize with sharp -> WebP
  const compressedBuffer = await sharp(fileBuffer)
    .rotate() // auto-orient from EXIF orientation
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality, effort: 4 })
    .toBuffer();

  const compressedSize = compressedBuffer.length;

  const uniqueId = crypto.randomUUID();
  const key = `${folder}/${Date.now()}-${uniqueId}.webp`;

  const s3 = getR2Client();
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: compressedBuffer,
      ContentType: 'image/webp',
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  const url = publicUrl ? `${publicUrl}/${key}` : key;

  return {
    url,
    key,
    originalSize,
    compressedSize,
  };
}
