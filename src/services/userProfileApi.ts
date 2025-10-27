// src/services/userProfileApi.ts
import { authHttp } from "./http";
import { getErrorMessage } from "../Utils/errorHepler";
import axios from "axios";

/**
 * Cập nhật Avatar URL của User
 * @param userId - ID của user
 * @param avatarUrl - URL ảnh đại diện mới
 */
export async function apiUpdateUserAvatar(
  userId: number,
  avatarUrl: string | null
) {
  try {
    await authHttp.patch(`/api/v1/users/${userId}/avatar`, {
      avatarUrl: avatarUrl || null,
    });
  } catch (e) {
    // Preserve axios error info for better handling
    if (axios.isAxiosError(e)) {
      const error: any = new Error(getErrorMessage(e, "Không thể cập nhật ảnh đại diện"));
      error.response = e.response;
      error.status = e.response?.status;
      throw error;
    }
    throw new Error(getErrorMessage(e, "Không thể cập nhật ảnh đại diện"));
  }
}

/**
 * Cập nhật thông tin Profile của User
 * @param userId - ID của user
 * @param payload - Thông tin cần cập nhật
 */
export async function apiUpdateUserProfile(
  userId: number,
  payload: {
    avatarUrl?: string | null;
    bio?: string | null;
    address?: string | null;
    [key: string]: any;
  }
) {
  try {
    await authHttp.patch(`/api/v1/users/${userId}/profile`, payload);
  } catch (e) {
    throw new Error(getErrorMessage(e, "Không thể cập nhật thông tin profile"));
  }
}

