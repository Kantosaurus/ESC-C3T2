import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  XCircle,
} from "lucide-react";
import { useImportIcsFile } from "@/calendar/use-appointment";
import { PageLoader } from "@/components/ui/page-loader";
import { toast } from "sonner";

interface IcsImportProps {
  onImportComplete?: () => void;
}

export function IcsImport({ onImportComplete }: IcsImportProps) {
  const [importedCount, setImportedCount] = useState<number | null>(null);
  const [errorCount, setErrorCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { importIcsFile, isImporting } = useImportIcsFile();

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith(".ics")) {
      toast.error("Please select a valid .ics file");
      return;
    }

    setImportedCount(null);
    setErrorCount(null);

    try {
      // Read the file content
      const content = await file.text();

      // Send to backend
      const result = await importIcsFile(content);

      setImportedCount(result.importedCount);
      setErrorCount(result.errorCount);

      if (result.importedCount > 0) {
        toast.success(
          `Successfully imported ${result.importedCount} appointment${
            result.importedCount !== 1 ? "s" : ""
          }`
        );
      }

      if (result.errorCount > 0) {
        toast.error(
          `${result.errorCount} appointment${
            result.errorCount !== 1 ? "s" : ""
          } failed to import`
        );
      }

      // Call the callback to refresh the calendar
      if (onImportComplete) {
        onImportComplete();
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import appointments. Please try again.");
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* Multi-step loader for import process */}
      <PageLoader
        loading={isImporting}
        pageType="import"
        duration={1000}
        loop={false}
      />

      <div className="flex items-center gap-3">
        <Button
          onClick={handleClick}
          disabled={isImporting}
          variant="outline"
          className="flex items-center gap-2"
        >
          {isImporting ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
          {isImporting ? "Importing..." : "Import .ics File"}
        </Button>

        {importedCount !== null && (
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-green-700">
              {importedCount} appointment{importedCount !== 1 ? "s" : ""}{" "}
              imported
            </span>
          </div>
        )}

        {errorCount !== null && errorCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <XCircle className="h-4 w-4 text-red-500" />
            <span className="text-red-700">
              {errorCount} appointment{errorCount !== 1 ? "s" : ""} failed
            </span>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".ics"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-sm text-gray-600">
        <div className="flex items-start gap-2">
          <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1 text-gray-500">
              <li>Google Calendar exports (.ics)</li>
              <li>Outlook Calendar exports (.ics)</li>
              <li>Apple Calendar exports (.ics)</li>
              <li>Other iCalendar format files</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Import Notes:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Events will be imported as appointments</li>
              <li>Event titles become appointment names</li>
              <li>Event descriptions become appointment details</li>
              <li>Event locations become appointment locations</li>
              <li>Events without end times will default to 1 hour duration</li>
              <li>Appointments are associated with your first elder</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
