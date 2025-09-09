interface CreateResourceParams {
    name: string;
content: string;
tags: string[];
fileType: string;
rawData: string | null;
}

interface Resource {
id: string;
name: string;
content: string;
tags: string[];
fileType: string;
rawData: string | null;
createdAt: string;
}

export function createResource({ name, content, tags, fileType, rawData }: CreateResourceParams): Resource {
  return {
    id: Date.now().toString(),
    name,
    content,
    tags,
    fileType,
    rawData,
    createdAt: new Date().toISOString()
  };
}