import { BaseApiService } from './BaseApiService';
import { API_ROUTES } from '../../shared/constants/api';
import type { AccountData } from '../types/layout';

export class AccountService extends BaseApiService {
  // GET /api/accounts/:id - returns account data used by the page
  static async getAccount(id: string): Promise<AccountData> {
    return this.get<AccountData>(API_ROUTES.ACCOUNTS.BY_ID(id));
  }

  // PATCH /api/accounts/:id - accepts updates for editable fields on the page
  static async updateAccount(id: string, updates: Partial<AccountData>): Promise<AccountData> {
    return this.patch<AccountData>(API_ROUTES.ACCOUNTS.BY_ID(id), updates);
  }
}
