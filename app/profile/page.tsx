'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AvatarSelectionModal from '@/components/AvatarSelectionModal';
import { redeemEventCode } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

export default function ProfilePage() {
  const { user, token, loading, refreshUser } = useAuth();
  const router = useRouter();
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Nickname editing
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [username, setUsername] = useState('');
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  // Event code
  const [eventCode, setEventCode] = useState('');
  const [redeemingCode, setRedeemingCode] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (user) {
      setUsername(user.username);
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

  const handleSaveUsername = async () => {
    if (!token || !username.trim()) return;

    if (username === user?.username) {
      setIsEditingUsername(false);
      return;
    }

    setSavingUsername(true);
    setUsernameError('');

    try {
      const response = await fetch(`${API_URL}/api/users/${user?.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || '닉네임 변경에 실패했습니다.');
      }

      await refreshUser();
      setIsEditingUsername(false);
    } catch (err: any) {
      setUsernameError(err.message || '닉네임 변경에 실패했습니다.');
    } finally {
      setSavingUsername(false);
    }
  };

  const handleCancelUsername = () => {
    setUsername(user?.username || '');
    setIsEditingUsername(false);
    setUsernameError('');
  };

  const handleRedeemCode = async () => {
    if (!token || !eventCode.trim()) {
      setCodeError('코드를 입력해주세요.');
      return;
    }

    setRedeemingCode(true);
    setCodeError('');
    setCodeSuccess('');

    try {
      const avatar = await redeemEventCode(token, eventCode.trim());
      setCodeSuccess(`${avatar.name} 아바타를 획득했습니다!`);
      setEventCode('');
      setTimeout(() => setCodeSuccess(''), 3000);
      await refreshUser();
    } catch (err: any) {
      setCodeError(err.message || '코드 입력에 실패했습니다.');
    } finally {
      setRedeemingCode(false);
    }
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
      <div className="max-w-2xl mx-auto space-y-6">
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
              {isEditingUsername ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="text-2xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none w-full"
                    placeholder="사용자명"
                    disabled={savingUsername}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveUsername}
                      disabled={savingUsername}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                    >
                      {savingUsername ? '저장 중...' : '저장'}
                    </button>
                    <button
                      onClick={handleCancelUsername}
                      disabled={savingUsername}
                      className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      취소
                    </button>
                  </div>
                  {usernameError && (
                    <p className="text-sm text-red-600">{usernameError}</p>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">{user.username}</h1>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="text-blue-600 hover:text-blue-700 p-1"
                    title="닉네임 수정"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
              <p className="text-gray-600 mt-2">{user.email}</p>
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

        {/* Event Code Section */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">이벤트 코드 입력</h2>
          <p className="text-gray-600 text-sm mb-4">
            특별 아바타를 획득할 수 있는 이벤트 코드를 입력하세요.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              placeholder="코드 입력 (예: SUMMER2024)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={redeemingCode}
            />
            <button
              onClick={handleRedeemCode}
              disabled={redeemingCode || !eventCode.trim()}
              className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redeemingCode ? '확인 중...' : '입력'}
            </button>
          </div>
          {codeError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{codeError}</p>
            </div>
          )}
          {codeSuccess && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-600">{codeSuccess}</p>
            </div>
          )}
        </div>

        {/* My Reviews Section (Future Enhancement) */}
        <div className="bg-white rounded-xl shadow-md p-8">
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
