// src/store/contractor-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Contractor, SearchFilters, PaginationState, SortOption } from '@/components/features/contractors/types/contractor.types';
import contractorsApi, { ContractorSummary, ContractorRecommendation } from '@/lib/api/contractors';


interface ContractorStore {
    // State
    contractors: ContractorSummary[];
    featuredContractors: ContractorSummary[];
    currentContractor: Contractor | null;
    recommendations: ContractorRecommendation[];
    searchFilters: SearchFilters;
    pagination: PaginationState;
    loading: boolean;
    searchLoading: boolean;
    error: string | null;
    searchSuggestions: string[];
  
    // Actions
    setSearchFilters: (filters: Partial<SearchFilters>) => void;
    clearSearchFilters: () => void;
    searchContractors: () => Promise<void>;
    loadMoreContractors: () => Promise<void>;
    setCurrentContractor: (contractor: Contractor | null) => void;
    fetchContractorProfile: (id: string) => Promise<void>;
    fetchFeaturedContractors: () => Promise<void>;
    getAIRecommendations: (request: any) => Promise<void>;
    getSearchSuggestions: (query: string) => Promise<void>;
    setSortBy: (sortBy: SortOption) => void;
    setPage: (page: number) => void;
    clearError: () => void;
  }
  
  const initialPagination: PaginationState = {
    page: 1,
    pageSize: 12,
    totalPages: 0,
    totalCount: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  };
  
  const initialFilters: SearchFilters = {
    sortBy: 7, // Premium
  };
  
  export const useContractorStore = create<ContractorStore>()(
    devtools(
      (set, get) => ({
        // Initial state
        contractors: [],
        featuredContractors: [],
        currentContractor: null,
        recommendations: [],
        searchFilters: initialFilters,
        pagination: initialPagination,
        loading: false,
        searchLoading: false,
        error: null,
        searchSuggestions: [],
  
        // Actions
        setSearchFilters: (filters) => {
          set((state) => ({
            searchFilters: { ...state.searchFilters, ...filters },
            pagination: { ...state.pagination, page: 1 }, // Reset page when filters change
          }));
        },
  
        clearSearchFilters: () => {
          set({
            searchFilters: initialFilters,
            pagination: initialPagination,
          });
        },
  
        searchContractors: async () => {
          try {
            set({ searchLoading: true, error: null });
            const { searchFilters, pagination } = get();
            
            const searchParams = {
              ...searchFilters,
              page: pagination.page,
              pageSize: pagination.pageSize,
            };
  
            const response = await contractorsApi.search(searchParams);
            
            set({
              contractors: pagination.page === 1 ? response.contractors : [...get().contractors, ...response.contractors],
              pagination: {
                ...pagination,
                totalPages: response.totalPages,
                totalCount: response.totalCount,
                hasNextPage: response.hasNextPage,
                hasPreviousPage: response.hasPreviousPage,
              },
              searchLoading: false,
            });
          } catch (error: any) {
            set({ 
            //   error: error.response?.data?.message || 'Có lỗi xảy ra khi tìm kiếm nhà thầu',
              searchLoading: false,
            });
          }
        },
  
        loadMoreContractors: async () => {
          const { pagination } = get();
          if (!pagination.hasNextPage) return;
  
          set((state) => ({
            pagination: { ...state.pagination, page: pagination.page + 1 },
          }));
  
          await get().searchContractors();
        },
  
        setCurrentContractor: (contractor) => {
          set({ currentContractor: contractor });
        },
  
        fetchContractorProfile: async (id) => {
          try {
            set({ loading: true, error: null });
            const contractor = await contractorsApi.getProfile(id);
            set({ currentContractor: contractor, loading: false });
          } catch (error: any) {
            set({ 
              error: error.response?.data?.message || 'Không thể tải thông tin nhà thầu',
              loading: false,
            });
          }
        },
  
        fetchFeaturedContractors: async () => {
          try {
            const contractors = await contractorsApi.getFeatured(6);
            set({ featuredContractors: contractors });
          } catch (error: any) {
            console.error('Failed to fetch featured contractors:', error);
          }
        },
  
        getAIRecommendations: async (request) => {
          try {
            set({ loading: true, error: null });
            const recommendations = await contractorsApi.getAIRecommendations(request);
            set({ recommendations, loading: false });
          } catch (error: any) {
            set({ 
              error: error.response?.data?.message || 'Không thể tạo khuyến nghị AI',
              loading: false,
            });
          }
        },
  
        getSearchSuggestions: async (query) => {
          try {
            if (query.length < 2) {
              set({ searchSuggestions: [] });
              return;
            }
            const suggestions = await contractorsApi.getSearchSuggestions(query);
            set({ searchSuggestions: suggestions });
          } catch (error) {
            console.error('Failed to get search suggestions:', error);
            set({ searchSuggestions: [] });
          }
        },
  
        setSortBy: (sortBy) => {
          set((state) => ({
            searchFilters: { ...state.searchFilters, sortBy },
            pagination: { ...state.pagination, page: 1 },
          }));
        },
  
        setPage: (page) => {
          set((state) => ({
            pagination: { ...state.pagination, page },
          }));
        },
  
        clearError: () => {
          set({ error: null });
        },
      }),
      {
        name: 'contractor-store',
      }
    )
  );