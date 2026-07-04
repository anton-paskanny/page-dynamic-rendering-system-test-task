import { BaseApiService } from './BaseApiService';
import { API_ROUTES } from '../../shared/constants/api';
import type { Layout } from '../types/layout';

export class LayoutService extends BaseApiService {
  // GET /api/layouts/account - returns the account page layout
  static async getAccountLayout(): Promise<Layout> {
    return this.get<Layout>(API_ROUTES.LAYOUTS.ACCOUNT);
  }
}
