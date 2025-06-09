import { createSuperdevClient } from "@superdevhq/client";

let superdevClient: any = null;
let initializationAttempted = false;

// Create a fallback client with mock methods
const createFallbackClient = () => ({
  entity: (entityName: string) => ({
    list: () => Promise.resolve([]),
    get: (id: string) => Promise.resolve(null),
    create: (data: any) => Promise.resolve({ id: Date.now().toString(), ...data }),
    update: (id: string, data: any) => Promise.resolve({ id, ...data }),
    delete: (id: string) => Promise.resolve(true),
    filter: (filters: any) => Promise.resolve([]),
    query: () => ({
      where: () => ({ exec: () => Promise.resolve([]) }),
      exec: () => Promise.resolve([]),
    }),
  }),
  auth: {
    me: () => Promise.resolve({ 
      id: 'demo-user', 
      email: 'demo@example.com', 
      full_name: 'Demo User',
      role: 'administrator'
    }),
    list: () => Promise.resolve([]),
    login: () => Promise.resolve(),
    logout: () => Promise.resolve(),
  },
  integrations: {
    core: {
      invokeLLM: (params: any) => Promise.resolve("I'm currently offline. Please try again later."),
      uploadFile: (params: any) => Promise.resolve({ file_url: "" }),
      generateImage: (params: any) => Promise.resolve({ url: "" }),
      getUploadedFile: (params: any) => Promise.resolve(""),
      sendEmail: (params: any) => Promise.resolve(true),
      extractDataFromUploadedFile: (params: any) => Promise.resolve({ status: "error", details: "Service unavailable" }),
    }
  }
});

// Lazy initialization function
const initializeSuperdevClient = async () => {
  if (initializationAttempted) {
    return superdevClient;
  }
  
  initializationAttempted = true;
  
  try {
    console.log("Attempting to initialize Superdev client...");
    
    // Check if required environment variables are available
    if (!import.meta.env.VITE_APP_ID || !import.meta.env.VITE_SUPERDEV_BASE_URL) {
      console.warn("Missing required environment variables, using fallback client");
      superdevClient = createFallbackClient();
      return superdevClient;
    }

    superdevClient = createSuperdevClient({
      appId: import.meta.env.VITE_APP_ID,
      requiresAuth: true,
      baseUrl: import.meta.env.VITE_SUPERDEV_BASE_URL,
      loginUrl: `${import.meta.env.VITE_SUPERDEV_BASE_URL}/auth/app-login?app_id=${
        import.meta.env.VITE_APP_ID
      }`,
      timeout: 10000,
      retries: 3,
    });
    
    console.log("Superdev client initialized successfully");
    return superdevClient;
  } catch (error) {
    console.error("Failed to initialize Superdev client:", error);
    superdevClient = createFallbackClient();
    return superdevClient;
  }
};

// Create a proxy that initializes the client on first use
const createClientProxy = () => {
  return new Proxy({}, {
    get(target, prop) {
      if (prop === 'entity') {
        return (entityName: string) => {
          return new Proxy({}, {
            get(entityTarget, entityProp) {
              return async (...args: any[]) => {
                const client = await initializeSuperdevClient();
                return client.entity(entityName)[entityProp](...args);
              };
            }
          });
        };
      }
      
      if (prop === 'auth') {
        return new Proxy({}, {
          get(authTarget, authProp) {
            return async (...args: any[]) => {
              const client = await initializeSuperdevClient();
              return client.auth[authProp](...args);
            };
          }
        });
      }
      
      if (prop === 'integrations') {
        return new Proxy({}, {
          get(integrationsTarget, integrationsProp) {
            if (integrationsProp === 'core') {
              return new Proxy({}, {
                get(coreTarget, coreProp) {
                  return async (...args: any[]) => {
                    const client = await initializeSuperdevClient();
                    return client.integrations.core[coreProp](...args);
                  };
                }
              });
            }
            return undefined;
          }
        });
      }
      
      return async (...args: any[]) => {
        const client = await initializeSuperdevClient();
        return client[prop](...args);
      };
    }
  });
};

// Export the proxy client
export const superdevClient = createClientProxy();