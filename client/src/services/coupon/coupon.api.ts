import { AxiosError, axiosInstance } from "../axios";

export const GetCouponApi = async () => {
  try {
    const response = await axiosInstance.get("/coupon");
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw error;
  }
};

export const ValidateCouponApi = async (code: string) => {
  try {
    const response = await axiosInstance.post("/coupon/validate", {
      code,
    });
    return response.data.data;
  } catch (error) {
    if (error instanceof AxiosError) {
      throw new Error(error.response?.data.message);
    }
    throw error;
  }
};
