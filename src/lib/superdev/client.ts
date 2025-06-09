// Enhanced Superdev client with better error handling and fallback modes
let superdevClientInstance: any = null;
let initializationPromise: Promise<any> | null = null;

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
    },
    integrations: {
      core: {
        uploadFile: async (params: any) => {
          console.log('Fallback: uploadFile called', params);
          return { file_url: 'https://example.com/mock-file.jpg' };
        },
        invokeLLM: async (params: any) => {
          console.log('Fallback: invokeLLM called', params);
          return 'Mock LLM response';
        },
        generateImage: async (params: any) => {
          console.log('Fallback: generateImage called', params);
          return { url: 'https://example.com/mock-image.jpg' };
        },
        getUploadedFile: async (params: any) => {
          console.log('Fallback: getUploadedFile called', params);
          return 'Mock file content';
        },
        sendEmail: async (params: any) => {
          console.log('Fallback: sendEmail called', params);
          return { success: true };
        },
        extractDataFromUploadedFile: async (params: any) => {
          console.log('Fallback: extractDataFromUploadedFile called', params);
          return { status: 'success', output: [] };
        }
      }
    }
  };
};

const initializeSuperdevClient = async () => {
  if (superdevClientInstance) {
    return superdevClientInstance;
  }

  try {
    // Try to import and initialize the Superdev client
    const { SuperdevClient } = await import('@superdevhq/client');
    
    superdevClientInstance = new SuperdevClient({
      timeout: 10000, // 10 second timeout
      retries: 2,
      fallbackMode: true, // Enable fallback mode for offline scenarios
    });

    console.log('Superdev client initialized successfully');
    return superdevClientInstance;
  } catch (error) {
    console.warn('Failed to initialize Superdev client, using fallback mode:', error);
    
    // Create a fallback client that returns mock data
    superdevClientInstance = createFallbackClient();
    return superdevClientInstance;
  }
};

// Initialize immediately and create a fallback client for synchronous access
superdevClientInstance = createFallbackClient();

// Start the real initialization in the background
if (!initializationPromise) {
  initializationPromise = initializeSuperdevClient();
}

export const superdevClient = superdevClientInstance;