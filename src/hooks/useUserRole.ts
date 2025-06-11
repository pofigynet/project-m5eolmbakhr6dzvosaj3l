import { useQuery } from "@tanstack/react-query";
import { User } from "@/entities";

export type UserRole = 'administrator' | 'editor' | 'viewer';

export interface UserPermissions {
  canView: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canAccessSettings: boolean;
}

export const useUserRole = () => {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => User.me(),
  });

  const role = (currentUser?.role || 'viewer') as UserRole;

  const permissions: UserPermissions = {
    canView: true, // All roles can view
    canEdit: role === 'administrator' || role === 'editor',
    canDelete: role === 'administrator',
    canAccessSettings: role === 'administrator' || role === 'editor',
  };

  return {
    role,
    permissions,
    isAdmin: role === 'administrator',
    isEditor: role === 'editor',
    isViewer: role === 'viewer',
  };
};