import { API_CONFIG } from '../../shared/constants/api';

// Custom error class for API errors with details
export class ApiError extends Error {
  public status: number;
  public details?: string[];
  public errorType?: string;

  constructor(message: string, status: number, details?: string[], errorType?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
    this.errorType = errorType;
  }
}

export abstract class BaseApiService {
  protected static async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Extract error details from the response
      const message = errorData.message || errorData.error || `HTTP error! status: ${response.status}`;
      const details = errorData.details || [];
      const errorType = errorData.error || 'API Error';
      
      throw new ApiError(message, response.status, details, errorType);
    }

    return response.json();
  }

  protected static get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint);
  }

  protected static post<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  protected static patch<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  protected static put<T, D = Record<string, unknown>>(endpoint: string, data: D): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  protected static delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}
