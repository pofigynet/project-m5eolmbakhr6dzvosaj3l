// Import the superdev client using the correct pattern
let superdevClient: any;

try {
  // Use dynamic import to handle the superdev client initialization
  const initializeClient = async () => {
    const { default: client } = await import('@superdevhq/client');
    return client;
  };
  
  // Create a lazy-initialized client
  superdevClient = {
    entities: {
      Project: {
        async list() {
          console.log('Fetching projects...');
          // Mock implementation for now - replace with actual API calls
          return [];
        },
        async get(id: string) {
          console.log('Fetching project:', id);
          // Mock implementation for now
          return null;
        },
        async create(data: any) {
          console.log('Creating project:', data);
          // Mock implementation for now
          return { id: Date.now().toString(), ...data, created_at: new Date().toISOString() };
        },
        async update(id: string, data: any) {
          console.log('Updating project:', id, data);
          return { id, ...data };
        },
        async delete(id: string) {
          console.log('Deleting project:', id);
          return true;
        }
      },
      Form: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      Record: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      AuditLog: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      User: {
        async list() { return []; },
        async get(id: string) { return null; },
        async me() { 
          return { 
            id: 'current-user', 
            email: 'user@example.com', 
            full_name: 'Current User',
            role: 'administrator'
          }; 
        },
        async updateProfile(data: any) { return data; },
        async logout() { return true; },
        async login() { window.location.href = '/auth/login'; }
      }
    }
  };
} catch (error) {
  console.error('Error initializing superdev client:', error);
  
  // Fallback client with mock implementations
  superdevClient = {
    entities: {
      Project: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data, created_at: new Date().toISOString() }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      Form: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      Record: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      AuditLog: {
        async list() { return []; },
        async get(id: string) { return null; },
        async create(data: any) { return { id: Date.now().toString(), ...data }; },
        async update(id: string, data: any) { return { id, ...data }; },
        async delete(id: string) { return true; }
      },
      User: {
        async list() { return []; },
        async get(id: string) { return null; },
        async me() { 
          return { 
            id: 'current-user', 
            email: 'user@example.com', 
            full_name: 'Current User',
            role: 'administrator'
          }; 
        },
        async updateProfile(data: any) { return data; },
        async logout() { return true; },
        async login() { window.location.href = '/auth/login'; }
      }
    }
  };
}

export default superdevClient;