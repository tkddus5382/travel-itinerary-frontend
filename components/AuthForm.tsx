'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { login as authLogin, register as authRegister, LoginData, RegisterData } from '@/lib/auth';
import { useAuth } from '@/contexts/AuthContext';

interface AuthFormProps {
  mode: 'login' | 'register';
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('비밀번호가 일치하지 않습니다.');
        }

        const data: RegisterData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
        };

        const response = await authRegister(data);
        login(response.jwt, response.user);
        router.push('/');
      } else {
        const data: LoginData = {
          identifier: formData.email, // Can be email or username
          password: formData.password,
        };

        const response = await authLogin(data);
        login(response.jwt, response.user);
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full max-w-md">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {mode === 'register' && (
        <div>
          <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
            사용자 이름
          </label>
          <input
            id="username"
            type="text"
            required
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="사용자 이름을 입력하세요"
          />
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="이메일을 입력하세요"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
          비밀번호
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="비밀번호를 입력하세요 (최소 6자)"
        />
      </div>

      {mode === 'register' && (
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
            비밀번호 확인
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            minLength={6}
            value={formData.confirmPassword}
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="비밀번호를 다시 입력하세요"
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
      </button>
    </form>
  );
}
