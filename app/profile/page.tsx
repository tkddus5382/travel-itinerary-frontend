'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AvatarSelectionModal from '@/components/AvatarSelectionModal';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export default function ProfilePage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const getAvatarImageUrl = () => {
    if (!user?.selectedAvatar?.image?.url) return null;
    const url = user.selectedAvatar.image.url;
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  const handleAvatarSelected = async () => {
    await refreshUser();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600">로딩 중...</p>
      </div>
    );
  }

  if (!user || !token) {
    return null;
  }

  const avatarImageUrl = getAvatarImageUrl();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex items-center gap-6 mb-8">
            <div className="relative">
              {avatarImageUrl ? (
                <img
                  src={avatarImageUrl}
                  alt={user.username}
                  className="w-20 h-20 rounded-full object-cover bg-gradient-to-br from-blue-500 to-purple-500 p-1"
                />
              ) : (
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-3xl">
                  {user.username[0].toUpperCase()}
                </div>
              )}
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
                title="아바타 변경"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{user.username}</h1>
              <p className="text-gray-600">{user.email}</p>
              {user.selectedAvatar && (
                <p className="text-sm text-blue-600 mt-1">
                  {user.selectedAvatar.name}
                </p>
              )}
            </div>
          </div>

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
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => setShowAvatarModal(true)}
              className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              아바타 변경
            </button>
            <Link
              href="/"
              className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors text-center"
            >
              홈으로 가기
            </Link>
          </div>
        </div>

        {/* My Reviews Section (Future Enhancement) */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">내가 작성한 리뷰</h2>
          <p className="text-gray-600 text-center py-8">
            곧 출시될 기능입니다!
          </p>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        token={token}
        currentAvatarId={user.selectedAvatar?.id}
        onAvatarSelected={handleAvatarSelected}
      />
    </div>
  );
}
