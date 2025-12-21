'use client';

import GoogleIcon from './icons/GoogleIcon';
import KakaoIcon from './icons/KakaoIcon';

interface SocialLoginButtonsProps {
  mode: 'login' | 'register';
}

export default function SocialLoginButtons({ mode }: SocialLoginButtonsProps) {
  const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL;

  const handleGoogleLogin = () => {
    window.location.href = `${strapiUrl}/api/connect/google`;
  };

  const handleKakaoLogin = () => {
    window.location.href = `${strapiUrl}/api/connect/kakao`;
  };

  return (
    <div className="space-y-3">
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">
            또는 소셜 계정으로 {mode === 'login' ? '로그인' : '가입'}
          </span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <GoogleIcon />
        <span className="font-medium text-gray-700">Google로 계속하기</span>
      </button>

      <button
        type="button"
        onClick={handleKakaoLogin}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg transition-colors"
        style={{ backgroundColor: '#FEE500', color: '#000000' }}
      >
        <KakaoIcon />
        <span className="font-medium">카카오로 계속하기</span>
      </button>
    </div>
  );
}
