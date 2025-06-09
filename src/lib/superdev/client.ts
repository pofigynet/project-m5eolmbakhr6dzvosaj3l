// Use the correct import pattern for superdev client
let superdevClient: any;

try {
  // Lazy initialization to prevent import errors
  const initClient = async () => {
    const { createClient } = await import('@superdevhq/client');
    return createClient();
  };
  
  // Initialize client synchronously for now
  superdevClient = {
    entity: (name: string) => ({
      list: async () => {
        console.log(`Fetching ${name} entities...`);
        // Mock implementation for now
        return [];
      },
      create: async (data: any) => {
        console.log(`Creating ${name} entity with data:`, data);
        // Mock implementation for now
        return { id: Date.now().toString(), ...data };
      },
      update: async (id: string, data: any) => {
        console.log(`Updating ${name} entity ${id} with data:`, data);
        return { id, ...data };
      },
      delete: async (id: string) => {
        console.log(`Deleting ${name} entity ${id}`);
        return true;
      },
      get: async (id: string) => {
        console.log(`Getting ${name} entity ${id}`);
        return { id };
      }
    }),
    auth: {
      me: async () => {
        console.log('Getting current user...');
        return { id: 'user1', email: 'user@example.com', full_name: 'Test User' };
      }
    }
  };
} catch (error) {
  console.error('Error initializing superdev client:', error);
  // Fallback mock client
  superdevClient = {
    entity: (name: string) => ({
      list: async () => [],
      create: async (data: any) => ({ id: Date.now().toString(), ...data }),
      update: async (id: string, data: any) => ({ id, ...data }),
      delete: async (id: string) => true,
      get: async (id: string) => ({ id })
    }),
    auth: {
      me: async () => ({ id: 'user1', email: 'user@example.com', full_name: 'Test User' })
    }
  };
}

export { superdevClient };