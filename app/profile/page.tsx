'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { updateProfile } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export default function ProfilePage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setUsername(user.username);
    }
  }, [user, loading, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('이미지 크기는 5MB 이하여야 합니다.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('이미지 파일만 업로드 가능합니다.');
        return;
      }
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSave = async () => {
    if (!token) return;

    setError('');
    setSaving(true);

    try {
      const updateData: { username?: string; profileImage?: File } = {};

      if (username !== user?.username) {
        updateData.username = username;
      }

      if (profileImage) {
        updateData.profileImage = profileImage;
      }

      if (Object.keys(updateData).length === 0) {
        setIsEditing(false);
        return;
      }

      await updateProfile(token, updateData);
      await refreshUser();

      setIsEditing(false);
      setProfileImage(null);
      setPreviewUrl(null);
    } catch (err: any) {
      setError(err.message || '프로필 업데이트에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setUsername(user?.username || '');
    setProfileImage(null);
    setPreviewUrl(null);
    setError('');
  };

  const getProfileImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profileImage?.url) {
      return user.profileImage.url.startsWith('http')
        ? user.profileImage.url
        : `${API_URL}${user.profileImage.url}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const profileImageUrl = getProfileImageUrl();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                  title="이미지 변경"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="text-3xl font-bold text-gray-900 mb-2 border-b-2 border-blue-500 focus:outline-none w-full"
                  placeholder="사용자명"
                />
              ) : (
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
              )}
              <p className="text-gray-600">{user.email}</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                프로필 수정
              </button>
            )}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {isEditing && (
            <div className="mb-6 flex gap-3">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? '저장 중...' : '저장'}
              </button>
              <button
                onClick={handleCancel}
                disabled={saving}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                취소
              </button>
            </div>
          )}

          {/* User Info */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">사용자 ID</p>
                <p className="text-lg font-semibold text-gray-900">#{user.id}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">계정 상태</p>
                <p className="text-lg font-semibold text-green-600">
                  {user.confirmed ? '✓ 인증됨' : '⚠️ 미인증'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          {!isEditing && (
            <div className="mt-8 flex gap-3">
              <Link
                href="/"
                className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                홈으로 가기
              </Link>
            </div>
          )}
        </div>

        {/* My Reviews Section (Future Enhancement) */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">내가 작성한 리뷰</h2>
          <p className="text-gray-600 text-center py-8">
            곧 출시될 기능입니다!
          </p>
        </div>
      </div>
    </div>
  );
}
