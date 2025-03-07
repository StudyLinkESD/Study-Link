import axios from 'axios';
import { Job } from '@prisma/client';

const API_URL = '/api/company/jobs';

export interface JobCreateData {
  name: string;
  description: string;
  skills: string;
}

export interface JobUpdateData {
  name: string;
  description: string;
  skills: string;
}

export const jobService = {
  /**
   * Récupère toutes les offres d'emploi
   */
  getAllJobs: async (): Promise<Job[]> => {
    const response = await axios.get(API_URL);
    return response.data;
  },

  /**
   * Récupère une offre d'emploi par son ID
   */
  getJobById: async (jobId: string): Promise<Job> => {
    const response = await axios.get(`${API_URL}/${jobId}`);
    return response.data;
  },

  /**
   * Crée une nouvelle offre d'emploi
   */
  createJob: async (jobData: JobCreateData): Promise<Job> => {
    const response = await axios.post(API_URL, jobData);
    return response.data;
  },

  /**
   * Met à jour une offre d'emploi existante
   */
  updateJob: async (jobId: string, jobData: JobUpdateData): Promise<Job> => {
    const response = await axios.put(`${API_URL}/${jobId}`, jobData);
    return response.data;
  },

  /**
   * Supprime une offre d'emploi (soft delete)
   */
  deleteJob: async (jobId: string): Promise<Job> => {
    const response = await axios.delete(`${API_URL}/${jobId}`);
    return response.data;
  },
};
