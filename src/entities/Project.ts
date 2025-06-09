// Project entity using Superdev's built-in entity system
const Project = {
  async list() {
    // This will be handled by the Superdev platform
    const response = await fetch('/api/entities/Project');
    return response.json();
  },
  
  async create(data: any) {
    const response = await fetch('/api/entities/Project', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async update(id: string, data: any) {
    const response = await fetch(`/api/entities/Project/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async get(id: string) {
    const response = await fetch(`/api/entities/Project/${id}`);
    return response.json();
  },
  
  async delete(id: string) {
    const response = await fetch(`/api/entities/Project/${id}`, {
      method: 'DELETE'
    });
    return response.ok;
  }
};

export { Project };