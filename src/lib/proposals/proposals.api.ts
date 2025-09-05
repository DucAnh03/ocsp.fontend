import apiClient from '@/lib/api/client';

export interface ProposalItemInput {
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

export interface CreateProposalDto {
  quoteRequestId: string;
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemInput[];
}

export interface ProposalDto {
  id: string;
  quoteRequestId: string;
  contractorUserId: string;
  status: string;
  priceTotal: number;
  durationDays: number;
  termsSummary?: string;
  items: Array<{
    id: string;
    name: string;
    unit: string;
    qty: number;
    unitPrice: number;
  }>;
}

export interface UpdateProposalDto {
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemInput[];
}

export const proposalsApi = {
  create: async (data: CreateProposalDto): Promise<ProposalDto> => {
    const res = await apiClient.post('/proposals', data);
    return res.data;
  },
  submit: async (proposalId: string): Promise<void> => {
    await apiClient.post(`/proposals/${proposalId}/submit`);
  },
  getMineById: async (proposalId: string): Promise<ProposalDto> => {
    const res = await apiClient.get(`/proposals/${proposalId}`);
    return res.data;
  },
  getMineByQuote: async (quoteId: string): Promise<ProposalDto> => {
    const res = await apiClient.get(`/proposals/by-quote/${quoteId}/mine`);
    return res.data;
  },
  updateDraft: async (proposalId: string, data: UpdateProposalDto): Promise<ProposalDto> => {
    const res = await apiClient.put(`/proposals/${proposalId}`, data);
    return res.data;
  },
};


