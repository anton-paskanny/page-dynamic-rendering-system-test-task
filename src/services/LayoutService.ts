import { BaseApiService } from './BaseApiService';
import { API_ROUTES } from '../../shared/constants/api';
import type { Layout } from '../types/layout';

export class LayoutService extends BaseApiService {
  // GET /api/layouts/account - returns the account page layout
  static async getAccountLayout(): Promise<Layout> {
    return this.get<Layout>(API_ROUTES.LAYOUTS.ACCOUNT);
  }

  // PUT /api/layouts/account - persists layout changes made in the Constructor
  static async updateAccountLayout(layout: Layout): Promise<Layout> {
    return this.put<Layout, Layout>(API_ROUTES.LAYOUTS.ACCOUNT, layout);
  }
}
