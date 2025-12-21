const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export interface Avatar {
  id: number;
  name: string;
  image: {
    id: number;
    url: string;
    formats?: any;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description?: string;
  unlockType: 'default' | 'mission' | 'event' | 'special';
  unlockCondition?: any;
  isUnlocked?: boolean;
}

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  selectedAvatar?: Avatar | null;
}

export interface AuthResponse {
  jwt: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  identifier: string; // email or username
  password: string;
}

/**
 * 회원가입
 */
export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/local/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '회원가입에 실패했습니다.');
  }

  return response.json();
}

/**
 * 로그인
 */
export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '로그인에 실패했습니다.');
  }

  return response.json();
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getMe(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('사용자 정보를 가져올 수 없습니다.');
  }

  return response.json();
}

/**
 * JWT 토큰 저장
 */
export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jwt', token);
  }
}

/**
 * JWT 토큰 가져오기
 */
export function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('jwt');
  }
  return null;
}

/**
 * JWT 토큰 제거
 */
export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jwt');
  }
}

/**
 * 사용자 정보 저장
 */
export function setUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user));
  }
}

/**
 * 사용자 정보 가져오기
 */
export function getStoredUser(): User | null {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

/**
 * 사용자 정보 제거
 */
export function removeUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user');
  }
}

/**
 * 로그아웃
 */
export function logout(): void {
  removeToken();
  removeUser();
}

/**
 * 비밀번호 재설정 이메일 요청
 */
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '비밀번호 재설정 이메일 발송에 실패했습니다.');
  }
}

/**
 * 비밀번호 재설정
 */
export async function resetPassword(
  code: string,
  password: string,
  passwordConfirmation: string
): Promise<void> {
  const response = await fetch(`${API_URL}/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      code,
      password,
      passwordConfirmation,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '비밀번호 재설정에 실패했습니다.');
  }
}

/**
 * Get available avatars with unlock status
 */
export async function getAvatars(token: string): Promise<Avatar[]> {
  const response = await fetch(`${API_URL}/avatars/available`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get avatars');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Select an avatar
 */
export async function selectAvatar(token: string, avatarId: number): Promise<void> {
  const response = await fetch(`${API_URL}/avatars/select`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ avatarId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to select avatar');
  }
}

/**
 * Redeem an event code
 */
export async function redeemEventCode(token: string, code: string): Promise<Avatar> {
  const response = await fetch(`${API_URL}/event-codes/redeem`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ code }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Failed to redeem code');
  }

  const result = await response.json();
  return result.avatar;
}
