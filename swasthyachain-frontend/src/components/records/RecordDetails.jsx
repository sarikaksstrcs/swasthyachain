import { X, Calendar, FileText, Lock, Share2 } from 'lucide-react';
import { formatDateTime, getRecordTypeLabel } from '@/utils/helpers';
import { Button } from '@/components/common/Button';

export const RecordDetails = ({ record, onClose }) => {
  if (!record) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b">
        <h2 className="text-2xl font-bold text-gray-900">{record.title}</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <FileText className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-medium">{getRecordTypeLabel(record.record_type)}</p>
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
              {record.encrypted ? 'AES-256' : 'Not Encrypted'}
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
              <li key={index} className="text-gray-600">{med}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 pt-4 border-t">
        <Button variant="primary" className="flex-1">
          Download
        </Button>
        <Button variant="secondary" className="flex-1">
          Share
        </Button>
      </div>
    </div>
  );
};