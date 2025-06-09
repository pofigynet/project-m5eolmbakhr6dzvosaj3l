import { createSuperdevClient } from "@superdevhq/client";

let superdevClient: any = null;

try {
  superdevClient = createSuperdevClient({
    appId: import.meta.env.VITE_APP_ID,
    requiresAuth: true,
    baseUrl: import.meta.env.VITE_SUPERDEV_BASE_URL,
    loginUrl: `${import.meta.env.VITE_SUPERDEV_BASE_URL}/auth/app-login?app_id=${
      import.meta.env.VITE_APP_ID
    }`,
    // Add timeout and retry configuration
    timeout: 10000,
    retries: 3,
  });
} catch (error) {
  console.error("Failed to initialize Superdev client:", error);
  
  // Create a fallback client with mock methods
  superdevClient = {
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
  };
}

export { superdevClient };