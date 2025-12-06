import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Activity } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Activity className="h-8 w-8 text-primary-600" />
            <span className="text-xl font-bold text-gray-900">SwasthyaChain</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/medical-records" className="text-gray-700 hover:text-primary-600">
                  Records
                </Link>
                <Link to="/consent-management" className="text-gray-700 hover:text-primary-600">
                  Consent
                </Link>
                <Link to="/ai-insights" className="text-gray-700 hover:text-primary-600">
                  AI Insights
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l">
                  <Link to="/profile" className="flex items-center gap-2 text-gray-700 hover:text-primary-600">
                    <User className="h-5 w-5" />
                    {user?.full_name}
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-700 hover:text-red-600"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-primary-600">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="block py-2 text-gray-700 hover:text-primary-600">
                  Dashboard
                </Link>
                <Link to="/medical-records" className="block py-2 text-gray-700 hover:text-primary-600">
                  Records
                </Link>
                <Link to="/consent-management" className="block py-2 text-gray-700 hover:text-primary-600">
                  Consent
                </Link>
                <Link to="/ai-insights" className="block py-2 text-gray-700 hover:text-primary-600">
                  AI Insights
                </Link>
                <Link to="/profile" className="block py-2 text-gray-700 hover:text-primary-600">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2 text-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block py-2 text-gray-700">
                  Login
                </Link>
                <Link to="/register" className="block py-2 text-gray-700">
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
