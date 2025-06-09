import { superdevClient } from "@/lib/superdev/client";

// Create proper entity wrappers that actually work
export const AuditLog = superdevClient.entity("AuditLog");
export const Form = superdevClient.entity("Form");
export const Project = superdevClient.entity("Project");
export const Record = superdevClient.entity("Record");
export const User = superdevClient.auth;