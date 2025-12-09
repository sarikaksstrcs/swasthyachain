import { Shield, Clock, CheckCircle, XCircle, User } from "lucide-react";
import { formatDateTime, getStatusBadgeColor } from "@/utils/helpers";
import { Button } from "@/components/common/Button";
import { ACCESS_TYPES } from "@/utils/constants";

export const ConsentCard = ({
  consent,
  onApprove,
  onDeny,
  onRevoke,
  isPatient,
}) => {
  const getAccessTypeLabel = (type) => {
    const labels = {
      [ACCESS_TYPES.READ]: "Read Only",
      [ACCESS_TYPES.WRITE]: "Write Access",
      [ACCESS_TYPES.FULL]: "Full Access",
    };
    return labels[type] || type;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Shield className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isPatient ? "Dr. " + consent.doctor_name : consent.patient_name}
            </h3>
            <p className="text-sm text-gray-600">
              {getAccessTypeLabel(consent.access_type)}
            </p>
          </div>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(consent.status)}`}
        >
          {consent.status}
        </span>
      </div>

      {consent.reason && (
        <p className="text-sm text-gray-600 mb-4">
          <strong>Reason:</strong> {consent.reason}
        </p>
      )}

      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {consent.duration_hours}h duration
        </div>
        {consent.expires_at && (
          <div className="text-xs">
            Expires: {formatDateTime(consent.expires_at)}
          </div>
        )}
      </div>

      {consent.status === "pending" && isPatient && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="success"
            onClick={() => onApprove(consent.id)}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4" />
            Approve
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() => onDeny(consent.id)}
            className="flex-1"
          >
            <XCircle className="h-4 w-4" />
            Deny
          </Button>
        </div>
      )}

      {consent.status === "approved" && isPatient && (
        <Button
          size="sm"
          variant="danger"
          onClick={() => onRevoke(consent.id)}
          className="w-full"
        >
          Revoke Access
        </Button>
      )}
    </div>
  );
};
