import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';

export type CompanyMember = {
  userId: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
};

export type UserCompany = {
  companyId: string;
  companyName: string;
  role: string;
  createdAt: string;
};

export const useCompanyStore = defineStore('company', () => {
  const company = reactive({
    id: '',
    name: '',
    cnpj: '',
    address: '',
    email: '',
    website: '',
    phone: '',
    owner: '',
    role: '',
    members: [] as CompanyMember[],
    hasCompany: false,
  });

  const companyList = ref<UserCompany[]>([]);

  const setCompanyData = (companyData: Partial<typeof company>) => {
    Object.assign(company, companyData);
  };

  const setCompanyMembers = (memberList: CompanyMember[]) => {
    company.members = memberList;
  };

  const setCompanyList = (list: UserCompany[]) => {
    companyList.value = list;
  };

  const clearCompany = () => {
    Object.assign(company, {
      id: '',
      name: '',
      cnpj: '',
      address: '',
      email: '',
      website: '',
      phone: '',
      owner: '',
      role: '',
      members: [],
      hasCompany: false,
    });
    companyList.value = [];
  };

  return {
    company,
    companyList,
    setCompanyData,
    setCompanyMembers,
    setCompanyList,
    clearCompany,
  };
});
