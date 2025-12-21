'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthForm from '@/components/AuthForm';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">로그인</h1>
        <p className="text-center text-gray-600 mb-8">여행 일정을 추천하고 리뷰를 남겨보세요</p>

        {message === 'verify-email' && (
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
            <p className="text-sm font-semibold mb-1">✉️ 이메일을 확인해주세요</p>
            <p className="text-sm">
              가입하신 이메일로 발송된 인증 링크를 클릭하여 이메일 인증을 완료해주세요.
            </p>
          </div>
        )}

        <AuthForm mode="login" />

        <div className="mt-4 text-center">
          <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
            비밀번호를 잊으셨나요?
          </Link>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
              회원가입
            </Link>
          </p>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  );
}
