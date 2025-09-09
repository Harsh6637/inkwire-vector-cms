interface Resource {
    id: string;
    name: string;
    [key: string]: any;
}
interface ConfirmRemoveDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    resource: Resource | null;
    onConfirm: () => void;
    onCancel: () => void;
}
export default function ConfirmRemoveDialog({ open, onOpenChange, resource, onConfirm, onCancel }: ConfirmRemoveDialogProps): import("react/jsx-runtime").JSX.Element;
export {};
//# sourceMappingURL=ConfirmRemoveDialog.d.ts.map