import { useState } from 'react';
import { Button } from '../button';
import logoImage from 'figma:asset/a410a482d287d117a5e894bd7723810aa1fa4ff6.png';

interface LoginScreenProps {
  onLogin: () => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const handleGoogleLogin = () => {
    // في التطبيق الحقيقي سيتم استدعاء Google Sign-In API
    onLogin();
  };

  const handleFacebookLogin = () => {
    // في التطبيق الحقيقي سيتم استدعاء Facebook Sign-In API
    onLogin();
  };

  const handleWhatsAppLogin = () => {
    // في التطبيق الحقيقي سيتم استدعاء WhatsApp API
    onLogin();
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-400 via-pink-300 to-blue-400">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Large Balloons */}
        <div className="absolute top-20 left-8 w-32 h-40 bg-gradient-to-br from-purple-300 to-purple-500 rounded-full opacity-80 animate-float shadow-lg"></div>
        <div className="absolute top-32 right-12 w-28 h-36 bg-gradient-to-br from-pink-300 to-pink-500 rounded-full opacity-75 animate-float shadow-lg" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-60 left-16 w-24 h-30 bg-gradient-to-br from-blue-300 to-blue-500 rounded-full opacity-70 animate-float shadow-lg" style={{ animationDelay: '2s' }}></div>
        
        {/* Medium Balloons */}
        <div className="absolute top-80 right-20 w-20 h-26 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full opacity-80 animate-float shadow-md" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-96 left-6 w-18 h-24 bg-gradient-to-br from-green-300 to-green-500 rounded-full opacity-75 animate-float shadow-md" style={{ animationDelay: '1.5s' }}></div>
        
        {/* Small Floating Elements */}
        <div className="absolute top-40 left-1/2 w-12 h-15 bg-gradient-to-br from-red-300 to-red-500 rounded-full opacity-60 animate-float shadow-sm" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-72 right-8 w-14 h-18 bg-gradient-to-br from-indigo-300 to-indigo-500 rounded-full opacity-65 animate-float shadow-sm" style={{ animationDelay: '2.5s' }}></div>
        
        {/* Balloon Strings */}
        <div className="absolute top-60 left-24 w-0.5 h-40 bg-gray-400 opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-68 right-20 w-0.5 h-32 bg-gray-400 opacity-50 animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-76 left-12 w-0.5 h-36 bg-gray-400 opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
        
        {/* Character Silhouettes */}
        <div className="absolute bottom-0 left-8 w-16 h-32 opacity-20">
          {/* Person 1 */}
          <div className="relative">
            {/* Head */}
            <div className="w-8 h-8 bg-gray-700 rounded-full mx-auto mb-1"></div>
            {/* Body */}
            <div className="w-12 h-20 bg-gray-700 rounded-t-lg mx-auto"></div>
            {/* Arms */}
            <div className="absolute top-10 -left-2 w-6 h-2 bg-gray-700 rounded rotate-12"></div>
            <div className="absolute top-10 -right-2 w-6 h-2 bg-gray-700 rounded -rotate-12"></div>
          </div>
        </div>
        
        <div className="absolute bottom-0 right-12 w-16 h-32 opacity-20">
          {/* Person 2 */}
          <div className="relative">
            {/* Head */}
            <div className="w-8 h-8 bg-gray-700 rounded-full mx-auto mb-1"></div>
            {/* Body */}
            <div className="w-12 h-20 bg-gray-700 rounded-t-lg mx-auto"></div>
            {/* Arms */}
            <div className="absolute top-10 -left-2 w-6 h-2 bg-gray-700 rounded rotate-45"></div>
            <div className="absolute top-10 -right-2 w-6 h-2 bg-gray-700 rounded -rotate-45"></div>
          </div>
        </div>
        
        {/* Additional Decorative Elements */}
        <div className="absolute top-16 right-6 w-3 h-3 bg-white rounded-full opacity-60 animate-ping"></div>
        <div className="absolute top-52 left-20 w-2 h-2 bg-white rounded-full opacity-50 animate-ping" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-84 right-16 w-4 h-4 bg-white rounded-full opacity-40 animate-ping" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black/10"></div>
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Status Bar Space */}
        <div className="pt-12"></div>
        
        {/* Header Text */}
        <div className="px-6 pt-4">
          <p className="text-white text-right text-base">لا يمكن تسجيل الدخول؟</p>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Logo Section */}
          <div className="text-center mb-8">            
            {/* Dream KSA Logo */}
            <div className="w-48 h-48 mx-auto mb-6 flex items-center justify-center">
              <img
                src={logoImage}
                alt="Dream KSA Logo"
                className="w-full h-full object-contain"
                style={{ 
                  filter: 'drop-shadow(0 8px 32px rgba(255,255,255,0.2))'
                }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Section with Buttons */}
        <div className="px-6 pb-12">
          {/* Login Buttons */}
          <div className="space-y-4 mb-8">
            {/* Google Button */}
            <Button 
              onClick={handleGoogleLogin}
              className="w-full h-14 rounded-full bg-white hover:bg-gray-50 text-gray-700 border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 text-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" className="mr-3">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Google</span>
            </Button>
            
            {/* Facebook Button */}
            <Button 
              onClick={handleFacebookLogin}
              className="w-full h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center space-x-3 text-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-3">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </Button>
          </div>

          {/* WhatsApp Icon */}
          <div className="flex justify-center mb-8">
            <button 
              onClick={handleWhatsAppLogin}
              className="w-12 h-12 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg transition-all duration-200"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.488"/>
              </svg>
            </button>
          </div>

          {/* Terms Text */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <div className="w-4 h-4 border-2 border-white rounded-full mr-3"></div>
              <p className="text-white text-sm leading-relaxed text-right">
                من خلال المتابعة، فإنك توافق على{' '}
                <span className="underline">Dream KSA</span>{' '}
                شروط الخدمة و سياسة الخصوصية
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}