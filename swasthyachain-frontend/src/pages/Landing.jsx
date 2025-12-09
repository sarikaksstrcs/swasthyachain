import { Link } from "react-router-dom";
import {
  Shield,
  Lock,
  Brain,
  FileCheck,
  Users,
  Zap,
  Calendar,
  Clock,
} from "lucide-react";
import { Button } from "@/components/common/Button";

export const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: "Blockchain Security",
      description:
        "Immutable records stored on blockchain for maximum security",
    },
    {
      icon: Lock,
      title: "Patient Control",
      description:
        "You own and control your medical data with consent management",
    },
    {
      icon: Brain,
      title: "AI Insights",
      description: "Get personalized health insights powered by AI",
    },
    {
      icon: Calendar,
      title: "Smart Appointments",
      description: "Book and manage appointments with doctors seamlessly",
    },
    {
      icon: FileCheck,
      title: "Encrypted Storage",
      description: "End-to-end AES-256 encryption for all medical files",
    },
    {
      icon: Users,
      title: "Unified Access",
      description: "Connect doctors, hospitals, and labs in one platform",
    },
    {
      icon: Zap,
      title: "Fast & Reliable",
      description: "Quick access to your health records anytime, anywhere",
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description:
        "Get instant notifications for appointments and health updates",
    },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Create Your Account",
      description: "Sign up as a patient or healthcare provider in minutes",
    },
    {
      step: "2",
      title: "Upload Medical Records",
      description:
        "Securely store your health records with blockchain verification",
    },
    {
      step: "3",
      title: "Book Appointments",
      description: "Find doctors and schedule appointments with ease",
    },
    {
      step: "4",
      title: "Manage Access",
      description: "Control who can view your records with consent management",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="backdrop-blur-lg bg-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center ">
          <h1 className="text-5xl font-bold mb-6">SwasthyaChain</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Blockchain, Cloud, and AI-Enabled Decentralized Health Management
            System
          </p>
          <p className="text-lg mb-8 max-w-3xl mx-auto opacity-90">
            Secure medical records, smart appointments, AI-powered insights, and
            complete patient control - all in one platform
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button
                size="lg"
                variant="outline"
                className="bg-white text-blue-600"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">
            Why Choose SwasthyaChain?
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Experience healthcare management reimagined with cutting-edge
            technology
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow flex flex-col items-center"
              >
                <feature.icon className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-center">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-center">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Get started with SwasthyaChain in four simple steps
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment Feature Highlight */}
      <div className="py-20   bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block p-3 bg-blue-600 rounded-lg mb-4 ">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">
                  Smart Appointment Scheduling
                </h2>
                <p className="text-gray-600 mb-6">
                  Book appointments with your preferred doctors in seconds. View
                  real-time availability, get instant confirmations, and manage
                  your healthcare schedule all in one place.
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Real-time availability for doctors
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Interactive calendar for doctors
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Automatic patient record linking
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-gray-700">
                      Easy rescheduling and cancellation
                    </span>
                  </li>
                </ul>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                    <Calendar className="h-10 w-10 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Book Appointments
                      </p>
                      <p className="text-sm text-gray-600">
                        Find and schedule with doctors
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
                    <Clock className="h-10 w-10 text-green-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Real-time Availability
                      </p>
                      <p className="text-sm text-gray-600">
                        See available time slots instantly
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-purple-50 rounded-lg">
                    <Users className="h-10 w-10 text-purple-600" />
                    <div>
                      <p className="font-semibold text-gray-900">
                        Patient Management
                      </p>
                      <p className="text-sm text-gray-600">
                        Doctors track all appointments
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Secure</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">Access</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2">Fast</div>
              <div className="text-gray-600">Booking</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600 mb-2 ">AI</div>
              <div className="text-gray-600">Powered</div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Take Control of Your Health Data Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust SwasthyaChain for secure,
            accessible healthcare records and seamless appointment scheduling
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary" className="place-self-center">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
