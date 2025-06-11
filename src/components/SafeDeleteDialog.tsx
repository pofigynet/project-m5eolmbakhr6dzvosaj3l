import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SafeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmationText: string;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function SafeDeleteDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmationText,
  onConfirm,
  isLoading = false,
}: SafeDeleteDialogProps) {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Prevent paste events for security
    setInputValue(e.target.value);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
  };

  const isConfirmEnabled = inputValue === confirmationText && !isLoading;

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      onConfirm();
      setInputValue("");
    }
  };

  const handleCancel = () => {
    setInputValue("");
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>{description}</p>
            <div className="space-y-2">
              <Label htmlFor="confirmation-input">
                To confirm, type: <span className="font-mono font-bold">{confirmationText}</span>
              </Label>
              <Input
                id="confirmation-input"
                value={inputValue}
                onChange={handleInputChange}
                onPaste={handlePaste}
                placeholder={`Type "${confirmationText}" to confirm`}
                className="font-mono"
                autoComplete="off"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isConfirmEnabled}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300"
          >
            {isLoading ? "Deleting..." : "Confirm Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}