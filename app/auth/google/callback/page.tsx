'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user: currentUser, token: currentToken } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [needsLinking, setNeedsLinking] = useState(false);
  const [linkSuccess, setLinkSuccess] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLinkMode, setIsLinkMode] = useState(false);

  // Check linking mode once on mount
  useEffect(() => {
    const linkMode = localStorage.getItem('googleLinkMode') === 'true';
    if (linkMode) {
      setIsLinkMode(true);
      localStorage.removeItem('googleLinkMode');
    }
  }, []);

  // Wait for auth context to load
  useEffect(() => {
    // Auth context is ready when we've checked for existing user
    // If there's no currentUser after a brief delay, we know auth has loaded
    const timer = setTimeout(() => {
      setAuthChecked(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authChecked) return;

    const handleCallback = async () => {
      const idToken = searchParams.get('id_token');
      const accessToken = searchParams.get('access_token');

      if (!idToken || !accessToken) {
        setError('인증 정보가 없습니다.');
        return;
      }

      try {
        const userInfo = parseJwt(idToken);
        if (!userInfo || !userInfo.sub) {
          throw new Error('사용자 정보를 파싱할 수 없습니다.');
        }

        const providerId = userInfo.sub;

        console.log('Callback debug:', {
          isLinkMode,
          hasCurrentUser: !!currentUser,
          hasCurrentToken: !!currentToken,
          currentUserEmail: currentUser?.email,
          providerId: providerId.substring(0, 10) + '...'
        });

        // LINKING MODE: Link Google account to current user
        if (isLinkMode && currentUser && currentToken) {
          const linkResponse = await fetch(`${API_URL}/api/auth/link-social`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${currentToken}`
            },
            body: JSON.stringify({
              provider: 'google',
              providerId: providerId,
            }),
          });

          if (linkResponse.ok || linkResponse.status === 409) {
            // 409 = already linked, which is fine
            setLinkSuccess(true);
            setTimeout(() => router.push('/settings'), 2000);
            return;
          } else {
            const errorData = await linkResponse.json();
            throw new Error(errorData.error?.message || '계정 연동에 실패했습니다.');
          }
        }

        // NORMAL LOGIN MODE: Login or signup with Google
        const authResponse = await fetch(`${API_URL}/api/auth/google/callback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            idToken,
            provider: 'google',
          }),
        });

        if (authResponse.ok) {
          const data = await authResponse.json();

          // Check if signup is needed
          if (data.needsSignup) {
            // Redirect to signup completion page with Google info
            const params = new URLSearchParams({
              email: data.googleInfo.email,
              name: data.googleInfo.name || '',
              providerId: data.googleInfo.providerId,
              provider: data.googleInfo.provider,
              idToken: data.googleInfo.idToken,
            });
            router.push(`/signup/complete?${params.toString()}`);
            return;
          }

          // Normal login
          login(data.jwt, data.user);
          router.push('/');
        } else if (authResponse.status === 409) {
          // Email exists but not linked - show linking required message
          setNeedsLinking(true);
          return;
        } else {
          const errorData = await authResponse.json();
          throw new Error(errorData.error?.message || '로그인에 실패했습니다.');
        }
      } catch (err: any) {
        console.error('Google OAuth error:', err);
        setError(err.message || '로그인 처리 중 오류가 발생했습니다.');
      }
    };

    handleCallback();
  }, [authChecked, isLinkMode, searchParams, login, router, currentUser, currentToken]);

  if (linkSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✅</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            연동 완료!
          </h1>
          <p className="text-gray-600 text-center">
            Google 계정이 성공적으로 연동되었습니다.
          </p>
        </div>
      </div>
    );
  }

  if (needsLinking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔗</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">
            계정 연동 필요
          </h1>
          <p className="text-gray-600 mb-6 text-center">
            먼저 일반 로그인 후 설정에서 연동해주세요.
          </p>
          <button onClick={() => router.push('/login')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">❌</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">로그인 실패</h1>
          <p className="text-gray-600 mb-6 text-center">{error}</p>
          <button onClick={() => router.push('/login')} className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
            로그인 페이지로
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">로그인 중...</h1>
        <p className="text-gray-600">Google 계정으로 로그인하고 있습니다.</p>
      </div>
    </div>
  );
}
