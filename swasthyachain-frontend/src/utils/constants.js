export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
export const APP_NAME = import.meta.env.VITE_APP_NAME;

export const ROLES = {
  PATIENT: "patient",
  DOCTOR: "doctor",
  HOSPITAL: "hospital",
};

export const RECORD_TYPES = {
  LAB_REPORT: "lab_report",
  PRESCRIPTION: "prescription",
  IMAGING: "imaging",
  CONSULTATION: "consultation",
  DISCHARGE_SUMMARY: "discharge_summary",
};

export const CONSENT_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  DENIED: "denied",
  REVOKED: "revoked",
  EXPIRED: "expired",
};

export const ACCESS_TYPES = {
  READ: "read",
  WRITE: "write",
  FULL: "full",
};
