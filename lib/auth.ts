const API_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL;

export interface User {
  id: number;
  username: string;
  email: string;
  confirmed: boolean;
  blocked: boolean;
  profileImage?: {
    id: number;
    url: string;
    formats?: any;
  } | null;
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
 * 프로필 업데이트 (사용자명 및 프로필 이미지)
 */
export async function updateProfile(
  token: string,
  data: { username?: string; profileImage?: File }
): Promise<User> {
  const formData = new FormData();

  if (data.username) {
    formData.append('username', data.username);
  }

  if (data.profileImage) {
    formData.append('profileImage', data.profileImage);
  }

  const response = await fetch(`${API_URL}/auth/profile`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || '프로필 업데이트에 실패했습니다.');
  }

  const result = await response.json();
  return result.user;
}
