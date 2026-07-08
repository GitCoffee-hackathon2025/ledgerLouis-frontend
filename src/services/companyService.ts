import axiosInstance from '@/plugins/axios';

export interface CompanyDto {
  id: string;
  name: string;
  cnpj: string;
}

export interface UserCompanyDto {
  companyId: string;
  companyName: string;
  role: string;
  createdAt: string;
}

export interface CompanyMemberDto {
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface MemberListResponse {
  items: CompanyMemberDto[];
  total: number;
  limit: number;
  offset: number;
}

export default class CompanyService {
  async getUserCompanies() {
    const response = await axiosInstance.get<UserCompanyDto[]>('/me/companies');
    return response.data;
  }

  async createCompany(nameOrPayload: string | { name: string; cnpj: string; [key: string]: any }, cnpj?: string) {
    let name: string;
    let cnpjVal: string;

    if (typeof nameOrPayload === 'string') {
      name = nameOrPayload;
      cnpjVal = cnpj || '';
    } else {
      // sanitize payload: only send fields backend expects
      name = nameOrPayload.name;
      cnpjVal = nameOrPayload.cnpj;
    }

    const response = await axiosInstance.post<CompanyDto>('/companies', { name, cnpj: cnpjVal });
    return response.data;
  }

  async getCompany(companyId: string) {
    const response = await axiosInstance.get<CompanyDto>(`/companies/${companyId}`);
    return response.data;
  }

  async updateCompany(companyId: string, nameOrPayload: string | { name: string; [key: string]: any }) {
    const name = typeof nameOrPayload === 'string' ? nameOrPayload : nameOrPayload.name;
    const response = await axiosInstance.patch<CompanyDto>(`/companies/${companyId}`, { name });
    return response.data;
  }

  async getCompanyMembers(companyId: string, limit = 20, offset = 0) {
    const response = await axiosInstance.get<MemberListResponse>(`/companies/${companyId}/members`, {
      params: { limit, offset },
    });
    return response.data;
  }

  async addCompanyMember(companyId: string, email: string, role: string) {
    const response = await axiosInstance.post(`/companies/${companyId}/members`, { email, role });
    return response.data;
  }
}
