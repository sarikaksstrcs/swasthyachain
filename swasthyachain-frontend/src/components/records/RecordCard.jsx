import { FileText, Calendar, Eye, Trash2 } from 'lucide-react';
import { formatDate, getRecordTypeLabel } from '@/utils/helpers';
import { Button } from '@/components/common/Button';

export const RecordCard = ({ record, onView, onDelete }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{record.title}</h3>
            <p className="text-sm text-gray-600">
              {getRecordTypeLabel(record.record_type)}
            </p>
          </div>
        </div>
        <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          {record.encrypted ? 'Encrypted' : 'Unencrypted'}
        </span>
      </div>

      {record.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {record.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {formatDate(record.created_at)}
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => onView(record)}
          className="flex-1"
        >
          <Eye className="h-4 w-4" />
          View
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => onDelete(record.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};