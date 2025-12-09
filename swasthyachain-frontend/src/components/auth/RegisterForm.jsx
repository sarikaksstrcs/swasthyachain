// =============================================
// src/components/auth/RegisterForm.jsx
// =============================================
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Phone, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/common/Input";
import { Button } from "@/components/common/Button";
import { ROLES } from "@/utils/constants";

export const RegisterForm = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    full_name: "",
    phone: "",
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
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      await register(registerData);
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
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

        <div className="relative">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="
            block w-full appearance-none
            px-3 py-2
            border border-gray-300 
            rounded-lg 
            bg-white 
            text-gray-700 
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            transition
          "
            required
          >
            <option value={ROLES.PATIENT}>Patient</option>
            <option value={ROLES.DOCTOR}>Doctor</option>
            {/* <option value={ROLES.HOSPITAL}>Hospital</option> */}
          </select>

          {/* custom arrow */}
          <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 text-gray-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
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
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Login here
        </Link>
      </p>
    </form>
  );
};
