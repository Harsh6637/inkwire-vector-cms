import { Resource } from '../types/resource';
interface CreateResourceParams {
    name: string;
    content: string;
    tags: string[];
    fileType: string;
    rawData: string | null;
}
export declare function createResource({ name, content, tags, fileType, rawData }: CreateResourceParams): Resource;
export {};
//# sourceMappingURL=resourceModel.d.ts.map