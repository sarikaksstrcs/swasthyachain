import { useState, useEffect } from "react";
import { Search, User, Calendar, FileText } from "lucide-react";
import { Button } from "@/components/common/Button";
import { Card } from "@/components/common/Card";
import { Spinner } from "@/components/common/Spinner";
import toast from "react-hot-toast";

export const PatientList = ({ onSelectPatient }) => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    filterPatients();
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/appointments/my-patients", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch patients");

      const data = await response.json();
      setPatients(data);
      setFilteredPatients(data);
    } catch (error) {
      toast.error("Failed to load patients");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filterPatients = () => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = patients.filter(
      (patient) =>
        patient.full_name?.toLowerCase().includes(term) ||
        patient.email?.toLowerCase().includes(term) ||
        patient.id?.toLowerCase().includes(term) ||
        patient.phone?.toLowerCase().includes(term),
    );
    setFilteredPatients(filtered);
  };

  const handleSelectPatient = (patient) => {
    setSelectedPatientId(patient.id);
    onSelectPatient(patient);
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <Spinner size="lg" />
          <span className="ml-3 text-gray-600">Loading patients...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Patients</h2>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, ID, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="mt-2 text-sm text-gray-600">
          {filteredPatients.length}{" "}
          {filteredPatients.length === 1 ? "patient" : "patients"} found
        </div>
      </div>

      {/* Patient List */}
      <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
        {filteredPatients.length === 0 ? (
          <div className="p-12 text-center">
            <User className="mx-auto w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-600">
              {searchTerm
                ? "No patients found matching your search"
                : "No patients yet"}
            </p>
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                selectedPatientId === patient.id
                  ? "bg-blue-50 border-l-4 border-blue-500"
                  : ""
              }`}
              onClick={() => handleSelectPatient(patient)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {patient.full_name}
                    </h3>
                    <p className="text-sm text-gray-600 truncate">
                      {patient.email}
                    </p>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        ID: {patient.id.slice(0, 8)}...
                      </span>
                      {patient.phone && <span>📞 {patient.phone}</span>}
                      {patient.last_appointment && (
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          Last:{" "}
                          {new Date(
                            patient.last_appointment,
                          ).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {patient.total_appointments > 0 && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {patient.total_appointments} appointment
                          {patient.total_appointments !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPatient(patient);
                  }}
                >
                  View Summary
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
