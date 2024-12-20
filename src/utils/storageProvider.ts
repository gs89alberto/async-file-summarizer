import { Storage } from '@google-cloud/storage';

const storage = new Storage();

export async function uploadFromMemory(destFileName: string, contents: Buffer): Promise<void> {
  if (!process.env.GS_BUCKET_NAME) {
    throw new Error('GS_BUCKET_NAME not set');
  }
  await storage.bucket(process.env.GS_BUCKET_NAME).file(destFileName).save(contents);
}
