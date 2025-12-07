import { User, Mail, Phone, Shield, Calendar } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/common/Card';
import { formatDate } from '../utils/helpers';


export const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

      <Card>
        <div className="space-y-6">
          <div className="flex items-center gap-4 pb-6 border-b">
            <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full capitalize">
                {user?.role}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Blockchain Address</p>
                <p className="font-medium text-sm truncate">
                  {user?.blockchain_address?.substring(0, 20)}...
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm text-gray-500">Member Since</p>
                <p className="font-medium">{formatDate(user?.created_at)}</p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};