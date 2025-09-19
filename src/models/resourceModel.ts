import { Resource } from '../types/resource';

interface CreateResourceParams {
name: string;
content: string;
tags: string[];
fileType: string;
rawData: string | null;
publishers?: string[];
description?: string;
}

export function createResource({
  name,
  content,
  tags,
  fileType,
  rawData,
  publishers = [],
  description = ''
}: CreateResourceParams): Resource {
  return {
    id: Date.now().toString(),
    name,
    content,
    tags,
    fileType,
    rawData,
    publishers,
    description,
    metadata: {
      tags,
      fileType,
      rawData,
      uploadDate: new Date().toISOString()
    },
    created_at: new Date().toISOString()
  };
}