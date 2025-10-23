
import axios from "axios";
export const getErrorMessage = (e: unknown, fallback = "Có lỗi xảy ra") =>
  axios.isAxiosError(e)
    ? (e.response?.data as { message?: string })?.message ??
      e.message ??
      fallback
    : e instanceof Error
    ? e.message || fallback
    : fallback;
