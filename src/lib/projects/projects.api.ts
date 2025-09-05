import apiClient from '@/lib/api/client';
import { type CreateProjectDto, type UpdateProjectDto, type ProjectResponseDto, type ProjectDetailDto } from './project.types';

export const projectsApi = {
  // Get all projects for current homeowner
  getMyProjects: async (): Promise<ProjectResponseDto[]> => {
    const res = await apiClient.get('/projects/my-projects');
    return res.data;
  },

  // Get project by ID
  getProject: async (id: string): Promise<ProjectDetailDto> => {
    const res = await apiClient.get(`/projects/${id}`);
    return res.data;
  },

  // Create new project
  createProject: async (data: CreateProjectDto): Promise<ProjectDetailDto> => {
    const res = await apiClient.post('/projects', data);
    return res.data;
  },

  // Update project
  updateProject: async (id: string, data: UpdateProjectDto): Promise<ProjectDetailDto> => {
    const res = await apiClient.put(`/projects/${id}`, data);
    return res.data;
  },
};
export { ProjectResponseDto, ProjectDetailDto, UpdateProjectDto };

