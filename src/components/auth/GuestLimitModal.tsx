import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { AlertCircle } from 'lucide-react';

interface GuestLimitModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}

export function GuestLimitModal({ open, onClose, onLogin }: GuestLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
              <AlertCircle className="text-amber-600" size={24} />
            </div>
            <DialogTitle className="text-xl">Login Required</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Please login to save your work. Guest users can upload data and run predictions, 
            but saving scenarios requires an account.
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Continue as Guest
          </Button>
          <Button
            onClick={onLogin}
            className="w-full sm:w-auto bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            Login to Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
