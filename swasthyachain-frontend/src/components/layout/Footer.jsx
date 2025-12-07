
// =============================================
// src/components/layout/Footer.jsx
// =============================================
import { Activity, Mail, MapPin, Phone } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="h-6 w-6 text-blue-400" />
              <span className="text-xl font-bold text-white">SwasthyaChain</span>
            </div>
            <p className="text-sm">
              Blockchain-powered decentralized health management system for secure,
              transparent, and patient-controlled healthcare.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/about" className="hover:text-white">About Us</a></li>
              <li><a href="/features" className="hover:text-white">Features</a></li>
              <li><a href="/privacy" className="hover:text-white">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-white">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                support@swasthyachain.com
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                +91 98765 43210
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Kollam, Kerala, India
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-sm text-center">
          <p>&copy; 2024 SwasthyaChain. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
