import { createClient } from '@superdevhq/client';

const client = createClient();

// Create proper entity wrappers
export const AuditLog = client.entity("AuditLog");
export const Form = client.entity("Form");
export const Project = client.entity("Project");
export const Record = client.entity("Record");
export const User = client.auth;