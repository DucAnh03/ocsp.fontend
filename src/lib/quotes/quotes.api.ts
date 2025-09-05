import apiClient from '@/lib/api/client';
import { type CreateQuoteRequestDto, type QuoteRequestDto } from './quote.types';

export const quotesApi = {
  // Create Quote Request (Draft) as Homeowner
  create: async (data: CreateQuoteRequestDto): Promise<QuoteRequestDto> => {
    const res = await apiClient.post('/quotes', data);
    return res.data;
  },
  // List quotes by project
  listByProject: async (projectId: string): Promise<QuoteRequestDto[]> => {
    const res = await apiClient.get('/quotes', { params: { projectId } });
    return res.data;
  },
  // Add invitee to quote
  addInvitee: async (quoteId: string, contractorUserId: string): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/invite`, { contractorUserId });
  },
  // Send quote to contractors (Draft -> Sent)
  send: async (quoteId: string): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/send`);
  },
  // Send quote to all contractors
  sendToAllContractors: async (quoteId: string): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/send-to-all`);
  },
  // Send quote to specific contractor
  sendToContractor: async (quoteId: string, contractorUserId: string): Promise<void> => {
    await apiClient.post(`/quotes/${quoteId}/send-to-contractor`, { contractorUserId });
  },
};


