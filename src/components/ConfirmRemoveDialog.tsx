
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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

export default function ConfirmRemoveDialog({
  open,
  onOpenChange,
  resource,
  onConfirm,
  onCancel
}: ConfirmRemoveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border border-gray-200 rounded-xl shadow-xl max-w-md p-0 overflow-hidden">
        {/* Header with warning icon */}
        <DialogHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-100 p-6 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900">
                Confirm Remove
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-1">
                This action cannot be undone.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <div className="px-6 py-4">
          <p className="text-gray-700 leading-relaxed">
            {resource && (
              <>
                Are you sure you want to remove{' '}
                <span className="font-semibold text-gray-900">"{resource.name}"</span>
                ? This will permanently delete the document.
              </>
            )}
          </p>
        </div>

        {/* Footer */}
        <DialogFooter className="bg-gray-50 px-6 py-4 gap-3 flex-row justify-end">
          <Button
            variant="outline"
            onClick={onCancel}
            className="border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Remove Document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}