import path from "path";

export function sanitizeFileName(originalName: string): string {
  const sanitized = originalName.replace(/[^a-zA-Z0-9.\-_]/g, '');

  const fileName = path.parse(sanitized).name;
  const extension = path.parse(sanitized).ext;

  const maxFileNameLength = 100;
  const truncatedFileName = fileName.substring(0, maxFileNameLength);

  return `${truncatedFileName}${extension}`;
}
