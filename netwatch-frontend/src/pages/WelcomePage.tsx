import { useNavigate } from 'react-router-dom';
// import { useAuth } from '@clerk/react';
import { Bot } from '@/components/animate-ui/icons/bot';
import { Activity, Server, Globe, Shield, Zap, ArrowRight } from 'lucide-react';

export default function WelcomePage() {
  const navigate = useNavigate();
  // const { isSignedIn } = useAuth();

  // Redirect to dashboard if already signed in
  // if (isSignedIn) {
  //   navigate('/dashboard');
  //   return null;
  // }

  return (
    <div className="min-h-screen bg-bgcol">
      {/* Navbar */}
      <div className="h-[60px] w-screen p-4 flex items-center border-b border-bordercol sticky top-0 bg-cards z-50">
        <h1 className="flex items-center gap-1">
          <Bot animateOnHover={true} animateOnView={true} className="text-black"/>
          <span className="font-space text-lg font-semibold mt-1">NetWatch</span>
        </h1>
        <div className="flex items-center gap-0.5 ml-auto">
          <button 
            onClick={() => navigate('/sign-in')}
            className="px-4 py-2 text-textcol hover:bg-light cursor-pointer transition-colors font-space font-semibold text-sm"
          >
            Sign In
          </button>
          <button 
            onClick={() => navigate('/sign-up')}
            className="px-4 py-2 bg-textcol text-white cursor-pointer hover:bg-hovercol transition-colors font-space text-sm"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-textcol font-space mb-6">
            Monitor Your Network with Confidence
          </h1>
          <p className="text-xl text-seccol font-brains mb-8 max-w-2xl mx-auto">
            Real-time device monitoring for routers, servers, printers, and more. 
            Keep your infrastructure healthy with intelligent alerts and detailed analytics.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button 
              onClick={() => navigate('/sign-in')}
              className="w-full sm:w-auto px-8 py-3 bg-textcol text-white  hover:bg-hovercol transition-colors font-space text-lg cursor-pointer"
            >
              Get Started
            </button>
            <button 
              onClick={() => navigate('/sign-up')}
              className="w-full sm:w-auto px-8 py-3 border border-bordercol text-textcol bg-cards  hover:bg-light transition-colors font-space text-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              Create Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 max-w-6xl mx-auto">
          <div className="bg-cards p-6  border border-bordercol hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-light  flex items-center justify-center mb-4 border-1 border-bordercol">
              <Activity className="w-6 h-6 text-textcol" />
            </div>
            <h3 className="text-xl font-semibold text-textcol font-space mb-2">Real-time Monitoring</h3>
            <p className="text-seccol font-brains">
              Get instant updates on device health with automated checks every 30 seconds.
            </p>
          </div>

          <div className="bg-cards p-6  border border-bordercol hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-light  flex items-center justify-center mb-4 border-1 border-bordercol">
              <Server className="w-6 h-6 text-textcol" />
            </div>
            <h3 className="text-xl font-semibold text-textcol font-space mb-2">Multi-Device Support</h3>
            <p className="text-seccol font-brains">
              Monitor routers, servers, web servers, printers, PCs, and phones from one dashboard.
            </p>
          </div>

          <div className="bg-cards p-6  border border-bordercol hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-light  flex items-center justify-center mb-4 border-1 border-bordercol">
              <Globe className="w-6 h-6 text-textcol" />
            </div>
            <h3 className="text-xl font-semibold text-textcol font-space mb-2">Web Server Monitoring</h3>
            <p className="text-seccol font-brains">
              Specialized tools for monitoring local development servers and web services.
            </p>
          </div>

          <div className="bg-cards p-6  border border-bordercol hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-light  flex items-center justify-center mb-4 border-1 border-bordercol">
              <Shield className="w-6 h-6 text-textcol" />
            </div>
            <h3 className="text-xl font-semibold text-textcol font-space mb-2">Multiple Protocols</h3>
            <p className="text-seccol font-brains">
              Support for ICMP, TCP, HTTP, HTTPS, and SNMP monitoring methods.
            </p>
          </div>

          <div className="bg-cards p-6  border border-bordercol hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-light  flex items-center justify-center mb-4 border-1 border-bordercol">
              <Zap className="w-6 h-6 text-textcol" />
            </div>
            <h3 className="text-xl font-semibold text-textcol font-space mb-2">Smart Alerts</h3>
            <p className="text-seccol font-brains">
              Receive instant notifications when devices go down or performance degrades.
            </p>
          </div>

          <div className="bg-cards p-6  border border-bordercol hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-light  flex items-center justify-center mb-4 border-1 border-bordercol">
              <Activity className="w-6 h-6 text-textcol" />
            </div>
            <h3 className="text-xl font-semibold text-textcol font-space mb-2">Detailed Analytics</h3>
            <p className="text-seccol font-brains">
              Comprehensive logs and metrics to understand your network performance over time.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-cards p-8  border border-bordercol max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-textcol font-space mb-4">
              Ready to Monitor Your Network?
            </h2>
            <p className="text-seccol font-brains mb-6">
              Join thousands of users who trust NetWatch for their infrastructure monitoring.
            </p>
            <button 
              onClick={() => navigate('/sign-in')}
              className="px-8 py-3 bg-textcol text-white cursor-pointer  hover:bg-hovercol transition-colors font-space text-lg"
            >
              Start Monitoring Today
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-bordercol py-8 mt-16 bg-cards">
        <div className="container mx-auto px-4 text-center">
          <p className="text-seccol font-brains flex items-center">
            &copy;{new Date().getFullYear()} NetWatch. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
