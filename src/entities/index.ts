import { superdevClient } from "@/lib/superdev/client";

export const AuditLog = superdevClient.entity("AuditLog");
export const Form = superdevClient.entity("Form");
export const FormVisitAssignment = superdevClient.entity("FormVisitAssignment");
export const Project = superdevClient.entity("Project");
export const Record = superdevClient.entity("Record");
export const User = superdevClient.auth;
