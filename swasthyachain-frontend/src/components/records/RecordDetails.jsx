import { useState } from "react";
import { X, Calendar, FileText, Lock, Share2, Download } from "lucide-react";
import { formatDateTime, getRecordTypeLabel } from "@/utils/helpers";
import { Button } from "@/components/common/Button";
import { recordsService } from "@/services/records.service";
import toast from "react-hot-toast";

export const RecordDetails = ({ record }) => {
  const [downloading, setDownloading] = useState(false);

  if (!record) return null;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await recordsService.downloadRecord(record.id, record.filename);
      toast.success("File downloaded successfully!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">
              {getRecordTypeLabel(record.record_type)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Created</p>
            <p className="font-medium">{formatDateTime(record.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Lock className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Encryption</p>
            <p className="font-medium">
              {record.encrypted ? "AES-256" : "Not Encrypted"}
            </p>
          </div>
        </div>

        {record.blockchain_hash && (
          <div className="flex items-center gap-3">
            <Share2 className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Blockchain</p>
              <p className="font-medium text-xs truncate">
                {record.blockchain_hash.substring(0, 10)}...
              </p>
            </div>
          </div>
        )}
      </div>

      {record.filename && (
        <div>
          <h3 className="font-semibold mb-2">File Information</h3>
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Filename:</span> {record.filename}
            </p>
            {record.file_size && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-medium">Size:</span>{" "}
                {(record.file_size / 1024).toFixed(2)} KB
              </p>
            )}
          </div>
        </div>
      )}

      {record.description && (
        <div>
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-600">{record.description}</p>
        </div>
      )}

      {record.diagnosis && (
        <div>
          <h3 className="font-semibold mb-2">Diagnosis</h3>
          <p className="text-gray-600">{record.diagnosis}</p>
        </div>
      )}

      {record.medications && record.medications.length > 0 && (
        <div>
          <h3 className="font-semibold mb-2">Medications</h3>
          <ul className="list-disc list-inside space-y-1">
            {record.medications.map((med, index) => (
              <li key={index} className="text-gray-600">
                {med}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button
          variant="blue"
          className="flex-1"
          onClick={handleDownload}
          loading={downloading}
        >
          <Download className="h-4 w-4 mr-2" />
          {downloading ? "Downloading..." : "Download"}
        </Button>
        <Button variant="secondary" className="flex-1">
          Share
        </Button>
      </div>
    </div>
  );
};
