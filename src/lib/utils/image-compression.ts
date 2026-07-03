import compress from 'browser-image-compression';

export async function compressLogo(file: File): Promise<File> {
  return compress(file, { maxWidthOrHeight: 400, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.9 });
}

export async function compressProfile(file: File): Promise<File> {
  return compress(file, { maxWidthOrHeight: 200, useWebWorker: true, fileType: 'image/webp', initialQuality: 0.65 });
}
