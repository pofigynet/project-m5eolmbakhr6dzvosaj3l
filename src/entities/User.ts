// User entity using Superdev's built-in entity system
const User = {
  async list() {
    const response = await fetch('/api/entities/User');
    return response.json();
  },
  
  async me() {
    const response = await fetch('/api/auth/me');
    return response.json();
  }
};

export { User };