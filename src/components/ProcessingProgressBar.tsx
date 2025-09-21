import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info as InfoIcon } from "lucide-react";

interface Props {
  status: "pending" | "processing" | "completed" | "error";
  error?: string | null;
  resourceName: string;
}

const ProcessingProgressBar: React.FC<Props> = ({ status, resourceName }) => {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (resourceName && resourceName.trim() !== "") {
      setShouldRender(true);
    } else {
      setShouldRender(false);
    }
  }, [status, resourceName]);

  if (!shouldRender) return null;

  return (
    <div className="sticky top-0 z-50 w-full">
      <Alert className="bg-blue-50 border border-blue-300 text-blue-800 flex items-center gap-3 shadow-sm">
        {/* Info Icon */}
        <span className="flex items-center">
          <InfoIcon className="w-4 h-4 text-blue-600" />
        </span>

        {/* Message */}
        <AlertDescription className="text-sm font-medium flex items-center">
          {status === "pending" && (
            <>Preparing <span className="font-semibold">{resourceName}</span>...</>
          )}
          {status === "processing" && (
            <><span className="font-semibold">{resourceName}</span> is being vectorized and will be ready for search shortly.</>
          )}
          {status === "completed" && (
            <><span className="font-semibold">{resourceName}</span> processed successfully!</>
          )}
          {status === "error" && (
            <>Failed to process <span className="font-semibold">{resourceName}</span></>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProcessingProgressBar;
