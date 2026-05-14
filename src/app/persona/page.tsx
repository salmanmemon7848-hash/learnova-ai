'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, Briefcase } from 'lucide-react';
import { usePersonaStore } from '@/lib/stores/personaStore';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function PersonaSelector() {
  const router = useRouter();
  const { user } = useAuth();
  const { persona, setPersona } = usePersonaStore();
  const [selecting, setSelecting] = useState(false);
  const supabase = createClient();

  // Redirect if persona already selected in localStorage
  useEffect(() => {
    if (persona) {
      router.push('/chat');
    }
  }, [persona, router]);

  const handleSelectPersona = async (selectedPersona: 'student' | 'founder') => {
    setSelecting(true);
    
    try {
      // Save to localStorage for quick access
      setPersona(selectedPersona);
      
      // Save to database
      if (user) {
        const userType = selectedPersona === 'student' ? 'student' : 'business';
        
        await fetch('/api/user/preferences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userType,
            toneMode: 'balanced',
            language: 'en',
          }),
        });
      }

      console.log(`Persona selected: ${selectedPersona}, redirecting to chat...`);
      // Immediately redirect to chat
      router.push('/chat');
    } catch (error) {
      console.error('Error saving persona:', error);
      // Still redirect even if save fails
      router.push('/chat');
    } finally {
      setSelecting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden"
         style={{ background: '#080412' }}>
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 800px 600px at 50% 40%, #2D1B6930, transparent)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center max-w-3xl w-full">
        {/* Logo & Tagline */}
        <div className="text-center mb-12">
          <h1
            className="text-[28px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Thinkior AI
          </h1>
          <p className="text-[15px] mt-2" style={{ color: '#C4B5FD' }}>
            Choose your path to get started
          </p>
        </div>

        {/* Persona Cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full justify-center items-stretch"
             style={{ maxWidth: '560px' }}>
          {/* Student Card */}
          <button
            onClick={() => handleSelectPersona('student')}
            className="flex-1 text-left rounded-[16px] cursor-pointer transition-all duration-200 ease-in-out"
            style={{
              background: 'linear-gradient(135deg, #160D2E, #1E1040)',
              border: '1px solid #2D1B69',
              padding: '32px 28px',
              boxShadow: '0 0 30px #7C3AED18',
              animation: 'fadeUp 0.4s ease forwards',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid #7C3AED';
              e.currentTarget.style.boxShadow = '0 0 40px #7C3AED35';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid #2D1B69';
              e.currentTarget.style.boxShadow = '0 0 30px #7C3AED18';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div
              className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7C3AED22, #4F46E522)',
                border: '1px solid #4338CA',
              }}
            >
              <GraduationCap size={24} color="#A78BFA" />
            </div>

            {/* Content */}
            <h2 className="text-[18px] font-semibold mt-4" style={{ color: '#F5F3FF' }}>
              I am a Student
            </h2>
            <p className="text-[13px] mt-1.5" style={{ color: '#C4B5FD' }}>
              JEE · NEET · CBSE · College prep
            </p>

            {/* Badge */}
            <span
              className="inline-block text-[11px] font-medium mt-4 px-3 py-0.5 rounded-[20px]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                color: 'white',
              }}
            >
              Most Popular
            </span>
          </button>

          {/* Founder Card */}
          <button
            onClick={() => handleSelectPersona('founder')}
            className="flex-1 text-left rounded-[16px] cursor-pointer transition-all duration-200 ease-in-out"
            style={{
              background: 'linear-gradient(135deg, #160D2E, #1E1040)',
              border: '1px solid #2D1B69',
              padding: '32px 28px',
              boxShadow: '0 0 30px #7C3AED18',
              animation: 'fadeUp 0.4s ease 0.1s forwards',
              opacity: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.border = '1px solid #7C3AED';
              e.currentTarget.style.boxShadow = '0 0 40px #7C3AED35';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.border = '1px solid #2D1B69';
              e.currentTarget.style.boxShadow = '0 0 30px #7C3AED18';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Icon */}
            <div
              className="w-[48px] h-[48px] rounded-[12px] flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #7C3AED22, #4F46E522)',
                border: '1px solid #4338CA',
              }}
            >
              <Briefcase size={24} color="#A78BFA" />
            </div>

            {/* Content */}
            <h2 className="text-[18px] font-semibold mt-4" style={{ color: '#F5F3FF' }}>
              I am a Founder
            </h2>
            <p className="text-[13px] mt-1.5" style={{ color: '#C4B5FD' }}>
              Validate ideas · Business plans · India market
            </p>
          </button>
        </div>

        {/* Helper text */}
        <p className="text-[12px] text-center mt-4" style={{ color: '#9CA3AF' }}>
          Not sure? Start with Student — you can change later
        </p>
      </div>

      {/* Animation keyframes */}
      <style jsx>{`
        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
