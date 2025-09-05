import apiClient from '@/lib/api/client';

export interface CreateContractDto {
  proposalId: string;
  terms: string;
}

export interface ContractDto {
  id: string;
  proposalId: string;
  terms: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  proposal?: {
    id: string;
    contractorUserId: string;
    priceTotal: number;
    durationDays: number;
    termsSummary?: string;
    contractor?: {
      companyName: string;
      contactPerson: string;
      phone: string;
      email: string;
    };
    quoteRequest?: {
      id: string;
      project?: {
        title: string;
        description: string;
      };
    };
  };
}

export interface ContractDetailDto {
  id: string;
  proposalId: string;
  projectId: string;
  contractorUserId: string;
  homeownerUserId: string;
  terms: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  items: ContractItemDto[];
}

export interface ContractItemDto {
  id: string;
  name: string;
  qty: number;
  unit: string;
  unitPrice: number;
  total: number;
}

export interface UpdateContractStatusDto {
  contractId: string;
  status: number; // 0: Draft, 1: PendingSignatures, 2: Active, 3: Completed, 4: Cancelled
}

export interface ContractListItemDto {
  id: string;
  projectId: string;
  projectName: string;
  contractorName: string;
  totalPrice: number;
  status: string;
  createdAt: string;
}

export const contractsApi = {
  // Homeowner: Create contract from proposal
  create: async (data: CreateContractDto): Promise<ContractDto> => {
    const res = await apiClient.post('/contracts', data);
    return res.data;
  },
  
  // Homeowner: Get all contracts
  getAll: async (): Promise<ContractListItemDto[]> => {
    const res = await apiClient.get('/contracts/my');
    return res.data;
  },
  
  // Homeowner: Get contract by ID
  getById: async (id: string): Promise<ContractDto> => {
    const res = await apiClient.get(`/contracts/${id}`);
    return res.data;
  },

  // Homeowner: Get contract detail by ID
  getDetailById: async (id: string): Promise<ContractDetailDto> => {
    const res = await apiClient.get(`/contracts/${id}`);
    return res.data;
  },

  // Update contract status (both homeowner and contractor)
  updateStatus: async (id: string, status: number): Promise<ContractDto> => {
    const res = await apiClient.post(`/contracts/${id}/status`, {
      contractId: id,
      status: status
    });
    return res.data;
  },
};
