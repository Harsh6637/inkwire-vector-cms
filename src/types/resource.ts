export interface Resource {
    id: string;
name: string;
metadata: any;
created_at: string;
// Optional properties for compatibility
content?: string;
text?: string;
tags?: string[];
type?: string;
size?: number;
fileType?: string;
uploadDate?: string;
lastModified?: string;
rawData?: string;
// Index signature for flexibility
[key: string]: any;
}