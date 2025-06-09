import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check if we're running in fallback mode
    const checkConnectionStatus = async () => {
      try {
        // Try to make a simple request to check connectivity
        const response = await fetch('/api/health', { 
          method: 'HEAD',
          cache: 'no-cache'
        });
        if (!response.ok) {
          setShowOfflineMessage(true);
        }
      } catch (error) {
        setShowOfflineMessage(true);
      }
    };

    checkConnectionStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showOfflineMessage && isOnline) {
    return null;
  }

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <WifiOff className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <strong>Limited connectivity detected.</strong> The application is running in offline mode with sample data. 
        Some features may be unavailable until connection is restored.
      </AlertDescription>
    </Alert>
  );
}