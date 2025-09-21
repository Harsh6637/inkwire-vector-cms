export function getResourceDescription(resource: any): string {
  if (resource.description && typeof resource.description === 'string') {
    return resource.description;
  }
  if (resource.metadata?.description && typeof resource.metadata.description === 'string') {
    return resource.metadata.description;
  }
  return 'No description available';
}