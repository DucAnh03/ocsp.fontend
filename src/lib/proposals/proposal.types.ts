export interface ProposalItemDto {
  name: string;
  unit: string;
  qty: number;
  unitPrice: number;
}

export interface ContractorSummaryDto {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
}

export interface ProposalDto {
  id: string;
  quoteRequestId: string;
  contractorUserId: string;
  priceTotal: number;
  durationDays: number;
  termsSummary?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: ProposalItemDto[];
  contractor?: ContractorSummaryDto;
  quoteRequest?: {
    id: string;
    project?: {
      id: string;
      title: string;
      description: string;
    };
  };
}

export interface CreateProposalDto {
  quoteRequestId: string;
  priceTotal: number;
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemDto[];
}

export interface UpdateProposalDto {
  durationDays: number;
  termsSummary?: string;
  items: ProposalItemDto[];
}
