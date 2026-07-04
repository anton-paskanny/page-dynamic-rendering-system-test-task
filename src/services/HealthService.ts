import { BaseApiService } from './BaseApiService';
import { API_ROUTES } from '../../shared/constants/api';

export class HealthService extends BaseApiService {
  // GET /api/health - returns health status
  static async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.get<{ status: string; timestamp: string }>(API_ROUTES.HEALTH);
  }
}
