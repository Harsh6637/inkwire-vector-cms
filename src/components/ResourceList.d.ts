import React from "react";
import { Resource } from '../types/resource';
interface ResourceListProps {
    resources?: Resource[];
    onRemove: (resource: Resource) => void;
}
declare const ResourceList: React.FC<ResourceListProps>;
export default ResourceList;
//# sourceMappingURL=ResourceList.d.ts.map