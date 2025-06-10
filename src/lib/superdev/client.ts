// Superdev client configuration and initialization
class SuperdevClient {
  entities: any;

  constructor() {
    this.entities = {
      Project: {
        list: async () => {
          // Mock implementation for now
          return [];
        },
        get: async (id: string) => {
          // Mock implementation for now
          return null;
        },
        create: async (data: any) => {
          // Mock implementation for now
          return { id: Date.now().toString(), ...data };
        },
        update: async (id: string, data: any) => {
          // Mock implementation for now
          return { id, ...data };
        },
        delete: async (id: string) => {
          // Mock implementation for now
          return true;
        },
      },
      Form: {
        list: async () => [],
        get: async (id: string) => null,
        create: async (data: any) => ({ id: Date.now().toString(), ...data }),
        update: async (id: string, data: any) => ({ id, ...data }),
        delete: async (id: string) => true,
      },
      Record: {
        list: async () => [],
        get: async (id: string) => null,
        create: async (data: any) => ({ id: Date.now().toString(), ...data }),
        update: async (id: string, data: any) => ({ id, ...data }),
        delete: async (id: string) => true,
      },
      AuditLog: {
        list: async () => [],
        get: async (id: string) => null,
        create: async (data: any) => ({ id: Date.now().toString(), ...data }),
        update: async (id: string, data: any) => ({ id, ...data }),
        delete: async (id: string) => true,
      },
      User: {
        list: async () => [],
        get: async (id: string) => null,
        me: async () => ({ id: '1', email: 'user@example.com', full_name: 'Test User', role: 'administrator' }),
        updateProfile: async (data: any) => ({ id: '1', ...data }),
        login: async () => window.location.href = '/auth/login',
        logout: async () => window.location.href = '/auth/logout',
      },
    };
  }
}

const superdevClient = new SuperdevClient();
export default superdevClient;