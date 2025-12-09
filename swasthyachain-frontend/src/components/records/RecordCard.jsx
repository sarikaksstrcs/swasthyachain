import {
  FileText,
  Calendar,
  Download,
  Eye,
  Trash2,
  Shield,
} from "lucide-react";
import { formatDateTime, getRecordTypeLabel } from "@/utils/helpers";
import { Button } from "@/components/common/Button";

export const RecordCard = ({
  record,
  onView,
  onDelete,
  hideDelete = false,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-200">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1">
              {record.title}
            </h3>
            <p className="text-sm text-gray-500">
              {getRecordTypeLabel(record.record_type)}
            </p>
          </div>
        </div>
        {record.encrypted && (
          <div
            className="flex items-center gap-1 text-green-600"
            title="Encrypted"
          >
            <Shield className="h-4 w-4" />
          </div>
        )}
      </div>

      {/* Description */}
      {record.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {record.description}
        </p>
      )}

      {/* Metadata */}
      <div className="space-y-2 mb-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          <span>{formatDateTime(record.created_at)}</span>
        </div>
        {record.filename && (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="truncate">{record.filename}</span>
          </div>
        )}
        {record.file_size && (
          <div className="text-xs text-gray-400">
            Size: {(record.file_size / 1024).toFixed(2)} KB
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-200">
        <Button
          variant="blue"
          size="sm"
          className="flex-1"
          onClick={() => onView(record)}
        >
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
        {!hideDelete && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onDelete(record.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};
