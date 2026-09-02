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
    if (found) {
      setCurrentTenant(found);
      const user = allUsers.find(u => u.tenantId === tenantId) || allUsers[0];
      setCurrentUser(user);
    }
  };

  const switchUser = (userId: string) => {
    const found = allUsers.find(u => u.id === userId);
    if (found) {
      setCurrentUser(found);
      const tenant = allTenants.find(t => t.id === found.tenantId);
      if (tenant) setCurrentTenant(tenant);
    }
  };

  const updateBrandKitState = (brandKit: Partial<Tenant['brandKit']>) => {
    if (!currentTenant) return;
    const updatedTenant = {
      ...currentTenant,
      brandKit: { ...currentTenant.brandKit, ...brandKit }
    };
    setCurrentTenant(updatedTenant);
    setAllTenants(prev => prev.map(t => t.id === currentTenant.id ? updatedTenant : t));
  };

  const reloadTenants = async () => {
    await loadData();
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
  if (!context) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return context;
};
