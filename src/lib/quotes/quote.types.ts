export interface CreateQuoteRequestDto {
  projectId: string;
  scope: string;
  dueDate?: string; // ISO date string
  inviteeUserIds?: string[]; // contractor userIds
}

export interface QuoteRequestDto {
  id: string;
  projectId: string;
  scope: string;
  dueDate?: string;
  status: string; // QuoteStatus as string (e.g., "Draft")
  inviteeUserIds: string[];
}


