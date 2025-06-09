// Form entity using Superdev's built-in entity system
const Form = {
  async list() {
    const response = await fetch('/api/entities/Form');
    return response.json();
  },
  
  async filter(filters: any) {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      params.append(key, String(value));
    });
    const response = await fetch(`/api/entities/Form?${params}`);
    return response.json();
  },
  
  async create(data: any) {
    const response = await fetch('/api/entities/Form', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async update(id: string, data: any) {
    const response = await fetch(`/api/entities/Form/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async get(id: string) {
    const response = await fetch(`/api/entities/Form/${id}`);
    return response.json();
  }
};

export { Form };