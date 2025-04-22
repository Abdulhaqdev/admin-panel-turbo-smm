import axios, { AxiosResponse, AxiosError } from "axios";

// -------------------- AUTHENTICATION RELATED -------------------- //
interface TokenResponse {
  access: string;
  admin: boolean;
  refresh: string;
  user_id: number;
}

interface RefreshTokenResponse {
  access: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

const handleError = (error: AxiosError<ErrorResponse>): Promise<never> => {
  if (error.response) {
    return Promise.reject(error.response.data);
  } else if (error.request) {
    return Promise.reject({ message: "Server bilan bog‘lanishda xato" });
  } else {
    
    return Promise.reject({ message: "Noma'lum xato yuz berdi" });
  }
};

export const refreshToken = async (): Promise<string> => {
  try {
    const refresh = getCookie("refresh_token");
    if (!refresh) {
      throw new Error("Refresh token topilmadi");
    }
    const response = await axios.post<RefreshTokenResponse>(`${API_BASE_URL}token/refresh/`, { refresh });
    const newAccessToken = response.data.access;
    document.cookie = `access_token=${newAccessToken}; path=/; max-age=3600`;
    return newAccessToken;
  } catch (error) {
    document.cookie = "access_token=; path=/; max-age=0";
    document.cookie = "refresh_token=; path=/; max-age=0";
    window.location.href = "/";
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const originalRequest = error.config as any & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newAccessToken = await refreshToken();
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }
    return handleError(error);
  },
);

export const login = async (credentials: { username: string; password: string }): Promise<TokenResponse> => {
  try {
    const response = await apiClient.post<TokenResponse>("token/", credentials);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

// -------------------- USER RELATED -------------------- //
interface User {
  id: number;
  api_key: string;
  balance: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  username: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const getUsers = async (limit: number = 10, offset: number = 0): Promise<PaginatedResponse<User>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<User>>("/users/", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

// -------------------- ORDER RELATED -------------------- //
interface Order {
  id: number;
  service: Service;
  price: number;
  url: string;
  status: string;
  user: number;
  quantity: number;
  created_at: string;
  updated_at: string;
}

export const getOrders = async (limit: number = 10, offset: number = 0): Promise<PaginatedResponse<Order>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Order>>("/orders/", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

// -------------------- SERVICE RELATED -------------------- //
interface Service {
  id: number;
  name: string;
  description: string;
  duration: number;
  min: number;
  max: number;
  price: number;
  site_id: number;
  category: number; // `service_type` o‘rniga `category`
  api: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const getServices = async (limit: number = 10, offset: number = 0): Promise<PaginatedResponse<Service>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Service>>("/services/", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const createService = async (
  service: Omit<Service, "id" | "created_at" | "updated_at">
): Promise<Service> => {
  try {
    const response = await apiClient.post<Service>("/services/", service);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const updateService = async (id: number, service: Partial<Service>): Promise<Service> => {
  try {
    const response = await apiClient.put<Service>(`/service/${id}/`, service);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const deleteService = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/service/${id}/`);
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
// getpayments history
interface PaymentType {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
interface Payment {
  id: number;
  price: string;
  user: User;
  payment_type: PaymentType;
  created_at: string;
  updated_at: string;
  is_active: boolean;

}export const getPayments = async (
  limit: number = 10,
  offset: number = 0,
  type: string
): Promise<PaginatedResponse<Payment>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Payment>>("/payments/", {
      params: { limit, offset, type },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
// -------------------- CATEGORY RELATED -------------------- //
interface Category {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

export const getCategories = async (
  limit: number = 10,
  offset: number = 0
): Promise<PaginatedResponse<Category>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Category>>("/categories/", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
export const getCategoriesall = async (): Promise<Category> => {
  try {
    const response = await apiClient.get<Category>("/categories/", );
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
export const createCategory = async (
  category: Omit<Category, "id" | "created_at" | "updated_at">
): Promise<Category> => {
  try {
    const response = await apiClient.post<Category>("/categories/", category);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const updateCategory = async (id: number, category: Partial<Category>): Promise<Category> => {
  try {
    const response = await apiClient.put<Category>(`/categories/${id}/`, category);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
export const deleteCategory = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/categories/${id}/`);
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
// -------------------- SERVICE TYPE RELATED -------------------- //
interface ServiceType {
  id: number;
  name: string;
  category: Category;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const getServiceTypes = async (): Promise<ServiceType[]> => {
  try {
    const response = await apiClient.get<ServiceType[]>("/service-types/");
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const createServiceType = async (
  serviceType: Omit<ServiceType, "id" | "created_at" | "updated_at" | "category"> & { category: number }
): Promise<ServiceType> => {
  try {
    const response = await apiClient.post<ServiceType>("/service-types/", serviceType);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const updateServiceType = async (
  id: number,
  serviceType: Partial<Omit<ServiceType, "category"> & { category: number }>
): Promise<ServiceType> => {
  try {
    const response = await apiClient.put<ServiceType>(`/service-types/${id}/`, serviceType);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const deleteServiceType = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/service-types/${id}/`);
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

// -------------------- API RELATED -------------------- //
interface Api {
  id: number;
  name: string;
  url: string;
  percentage: string;
  exchange: {
    id: number;
    name: string;
    price: string;
    created_at: string;
    updated_at: string;
    is_active: boolean;
  };
  exchange_id: number;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  key: string;
  last_used: string | null;
  error_logs: ErrorLog[];
}

interface ErrorLog {
  timestamp: string;
  message: string;
}

export const getApis = async (limit: number = 5, offset: number = 0): Promise<PaginatedResponse<Api>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Api>>("/apis/", {
      params: { limit, offset }, // limit va offset parametrlari qo'shildi
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};
export const createApi = async (
  api: Omit<Api, "id" | "created_at" | "updated_at" | "last_used" | "error_logs">
): Promise<Api> => {
  try {
    const response = await apiClient.post<Api>("/apis/", api);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const updateApi = async (id: number, api: Partial<Api>): Promise<Api> => {
  try {
    const response = await apiClient.put<Api>(`/apis/${id}/`, api);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const deleteApi = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/apis/${id}/`);
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

// -------------------- EXCHANGE RELATED -------------------- //
interface Exchange {
  id: number;
  name: string;
  price: string; // Majburiy qilib qo‘shildi
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
export const getExchanges = async (limit: number = 10, offset: number = 0): Promise<PaginatedResponse<Exchange>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<Exchange>>("/exchanges/", {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>); 
  }
};

export const createExchange = async (
  exchange: Omit<Exchange, "id" | "created_at" | "updated_at">
): Promise<Exchange> => {
  try {
    const response = await apiClient.post<Exchange>("/exchanges/", exchange);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const updateExchange = async (id: number, exchange: Partial<Exchange>): Promise<Exchange> => {
  try {
    const response = await apiClient.put<Exchange>(`/exchanges/${id}/`, exchange);
    return response.data;
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

export const deleteExchange = async (id: number): Promise<void> => {
  try {
    await apiClient.delete(`/exchanges/${id}/`);
  } catch (error) {
    return handleError(error as AxiosError<ErrorResponse>);
  }
};

// -------------------- ERROR RESPONSE -------------------- //
interface ErrorResponse {
  message?: string;
  detail?: string;
}