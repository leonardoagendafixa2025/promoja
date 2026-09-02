import React, { createContext, useContext, useState, useEffect } from 'react';
import { Tenant, User, Role } from '../types';

interface AuthContextType {
  currentTenant: Tenant | null;
  currentUser: User | null;
  allTenants: Tenant[];
  allUsers: User[];
  isImpersonating: boolean;
  impersonatedTenant: Tenant | null;
  impersonationReason: string | null;
  impersonateTenant: (tenantId: string, reason?: string) => Promise<void>;
  exitImpersonation: () => void;
  switchTenant: (tenantId: string) => void;
  switchUser: (userId: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, companyName: string, planId?: string) => Promise<boolean>;
  logout: () => void;
  updateBrandKitState: (brandKit: Partial<Tenant['brandKit']>) => void;
  reloadTenants: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTenants, setAllTenants] = useState<Tenant[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // IMPERSONATION DE TENANT PARA SUPORTE ADMINISTRATIVO
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [impersonatedTenant, setImpersonatedTenant] = useState<Tenant | null>(null);
  const [impersonationReason, setImpersonationReason] = useState<string | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [tenantsRes, usersRes] = await Promise.all([
        fetch('/api/tenants'),
        fetch('/api/admin/users')
      ]);
      const tenants: Tenant[] = await tenantsRes.json();
      const users: User[] = await usersRes.json();

      setAllTenants(tenants);
      setAllUsers(users);

      const savedToken = localStorage.getItem('promoja_auth_token');
      const savedUserId = localStorage.getItem('promoja_auth_user_id');

      if (savedUserId) {
        const foundSavedUser = users.find(u => u.id === savedUserId);
        if (foundSavedUser) {
          setCurrentUser(foundSavedUser);
          const foundSavedTenant = tenants.find(t => t.id === foundSavedUser.tenantId) || tenants[0];
          setCurrentTenant(foundSavedTenant);
          setIsLoading(false);
          return;
        }
      }

      if (tenants.length > 0) {
        const defaultTenant = tenants[0];
        setCurrentTenant(defaultTenant);
        const defaultUser = users.find(u => u.role === 'SUPER_ADMIN') || users[0];
        setCurrentUser(defaultUser);
      }
    } catch (err) {
      console.error('Erro ao carregar dados iniciais:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciais inválidas');
      }

      localStorage.setItem('promoja_auth_token', data.token);
      localStorage.setItem('promoja_auth_user_id', data.user.id);
      setCurrentUser(data.user);
      setCurrentTenant(data.tenant);
      return true;
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar login');
      return false;
    }
  };

  const register = async (name: string, email: string, password: string, companyName: string, planId: string = 'plan_pro'): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, companyName, planId })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Erro ao cadastrar empresa');
      }

      localStorage.setItem('promoja_auth_token', data.token);
      localStorage.setItem('promoja_auth_user_id', data.user.id);
      setCurrentUser(data.user);
      setCurrentTenant(data.tenant);
      await loadData();
      return true;
    } catch (err: any) {
      alert(err.message || 'Erro ao realizar cadastro');
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('promoja_auth_token');
    localStorage.removeItem('promoja_auth_user_id');
    setIsImpersonating(false);
    setImpersonatedTenant(null);
    setImpersonationReason(null);
    if (allTenants.length > 0) setCurrentTenant(allTenants[0]);
    if (allUsers.length > 0) setCurrentUser(allUsers[0]);
  };

  const impersonateTenant = async (tenantId: string, reason: string = 'Atendimento de suporte técnico') => {
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          reason,
          adminName: currentUser?.name || 'Super Admin',
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Falha ao iniciar impersonation');

      setOriginalUser(currentUser);
      setIsImpersonating(true);
      setImpersonatedTenant(data.tenant);
      setImpersonationReason(reason);
      setCurrentTenant(data.tenant);
    } catch (err: any) {
      alert('Erro ao acessar conta como suporte: ' + err.message);
    }
  };

  const exitImpersonation = () => {
    setIsImpersonating(false);
    setImpersonatedTenant(null);
    setImpersonationReason(null);
    if (originalUser) setCurrentUser(originalUser);
    if (allTenants.length > 0) setCurrentTenant(allTenants[0]);
  };

  const switchTenant = (tenantId: string) => {
    const found = allTenants.find(t => t.id === tenantId);
    if (found) setCurrentTenant(found);
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem('promoja_auth_user_id', found.id);
      const tenant = allTenants.find(t => t.id === found.tenantId);
      if (tenant) setCurrentTenant(tenant);
    }
  };

  const updateBrandKitState = (brandKit: Partial<Tenant['brandKit']>) => {
    if (!currentTenant) return;
    const updatedTenant: Tenant = {
      ...currentTenant,
      brandKit: {
        ...currentTenant.brandKit,
        ...brandKit,
      }
    };
    setCurrentTenant(updatedTenant);
    setAllTenants(prev => prev.map(t => t.id === updatedTenant.id ? updatedTenant : t));
  };

  const reloadTenants = async () => {
    const res = await fetch('/api/tenants');
    if (res.ok) {
      const tenants = await res.json();
      setAllTenants(tenants);
    }
  };

  return (
    <AuthContext.Provider value={{
      currentTenant,
      currentUser,
      allTenants,
      allUsers,
      isImpersonating,
      impersonatedTenant,
      impersonationReason,
      impersonateTenant,
      exitImpersonation,
      switchTenant,
      switchUser,
      login,
      register,
      logout,
      updateBrandKitState,
      reloadTenants,
      isLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  return context;
};
