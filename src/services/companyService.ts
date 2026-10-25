import axiosInstance from '@/plugins/axios';

export type CompanyRole = 'owner' | 'admin' | 'viewer';

export interface UserCompanyDto {
  companyId: string;
  companyName: string;
  cnpj: string;
  email: string | null;
  cep: string | null;
  phone: string | null;
  role: CompanyRole;
  createdAt: string;
}

export interface CompanyMemberDto {
  userId: string;
  name: string;
  email: string;
  role: CompanyRole;
  createdAt: string;
}

interface MembersListResponse {
  items: CompanyMemberDto[];
  total: number;
  limit: number;
  offset: number;
}

interface AddMemberResponse {
  targetUserId: string;
  companyId: string;
  role: CompanyRole;
}

export interface CompanyDto {
  id: string;
  name: string;
  cnpj: string;
  email?: string | null;
  cep?: string | null;
  phone?: string | null;
}

export type CompanyDetailsDto = CompanyDto;

export interface InvitationDto {
  id: string;
  companyId: string;
  email: string;
  role: CompanyRole;
  expiresAt: string;
}

export type UserInvitationDto = InvitationDto;

export default class CompanyService {
  async createCompany(
    name: string,
    cnpj: string,
    options?: { email?: string; phone?: string },
  ): Promise<CompanyDto> {
    const response = await axiosInstance.post<CompanyDto>('/companies', {
      name,
      cnpj,
      ...(options?.email ? { email: options.email } : {}),
      ...(options?.phone ? { phone: options.phone } : {}),
    });
    return response.data;
  }

  async getUserCompanies(): Promise<UserCompanyDto[]> {
    const response = await axiosInstance.get<UserCompanyDto[]>('/me/companies');
    return response.data;
  }

  async getCompany(companyId: string): Promise<CompanyDetailsDto> {
    const response = await axiosInstance.get<CompanyDetailsDto>(`/companies/${companyId}`);
    return response.data;
  }

  async getCompanyMembers(
    companyId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<MembersListResponse> {
    const response = await axiosInstance.get<MembersListResponse>(`/companies/${companyId}/members`, {
      params: {
        limit: options?.limit,
        offset: options?.offset,
      },
    });

    return response.data;
  }

  async addCompanyMember(
    companyId: string,
    email: string,
    role: CompanyRole,
  ): Promise<AddMemberResponse> {
    const response = await axiosInstance.post<AddMemberResponse>(`/companies/${companyId}/members`, {
      email,
      role,
    });

    return response.data;
  }

  async createInvitation(
    companyId: string,
    email: string,
    role: CompanyRole,
  ): Promise<InvitationDto> {
    const response = await axiosInstance.post<InvitationDto>(
      `/companies/${companyId}/invitations`,
      { email, role },
    );
    return response.data;
  }

  async listInvitations(
    companyId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<{ items: InvitationDto[]; total: number; limit: number; offset: number }> {
    const response = await axiosInstance.get(
      `/companies/${companyId}/invitations`,
      { params: { limit: options?.limit, offset: options?.offset } },
    );
    return response.data;
  }

  async revokeInvitation(companyId: string, invitationId: string): Promise<void> {
    await axiosInstance.delete(`/companies/${companyId}/invitations/${invitationId}`);
  }

  async getInvitation(token: string): Promise<UserInvitationDto> {
    const response = await axiosInstance.get<UserInvitationDto>(`/invitations/${token}`);
    return response.data;
  }

  async listUserInvitations(): Promise<{ items: UserInvitationDto[] }> {
    const response = await axiosInstance.get<{ items: UserInvitationDto[] }>('/invitations/me');
    return response.data;
  }

  async acceptInvitation(token: string): Promise<{ companyId: string; userId: string; role: CompanyRole }> {
    const response = await axiosInstance.post(`/invitations/${token}/accept`);
    return response.data;
  }

  async acceptInvitationById(invitationId: string): Promise<{ companyId: string; userId: string; role: CompanyRole }> {
    const response = await axiosInstance.post(`/invitations/id/${invitationId}/accept`);
    return response.data;
  }
}
