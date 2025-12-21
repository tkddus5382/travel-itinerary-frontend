'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export default function LinkGooglePage() {
  const router = useRouter();

  useEffect(() => {
    // 연동 모드 플래그 설정
    localStorage.setItem('googleLinkMode', 'true');
    
    // 구글 OAuth로 리다이렉트
    window.location.href = `${STRAPI_URL}/api/connect/google`;
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          Google 계정 연동 중...
        </h1>
        <p className="text-gray-600">
          Google 로그인 페이지로 이동합니다.
        </p>
      </div>
    </div>
  );
}
