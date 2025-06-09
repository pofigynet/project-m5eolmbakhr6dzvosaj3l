// Record entity using Superdev's built-in entity system
const Record = {
  async list() {
    const response = await fetch('/api/entities/Record');
    return response.json();
  },
  
  async filter(filters: any) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    const response = await fetch(`/api/entities/Record?${params}`);
    return response.json();
  },
  
  async create(data: any) {
    const response = await fetch('/api/entities/Record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export { Record };