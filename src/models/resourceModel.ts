import { Resource } from '../types/resource';

interface CreateResourceParams {
name: string;
content: string;
tags: string[];
fileType: string;
rawData: string | null;
}

export function createResource({ name, content, tags, fileType, rawData }: CreateResourceParams): Resource {
  return {
    id: Date.now().toString(),
    name,
    content,
    tags,
    fileType,
    rawData,
    metadata: {
      tags,
      fileType,
      rawData,
      uploadDate: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };
}