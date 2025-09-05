// src/features/contractors/types/contractor.types.ts
export interface Contractor {
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
  
  export interface SearchFilters {
    query?: string;
    location?: string;
    specialties?: string[];
    minBudget?: number;
    maxBudget?: number;
    minRating?: number;
    minYearsExperience?: number;
    isVerified?: boolean;
    isPremium?: boolean;
    sortBy?: SortOption;
  }
  
  export type SortOption = number; // 0=Relevance, 1=Rating, 2=ExperienceYears, 3=CompletedProjects, 4=PriceAsc, 5=PriceDesc, 6=Newest, 7=Premium
  
  export interface PaginationState {
    page: number;
    pageSize: number;
    totalPages: number;
    totalCount: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  }