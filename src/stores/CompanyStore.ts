import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useCompanyStore = defineStore('company', () => {
  const company = reactive({
    name: '',
    cnpj: '',
    address: '',
    email: '',
    website: '',
    phone: '',
    owner: '',
    members: [] as string[],
    hasCompany: false,
  });

  const setCompanyData = (companyData: Partial<typeof company>) => {
    Object.assign(company, companyData);
  };

  const addMember = (member: string) => {
    if (member && !company.members.includes(member)) {
      company.members.push(member);
    }
  };

  const clearCompany = () => {
    Object.assign(company, {
      name: '',
      cnpj: '',
      address: '',
      email: '',
      website: '',
      phone: '',
      owner: '',
      members: [],
      hasCompany: false,
    });
  };

  return {
    company,
    setCompanyData,
    addMember,
    clearCompany,
  };
});
