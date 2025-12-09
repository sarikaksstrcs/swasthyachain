import { Activity } from "lucide-react";
import { RegisterForm } from "../components/auth/RegisterForm";

export const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
          <p className="text-gray-600 mt-2">Join SwasthyaChain today</p>
        </div>
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <RegisterForm />
        </div>
      </div>
    </div>
  );
};
