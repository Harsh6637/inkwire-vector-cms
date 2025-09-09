import React from "react";
interface PreviewDialogProps {
    open: boolean;
    onClose: () => void;
    name: string;
    fileType: string;
    content?: string;
    rawData?: string;
}
declare const PreviewDialog: React.FC<PreviewDialogProps>;
export default PreviewDialog;
//# sourceMappingURL=PreviewDialog.d.ts.map