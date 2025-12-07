
// =============================================
// src/components/auth/RegisterForm.jsx
// =============================================
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, UserCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { ROLES } from '@/utils/constants';

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    phone: '',
    role: ROLES.PATIENT,
  });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate('/login');
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="full_name"
        icon={User}
        value={formData.full_name}
        onChange={handleChange}
        placeholder="John Doe"
        required
      />

      <Input
        label="Email"
        type="email"
        name="email"
        icon={Mail}
        value={formData.email}
        onChange={handleChange}
        placeholder="your@email.com"
        required
      />

      <Input
        label="Phone"
        type="tel"
        name="phone"
        icon={Phone}
        value={formData.phone}
        onChange={handleChange}
        placeholder="+91 98765 43210"
        required
      />

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role
        </label>
        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="input-field"
          required
        >
          <option value={ROLES.PATIENT}>Patient</option>
          <option value={ROLES.DOCTOR}>Doctor</option>
          <option value={ROLES.HOSPITAL}>Hospital</option>
        </select>
      </div>

      <Input
        label="Password"
        type="password"
        name="password"
        icon={Lock}
        value={formData.password}
        onChange={handleChange}
        placeholder="••••••••"
        required
      />

      <Input
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        icon={Lock}
        value={formData.confirmPassword}
        onChange={handleChange}
        placeholder="••••••••"
        required
      />

      <Button type="submit" className="w-full" loading={loading}>
        Register
      </Button>

      <p className="text-center text-sm text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
          Login here
        </Link>
      </p>
    </form>
  );
};
