// AuditLog entity using Superdev's built-in entity system
const AuditLog = {
  async list() {
    const response = await fetch('/api/entities/AuditLog');
    return response.json();
  },
  
  async create(data: any) {
    const response = await fetch('/api/entities/AuditLog', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export { AuditLog };