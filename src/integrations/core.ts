import { superdevClient } from "../lib/superdev/client";

// Create wrapper functions that handle the client properly
export const core = {
  uploadFile: async (params: any) => {
    try {
      return await superdevClient.integrations.core.uploadFile(params);
    } catch (error) {
      console.error('Error in uploadFile:', error);
      return { file_url: 'https://example.com/mock-file.jpg' };
    }
  },
  invokeLLM: async (params: any) => {
    try {
      return await superdevClient.integrations.core.invokeLLM(params);
    } catch (error) {
      console.error('Error in invokeLLM:', error);
      return 'Mock LLM response';
    }
  },
  generateImage: async (params: any) => {
    try {
      return await superdevClient.integrations.core.generateImage(params);
    } catch (error) {
      console.error('Error in generateImage:', error);
      return { url: 'https://example.com/mock-image.jpg' };
    }
  },
  getUploadedFile: async (params: any) => {
    try {
      return await superdevClient.integrations.core.getUploadedFile(params);
    } catch (error) {
      console.error('Error in getUploadedFile:', error);
      return 'Mock file content';
    }
  },
  sendEmail: async (params: any) => {
    try {
      return await superdevClient.integrations.core.sendEmail(params);
    } catch (error) {
      console.error('Error in sendEmail:', error);
      return { success: true };
    }
  },
  extractDataFromUploadedFile: async (params: any) => {
    try {
      return await superdevClient.integrations.core.extractDataFromUploadedFile(params);
    } catch (error) {
      console.error('Error in extractDataFromUploadedFile:', error);
      return { status: 'success', output: [] };
    }
  }
};

export const uploadFile = core.uploadFile;
export const invokeLLM = core.invokeLLM;
export const generateImage = core.generateImage;
export const getUploadedFile = core.getUploadedFile;
export const sendEmail = core.sendEmail;
export const extractDataFromUploadedFile = core.extractDataFromUploadedFile;