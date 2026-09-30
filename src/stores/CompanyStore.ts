import { defineStore } from 'pinia';
import { reactive, ref } from 'vue';
import CompanyService, { type CompanyRole, type UserCompanyDto } from '@/services/companyService';

const STORAGE_KEY = 'ledger_company_data';

export const useCompanyStore = defineStore('company', () => {
  const defaultCompany = {
    id: '',
    role: 'viewer' as 'owner' | 'admin' | 'viewer',
    name: '',
    cnpj: '',
    address: '',
    email: '',
    website: '',
    phone: '',
    owner: '',
    members: [] as string[],
    hasCompany: false,
  };

  const company = reactive({
    ...defaultCompany,
  });
  const companies = ref<UserCompanyDto[]>([]);

  // Carregar dados do localStorage na inicialização
  const loadCompanyData = () => {
    try {
      const savedData = localStorage.getItem(STORAGE_KEY);
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        Object.assign(company, parsedData);
      }
    } catch (error) {
      console.error('Erro ao carregar dados da empresa:', error);
    }
  };

  const setCompanyData = (companyData: Partial<typeof company>) => {
    Object.assign(company, companyData);
    // Persistir em localStorage
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
    } catch (error) {
      console.error('Erro ao salvar dados da empresa:', error);
    }
  };

  const addMember = (member: string) => {
    if (member && !company.members.includes(member)) {
      company.members.push(member);
      // Persistir em localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(company));
      } catch (error) {
        console.error('Erro ao salvar dados da empresa:', error);
      }
    }
  };

  const clearCompany = () => {
    Object.assign(company, defaultCompany);
    // Limpar localStorage
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Erro ao limpar dados da empresa:', error);
    }
  };

  const syncFromBackend = async () => {
    try {
      const service = new CompanyService();
      const userCompanies = await service.getUserCompanies();
      companies.value = userCompanies;
      if (userCompanies.length === 0) return;

      const current = userCompanies.find((c) => c.companyId === company.id) ?? userCompanies[0]!;
      const safeRole =
        current.role === 'owner' || current.role === 'admin' || current.role === 'viewer'
          ? current.role
          : 'viewer';

      setCompanyData({
        id: current.companyId,
        name: current.companyName,
        cnpj: current.cnpj,
        email: current.email ?? '',
        phone: current.phone ?? '',
        role: safeRole,
        hasCompany: true,
      });
    } catch (error) {
      console.error('Erro ao sincronizar empresa com backend:', error);
    }
  };

  const selectCompany = (userCompany: UserCompanyDto) => {
    const safeRole: CompanyRole =
      userCompany.role === 'owner' || userCompany.role === 'admin' || userCompany.role === 'viewer'
        ? userCompany.role
        : 'viewer';

    setCompanyData({
      id: userCompany.companyId,
      name: userCompany.companyName,
      role: safeRole,
      hasCompany: true,
    });
  };

  // Restaura a empresa salva já na criação da store, para que o guard do
  // router (requiresCompany) funcione desde a primeira navegação.
  loadCompanyData();

  return {
    company,
    companies,
    setCompanyData,
    addMember,
    clearCompany,
    loadCompanyData,
    syncFromBackend,
    selectCompany,
  };
});
