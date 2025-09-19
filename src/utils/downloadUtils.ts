import { Resource } from '../types/resource';

export interface DownloadResult {
success: boolean;
error?: string;
}

export const downloadResource = (resource: Resource): DownloadResult => {
if (!resource) {
    return {
      success: false,
      error: 'No resource provided'
    };
  }

  // Try all possible locations for download data
  const downloadData = resource.metadata?.rawData ||
                       resource.rawData ||
                       resource.metadata?.fileData ||
                       resource.fileData ||
                       resource.metadata?.data ||
                       resource.data ||
                       resource.metadata?.content ||
                       resource.content;

  if (!downloadData) {
    return {
      success: false,
      error: 'No download data available for this file'
    };
  }

  try {
    const link = document.createElement("a");
    link.href = downloadData;
    link.download = resource.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return {
      success: true
    };
  } catch (error) {
    console.error('Error downloading file:', error);
    return {
      success: false,
      error: 'Error downloading file. Please try again.'
    };
  }
};

export const getDownloadData = (resource: Resource): string | null => {
  return resource.metadata?.rawData ||
         resource.rawData ||
         resource.metadata?.fileData ||
         resource.fileData ||
         resource.metadata?.data ||
         resource.data ||
         resource.metadata?.content ||
         resource.content ||
         null;
};

export const hasDownloadData = (resource: Resource): boolean => {
  return getDownloadData(resource) !== null;
};