// Enhanced Superdev client with better error handling and fallback modes
let superdevClient: any = null;

const initializeSuperdevClient = async () => {
  if (superdevClient) {
    return superdevClient;
  }

  try {
    // Try to import and initialize the Superdev client
    const { SuperdevClient } = await import('@superdevhq/client');
    
    superdevClient = new SuperdevClient({
      timeout: 10000, // 10 second timeout
      retries: 2,
      fallbackMode: true, // Enable fallback mode for offline scenarios
    });

    console.log('Superdev client initialized successfully');
    return superdevClient;
  } catch (error) {
    console.warn('Failed to initialize Superdev client, using fallback mode:', error);
    
    // Create a fallback client that returns mock data
    superdevClient = createFallbackClient();
    return superdevClient;
  }
};

const createFallbackClient = () => {
  return {
    entity: (entityName: string) => ({
      list: async () => {
        console.log(`Fallback: listing ${entityName}`);
        return [];
      },
      get: async (id: string) => {
        console.log(`Fallback: getting ${entityName} with id ${id}`);
        return null;
      },
      create: async (data: any) => {
        console.log(`Fallback: creating ${entityName}`, data);
        return { id: Date.now().toString(), ...data };
      },
      update: async (id: string, data: any) => {
        console.log(`Fallback: updating ${entityName} ${id}`, data);
        return { id, ...data };
      },
      delete: async (id: string) => {
        console.log(`Fallback: deleting ${entityName} ${id}`);
        return true;
      },
      filter: async (filters: any) => {
        console.log(`Fallback: filtering ${entityName}`, filters);
        return [];
      }
    }),
    auth: {
      me: async () => {
        console.log('Fallback: getting current user');
        return {
          id: 'demo-user',
          email: 'demo@example.com',
          full_name: 'Demo User',
          role: 'administrator',
          is_active: true
        };
      },
      list: async () => {
        console.log('Fallback: listing users');
        return [
          {
            id: 'demo-user',
            email: 'demo@example.com',
            full_name: 'Demo User',
            role: 'administrator',
            is_active: true
          }
        ];
      },
      login: async () => {
        console.log('Fallback: login called');
        return true;
      },
      logout: async () => {
        console.log('Fallback: logout called');
        return true;
      }
    }
  };
};

// Initialize the client immediately
const clientPromise = initializeSuperdevClient();

export { clientPromise as superdevClient };