import { Link } from 'react-router-dom';
import { Shield, Lock, Brain, FileCheck, Users, Zap } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const Landing = () => {
  const features = [
    {
      icon: Shield,
      title: 'Blockchain Security',
      description: 'Immutable records stored on blockchain for maximum security',
    },
    {
      icon: Lock,
      title: 'Patient Control',
      description: 'You own and control your medical data with consent management',
    },
    {
      icon: Brain,
      title: 'AI Insights',
      description: 'Get personalized health insights powered by AI',
    },
    {
      icon: FileCheck,
      title: 'Encrypted Storage',
      description: 'End-to-end AES-256 encryption for all medical files',
    },
    {
      icon: Users,
      title: 'Unified Access',
      description: 'Connect doctors, hospitals, and labs in one platform',
    },
    {
      icon: Zap,
      title: 'Fast & Reliable',
      description: 'Quick access to your health records anytime, anywhere',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            SwasthyaChain
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Blockchain, Cloud, and AI-Enabled Decentralized Health Management System
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Get Started
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="bg-white text-primary-600">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose SwasthyaChain?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <feature.icon className="h-12 w-12 text-primary-600 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-primary-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Take Control of Your Health Data Today
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust SwasthyaChain for secure, accessible healthcare records
          </p>
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Create Free Account
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};