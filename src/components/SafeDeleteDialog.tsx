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
import { useState } from "react";
import { Loader2 } from "lucide-react";

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

  const handleConfirm = () => {
    if (inputValue === confirmationText) {
      onConfirm();
    }
  };

  const isValid = inputValue === confirmationText;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{description}</p>
            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <span className="font-mono font-bold">{confirmationText}</span> to confirm:
              </Label>
              <Input
                id="confirmation"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={confirmationText}
                className="font-mono"
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => setInputValue("")}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={!isValid || isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}