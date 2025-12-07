
import { Activity } from 'lucide-react';
import { LoginForm } from '../components/layout/Sidebar';

export const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
          <p className="text-gray-600 mt-2">Sign in to access your health records</p>
        </div>
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};
