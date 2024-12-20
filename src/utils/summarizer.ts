import path from 'path';
import { JobAttributes } from '../models/job';
import { VertexAI } from '@google-cloud/vertexai';
import config from '../config/config';

export async function analyzeFile(job: JobAttributes): Promise<string> {
  const vertexAI = new VertexAI({ project: config.get('GS_PROJECT_ID'), location: config.get('GS_LOCATION') });
  const model = 'gemini-1.5-flash-001';

  const generativeModel = vertexAI.getGenerativeModel({ model });
  const filePart = {
    fileData: {
      fileUri: job.filePath,
      mimeType: job.mimetype,
    },
  };
  const textPart = {
    text: `
    You are a very professional document summarization specialist.
    Please summarize the given document.`,
  };

  const request = {
    contents: [{ role: 'user', parts: [filePart, textPart] }],
  };

  const resp = await generativeModel.generateContent(request);
  const contentResponse = resp.response;
  const summarizedContent = contentResponse.candidates?.[0]?.content?.parts[0]?.text;
  if (!summarizedContent) throw new Error('Unable to summarize content');
  return summarizedContent;
}
