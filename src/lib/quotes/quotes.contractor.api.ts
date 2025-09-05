import apiClient from '@/lib/api/client';

export interface QuoteInviteSummaryDto {
  id: string;
  scope: string;
  dueDate?: string;
  status: string;
}

export interface ProjectSummaryDto {
  id: string;
  name: string;
  description?: string;
  address?: string;
  budget?: number;
  actualBudget?: number;
  numberOfFloors: number;
  floorArea: number;
  startDate: string;
  estimatedCompletionDate?: string;
}

export interface InviteeSummaryDto {
  userId: string;
  username: string;
  companyName?: string;
}

export interface MyProposalSummaryDto {
  id?: string;
  status?: string;
  priceTotal?: number;
  durationDays?: number;
}

export interface QuoteRequestDetailDto {
  id: string;
  scope: string;
  dueDate?: string;
  status: string;
  createdAt?: string;
  updatedAt?: string;
  project: ProjectSummaryDto;
  homeowner: { userId: string; username: string; email: string };
  invitees: InviteeSummaryDto[];
  myProposal?: MyProposalSummaryDto;
}

export const contractorQuotesApi = {
  myInvites: async (): Promise<QuoteInviteSummaryDto[]> => {
    const res = await apiClient.get('/quotes/my-invites');
    return res.data;
  },
  myInvitesDetailed: async (): Promise<QuoteRequestDetailDto[]> => {
    const res = await apiClient.get('/quotes/my-invites/detailed');
    return res.data;
  },
  getById: async (id: string): Promise<QuoteInviteSummaryDto> => {
    const res = await apiClient.get(`/quotes/${id}`);
    return res.data;
  },
  getDetail: async (id: string): Promise<QuoteRequestDetailDto> => {
    const res = await apiClient.get(`/quotes/${id}/detail`);
    return res.data;
  },
};


