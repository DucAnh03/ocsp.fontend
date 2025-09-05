// src/lib/api/contractors.api.ts
import { apiClient } from './client';

// Types for contractor API
export interface ContractorSearchParams {
  query?: string;
  location?: string;
  specialties?: string[];
  minBudget?: number;
  maxBudget?: number;
  minRating?: number;
  minYearsExperience?: number;
  isVerified?: boolean;
  isPremium?: boolean;
  sortBy?: number; // 0=Relevance, 1=Rating, 2=ExperienceYears, 3=CompletedProjects, 4=PriceAsc, 5=PriceDesc, 6=Newest, 7=Premium
  page?: number;
  pageSize?: number;
}

export interface ContractorSummary {
  id: string;
  companyName: string;
  description?: string;
  averageRating: number;
  totalReviews: number;
  completedProjects: number;
  yearsOfExperience: number;
  city?: string;
  contactPhone?: string;
  minProjectBudget?: number;
  maxProjectBudget?: number;
  isVerified: boolean;
  isPremium: boolean;
  specialties: string[];
  featuredImageUrl?: string;
  createdAt: string;
  profileCompletionPercentage: number;
}

export interface ContractorListResponse {
  contractors: ContractorSummary[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ContractorProfile {
  id: string;
  companyName: string;
  description?: string;
  website?: string;
  contactPhone?: string;
  contactEmail?: string;
  address?: string;
  city?: string;
  province?: string;
  yearsOfExperience: number;
  teamSize: number;
  minProjectBudget?: number;
  maxProjectBudget?: number;
  averageRating: number;
  totalReviews: number;
  completedProjects: number;
  ongoingProjects: number;
  isVerified: boolean;
  isActive: boolean;
  isPremium: boolean;
  profileCompletionPercentage: number;
  specialties: ContractorSpecialty[];
  documents: ContractorDocument[];
  portfolios: ContractorPortfolio[];
  recentReviews: ReviewSummary[];
  createdAt: string;
  updatedAt: string;
}

export interface ContractorSpecialty {
  id: string;
  specialtyName: string;
  description?: string;
  experienceYears: number;
}

export interface ContractorDocument {
  id: string;
  documentType: string;
  documentName: string;
  documentUrl: string;
  expiryDate: string;
  isVerified: boolean;
}

export interface ContractorPortfolio {
  id: string;
  projectName: string;
  projectDescription?: string;
  imageUrl?: string;
  projectValue?: number;
  completedDate: string;
  clientTestimonial?: string;
  displayOrder: number;
}

export interface ReviewSummary {
  id: string;
  reviewerName: string;
  rating: number;
  comment?: string;
  createdAt: string;
  projectName?: string;
}

export interface AIRecommendationRequest {
  projectDescription: string;
  budget?: number;
  preferredLocation?: string;
  requiredSpecialties?: string[];
  preferredStartDate?: string;
  complexity?: 'Simple' | 'Medium' | 'Complex' | 'VeryComplex';
}

export interface ContractorRecommendation {
  contractor: ContractorSummary;
  matchScore: number;
  matchReason: string;
  matchingFactors: string[];
}

// Contractor API methods
export const contractorsApi = {
  // UC-16: Search contractors
  search: async (params: ContractorSearchParams): Promise<ContractorListResponse> => {
    const response = await apiClient.post('/contractor/search', params);
    return response.data;
  },

  // UC-17: Get all contractors with pagination
  getAll: async (page: number = 1, pageSize: number = 10): Promise<ContractorListResponse> => {
    const response = await apiClient.get(`/contractor?page=${page}&pageSize=${pageSize}`);
    return response.data;
  },

  // UC-18: Get contractor profile
  getProfile: async (contractorId: string): Promise<ContractorProfile> => {
    const response = await apiClient.get(`/contractor/${contractorId}`);
    return response.data;
  },

  // UC-22: Get AI recommendations
  getAIRecommendations: async (request: AIRecommendationRequest): Promise<ContractorRecommendation[]> => {
    const response = await apiClient.post('/contractor/recommendations', request);
    return response.data;
  },

  // Get featured contractors
  getFeatured: async (count: number = 6): Promise<ContractorSummary[]> => {
    const response = await apiClient.get(`/contractor/featured?count=${count}`);
    return response.data;
  },

  // Get search suggestions
  getSearchSuggestions: async (query: string): Promise<string[]> => {
    const response = await apiClient.get(`/contractor/search/suggestions?query=${encodeURIComponent(query)}`);
    return response.data;
  },

  // Validate communication (anti-circumvention)
  validateCommunication: async (content: string, toUserId: string, projectId?: string) => {
    const response = await apiClient.post('/contractor/validate-communication', {
      content,
      toUserId,
      projectId
    });
    return response.data;
  }
};

export default contractorsApi;