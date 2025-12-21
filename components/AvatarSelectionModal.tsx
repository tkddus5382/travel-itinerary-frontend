'use client';

import { useState, useEffect } from 'react';
import { Avatar, getAvatars, selectAvatar, redeemEventCode } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_STRAPI_URL;

interface AvatarSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string;
  currentAvatarId?: number;
  onAvatarSelected: () => void;
}

const rarityColors = {
  common: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-yellow-600',
};

const rarityLabels = {
  common: '일반',
  rare: '레어',
  epic: '에픽',
  legendary: '전설',
};

export default function AvatarSelectionModal({
  isOpen,
  onClose,
  token,
  currentAvatarId,
  onAvatarSelected,
}: AvatarSelectionModalProps) {
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selecting, setSelecting] = useState(false);
  const [showCodeInput, setShowCodeInput] = useState(false);
  const [eventCode, setEventCode] = useState('');
  const [redeeming, setRedeeming] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAvatars();
    }
  }, [isOpen]);

  const fetchAvatars = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAvatars(token);
      setAvatars(data);
    } catch (err: any) {
      setError(err.message || '아바타 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (avatarId: number) => {
    setSelecting(true);
    setError('');
    try {
      await selectAvatar(token, avatarId);
      onAvatarSelected();
      onClose();
    } catch (err: any) {
      setError(err.message || '아바타 선택에 실패했습니다.');
    } finally {
      setSelecting(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!eventCode.trim()) {
      setError('코드를 입력해주세요.');
      return;
    }

    setRedeeming(true);
    setError('');
    try {
      await redeemEventCode(token, eventCode.trim());
      setEventCode('');
      setShowCodeInput(false);
      await fetchAvatars();
      alert('아바타를 획득했습니다!');
    } catch (err: any) {
      setError(err.message || '코드 입력에 실패했습니다.');
    } finally {
      setRedeeming(false);
    }
  };

  const getAvatarImageUrl = (avatar: Avatar) => {
    const url = avatar.image?.url;
    if (!url) return '';
    return url.startsWith('http') ? url : `${API_URL}${url}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">아바타 선택</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCodeInput(!showCodeInput)}
              className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 text-white rounded-lg font-semibold transition-colors"
            >
              코드 입력
            </button>
            <button
              onClick={onClose}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-lg p-2 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Event Code Input */}
        {showCodeInput && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                placeholder="이벤트 코드 입력"
                className="flex-1 px-4 py-2 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={redeeming}
              />
              <button
                onClick={handleRedeemCode}
                disabled={redeeming}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {redeeming ? '확인 중...' : '입력'}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-200">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {avatars.map((avatar) => (
                <button
                  key={avatar.id}
                  onClick={() => avatar.isUnlocked && handleSelect(avatar.id)}
                  disabled={!avatar.isUnlocked || selecting}
                  className={`relative aspect-square rounded-xl p-3 transition-all ${
                    avatar.isUnlocked
                      ? `bg-gradient-to-br ${rarityColors[avatar.rarity]} hover:scale-105 cursor-pointer`
                      : 'bg-gray-200 cursor-not-allowed opacity-50'
                  } ${currentAvatarId === avatar.id ? 'ring-4 ring-green-500' : ''}`}
                  title={avatar.description || avatar.name}
                >
                  {/* Avatar Image */}
                  <div className="relative w-full h-full">
                    {avatar.isUnlocked ? (
                      <img
                        src={getAvatarImageUrl(avatar)}
                        alt={avatar.name}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Selected Badge */}
                  {currentAvatarId === avatar.id && (
                    <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}

                  {/* Rarity Badge */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-xs py-1 text-center rounded-b-xl">
                    {rarityLabels[avatar.rarity]}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            잠금 해제: {avatars.filter(a => a.isUnlocked).length} / {avatars.length}
          </p>
        </div>
      </div>
    </div>
  );
}
