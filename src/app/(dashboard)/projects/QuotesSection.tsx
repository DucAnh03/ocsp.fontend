"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { ProjectResponseDto } from '@/lib/projects/projects.api';
import { quotesApi } from '@/lib/quotes/quotes.api';
import { contractorsApi } from '@/lib/api/contractors';
import { homeownerProposalsApi } from '@/lib/proposals/proposals.homeowner.api';
import { contractsApi, type CreateContractDto } from '@/lib/contracts/contracts.api';
import type { CreateQuoteRequestDto, QuoteRequestDto } from '@/lib/quotes/quote.types';
import type { ContractorSummary } from '@/lib/api/contractors';
import type { ProposalDto } from '@/lib/proposals/proposal.types';
import { CheckCircleOutlined, EyeOutlined, FileTextOutlined, UserOutlined } from '@ant-design/icons';

type Props = {
  projects: ProjectResponseDto[];
};

export default function QuotesSection({ projects }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-amber-300 tracking-wide';
  const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-amber-600 text-stone-900 px-4 py-2 font-semibold hover:bg-amber-500 active:bg-amber-600 transition';

  const [qrProjectId, setQrProjectId] = useState<string>('');
  const [qrScope, setQrScope] = useState<string>('');
  const [qrDueDate, setQrDueDate] = useState<string>('');
  const [qrSubmitting, setQrSubmitting] = useState<boolean>(false);
  const [qrSuccess, setQrSuccess] = useState<string | null>(null);
  const [qrError, setQrError] = useState<string | null>(null);
  const [listLoading, setListLoading] = useState<boolean>(false);
  const [quotes, setQuotes] = useState<QuoteRequestDto[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [contractors, setContractors] = useState<ContractorSummary[]>([]);
  
  // Proposals state
  const [proposals, setProposals] = useState<ProposalDto[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<ProposalDto | null>(null);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractTerms, setContractTerms] = useState('');
  const [creatingContract, setCreatingContract] = useState(false);
  const [proposalSuccess, setProposalSuccess] = useState<string | null>(null);
  const [proposalError, setProposalError] = useState<string | null>(null);

  const selectedProjectId = useMemo(() => qrProjectId || (projects[0]?.id ?? ''), [qrProjectId, projects]);

  // Auto-hide success and error messages after 5 seconds
  useEffect(() => {
    if (proposalSuccess) {
      const timer = setTimeout(() => {
        setProposalSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [proposalSuccess]);

  useEffect(() => {
    if (proposalError) {
      const timer = setTimeout(() => {
        setProposalError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [proposalError]);

  const loadQuotes = async (projectId: string) => {
    if (!projectId) { setQuotes([]); return; }
    try {
      setListLoading(true);
      const data = await quotesApi.listByProject(projectId);
      setQuotes(data);
      
      // Load proposals for each quote
      const allProposals: ProposalDto[] = [];
      for (const quote of data) {
        try {
          const quoteProposals = await homeownerProposalsApi.getByQuote(quote.id);
          allProposals.push(...quoteProposals);
        } catch (e) {
          // Silent fail for individual quotes
          console.warn(`Failed to load proposals for quote ${quote.id}:`, e);
        }
      }
      setProposals(allProposals);
    } catch (e) {
      // silent fail to keep UI smooth; could surface later
      setQuotes([]);
      setProposals([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (projects.length > 0 && !qrProjectId) {
      setQrProjectId(projects[0].id);
    }
  }, [projects]);

  useEffect(() => {
    loadQuotes(selectedProjectId);
  }, [selectedProjectId]);

  // Load contractors for invitee selection
  useEffect(() => {
    const loadContractors = async () => {
      try {
        const response = await contractorsApi.getAll(1, 50); // Load first 50 contractors
        setContractors(response.contractors);
      } catch (e) {
        console.error('Failed to load contractors:', e);
      }
    };
    loadContractors();
  }, []);

  const handleCreateQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    setQrSuccess(null);
    setQrError(null);
    if (!qrProjectId) { setQrError('Vui lòng chọn dự án'); return; }
    if (!qrScope.trim()) { setQrError('Vui lòng nhập phạm vi công việc (scope)'); return; }
    try {
      setQrSubmitting(true);
      const payload: CreateQuoteRequestDto = {
        projectId: qrProjectId,
        scope: qrScope.trim(),
        dueDate: qrDueDate ? new Date(qrDueDate).toISOString() : undefined,
        inviteeUserIds: [], // Không chọn nhà thầu lúc tạo
      };
      const res = await quotesApi.create(payload);
      setQrSuccess(`Tạo bản nháp Quote Request thành công (trạng thái: ${res.status})`);
      setQrScope('');
      setQrDueDate('');
      await loadQuotes(selectedProjectId);
    } catch (e: any) {
      setQrError(e?.response?.data || e?.message || 'Tạo Quote Request thất bại');
    } finally {
      setQrSubmitting(false);
    }
  };

  // Proposal handlers
  const handleViewProposal = (proposal: ProposalDto) => {
    setSelectedProposal(proposal);
    setShowProposalModal(true);
  };

  const handleAcceptProposal = async (proposalId: string) => {
    try {
      setProposalError(null); // Clear previous errors
      await homeownerProposalsApi.accept(proposalId);
      // Reload proposals
      setProposals(prev => prev.map(p => 
        p.id === proposalId ? { ...p, status: 'Accepted' } : p
      ));
      setShowProposalModal(false);
      setProposalSuccess('Chấp nhận proposal thành công!');
    } catch (error: any) {
      console.error('Failed to accept proposal:', error);
      
      // Parse error message from API response
      let errorMessage = 'Có lỗi xảy ra khi chấp nhận proposal';
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setProposalError(errorMessage);
    }
  };

  const handleCreateContract = async () => {
    if (!selectedProposal || !contractTerms.trim()) return;
    
    setCreatingContract(true);
    try {
      const contractData: CreateContractDto = {
        proposalId: selectedProposal.id,
        terms: contractTerms.trim()
      };
      
      const newContract = await contractsApi.create(contractData);
      setShowContractModal(false);
      setContractTerms('');
      setSelectedProposal(null);
      
      // Store success message in localStorage for display in contracts tab
      localStorage.setItem('contractSuccess', 'Tạo hợp đồng thành công!');
      
      // Redirect to contracts tab immediately
      router.push('/projects?tab=contracts');
      
    } catch (error) {
      console.error('Failed to create contract:', error);
      // TODO: Show error message
    } finally {
      setCreatingContract(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'text-yellow-400';
      case 'Submitted': return 'text-blue-400';
      case 'Accepted': return 'text-green-400';
      case 'Rejected': return 'text-red-400';
      default: return 'text-stone-400';
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {/* Success Message */}
      {proposalSuccess && (
        <div className="bg-blue-600/20 border border-blue-500/30 rounded-lg p-4 text-blue-300">
          <div className="flex items-center gap-2">
            <CheckCircleOutlined className="text-blue-400" />
            <span>{proposalSuccess}</span>
          </div>
        </div>
      )}

      {/* Error Message */}
      {proposalError && (
        <div className="bg-red-600/20 border border-red-500/30 rounded-lg p-4 text-red-300">
          <div className="flex items-center gap-2">
            <span className="text-red-400">⚠️</span>
            <span>{proposalError}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight text-amber-200">Yêu cầu báo giá</h3>
        <button
          className={btnPrimary}
          onClick={(e) => { e.preventDefault(); setShowForm(v => !v); }}
        >
          {showForm ? 'Đóng form' : 'Thêm bản báo giá'}
        </button>
      </div>

      {showForm && (
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={titleCls}>Tạo yêu cầu báo giá (Draft)</h3>
          </div>
          <form onSubmit={handleCreateQuote} className="space-y-4">
            <div>
              <label className="block text-sm text-stone-300 mb-1">Chọn dự án</label>
              <select
                className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100"
                value={qrProjectId}
                onChange={(e) => setQrProjectId(e.target.value)}
              >
                <option value="">-- Chọn dự án --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-stone-300 mb-1">Phạm vi công việc (scope)</label>
              <textarea
                className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100 min-h-[100px]"
                placeholder="Mô tả phạm vi thi công, yêu cầu, vật liệu..."
                value={qrScope}
                onChange={(e) => setQrScope(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm text-stone-300 mb-1">Hạn nộp báo giá (tùy chọn)</label>
              <input
                type="date"
                className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100"
                value={qrDueDate}
                onChange={(e) => setQrDueDate(e.target.value)}
              />
            </div>


            {qrError && <div className="text-rose-400 text-sm">{qrError}</div>}
            {qrSuccess && <div className="text-green-400 text-sm">{qrSuccess}</div>}

            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={qrSubmitting}
                className={btnPrimary}
              >
                {qrSubmitting ? 'Đang tạo...' : 'Tạo bản nháp'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={titleCls}>Danh sách yêu cầu báo giá</h3>
        </div>
        <div className="mb-4">
          <label className="block text-sm text-stone-300 mb-1">Lọc theo dự án</label>
          <select
            className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100"
            value={qrProjectId}
            onChange={(e) => setQrProjectId(e.target.value)}
          >
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {listLoading ? (
          <div className="text-stone-300">Đang tải...</div>
        ) : quotes.length === 0 ? (
          <div className="text-stone-400">Chưa có yêu cầu báo giá</div>
        ) : (
          <ul className="divide-y divide-stone-700/60">
            {quotes.map(q => (
              <li key={q.id} className="py-4 flex items-start justify-between">
                <div>
                  <div className="font-medium text-stone-100">{q.scope || 'Không có mô tả'}</div>
                  <div className="text-xs text-stone-400 mt-1">
                    Trạng thái: 
                    <span className={`ml-1 px-2 py-1 rounded text-xs ${
                      q.status === 'Draft' ? 'bg-yellow-900 text-yellow-300' :
                      q.status === 'Sent' ? 'bg-blue-900 text-blue-300' :
                      q.status === 'Closed' ? 'bg-green-900 text-green-300' :
                      'bg-red-900 text-red-300'
                    }`}>
                      {q.status}
                    </span>
                  </div>
                  {q.dueDate && (
                    <div className="text-xs text-stone-400">Hạn: {new Date(q.dueDate).toLocaleDateString('vi-VN')}</div>
                  )}
                  {q.inviteeUserIds.length > 0 && (
                    <div className="text-xs text-stone-400">Đã mời: {q.inviteeUserIds.length} nhà thầu</div>
                  )}
                </div>
                <div className="text-xs text-stone-500">#{q.id.slice(0, 8)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Proposals Section */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={titleCls}>Proposals từ nhà thầu</h3>
          {proposals.some(p => p.status === 'Accepted') && (
            <div className="bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2 text-green-300 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircleOutlined className="text-green-400" />
                <span>Đã chấp nhận 1 proposal</span>
              </div>
            </div>
          )}
        </div>

        {listLoading ? (
          <div className="text-stone-300">Đang tải proposals...</div>
        ) : proposals.length === 0 ? (
          <div className="text-stone-400">Chưa có proposal nào</div>
        ) : (
          <div className="grid gap-4">
            {proposals.map((proposal) => (
              <div key={proposal.id} className="bg-stone-700 rounded-lg border border-stone-600 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <UserOutlined className="text-amber-400" />
                      <div>
                        <h4 className="text-lg font-semibold text-amber-300">
                          {proposal.contractor?.companyName || 'Nhà thầu'}
                        </h4>
                        <p className="text-stone-400 text-sm">
                          {proposal.contractor?.contactPerson} • {proposal.contractor?.phone}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-stone-500 text-sm">Tổng giá trị</p>
                        <p className="text-amber-300 font-semibold text-lg">
                          {formatCurrency(proposal.priceTotal)}
                        </p>
                      </div>
                      <div>
                        <p className="text-stone-500 text-sm">Thời gian thi công</p>
                        <p className="text-stone-300">{proposal.durationDays} ngày</p>
                      </div>
                      <div>
                        <p className="text-stone-500 text-sm">Trạng thái</p>
                        <p className={`font-medium ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </p>
                      </div>
                    </div>

                    {proposal.termsSummary && (
                      <div className="mb-4">
                        <p className="text-stone-500 text-sm mb-1">Điều khoản</p>
                        <p className="text-stone-300 text-sm">{proposal.termsSummary}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <p className="text-stone-500 text-sm">Chi tiết:</p>
                      <p className="text-stone-300 text-sm">
                        {proposal.items?.length || 0} hạng mục
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => handleViewProposal(proposal)}
                      className="flex items-center gap-2 px-3 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 rounded-lg transition-colors"
                    >
                      <EyeOutlined />
                      Xem chi tiết
                    </button>
                    
                    {proposal.status === 'Submitted' && !proposals.some(p => p.status === 'Accepted') && (
                      <button
                        onClick={() => handleAcceptProposal(proposal.id)}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <CheckCircleOutlined />
                        Chấp nhận
                      </button>
                    )}
                    
                    {proposal.status === 'Accepted' && (
                      <button
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setShowContractModal(true);
                        }}
                        className="flex items-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                      >
                        <FileTextOutlined />
                        Tạo hợp đồng
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Proposal Detail Modal */}
      {showProposalModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-4xl mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-amber-300">Chi tiết Proposal</h3>
              <button
                onClick={() => setShowProposalModal(false)}
                className="text-stone-400 hover:text-stone-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Contractor Info */}
              <div className="bg-stone-700 rounded-lg p-4">
                <h4 className="text-lg font-medium text-amber-300 mb-3">Thông tin nhà thầu</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-stone-500 text-sm">Công ty</p>
                    <p className="text-stone-300">{selectedProposal.contractor?.companyName}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm">Người liên hệ</p>
                    <p className="text-stone-300">{selectedProposal.contractor?.contactPerson}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm">Điện thoại</p>
                    <p className="text-stone-300">{selectedProposal.contractor?.phone}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm">Email</p>
                    <p className="text-stone-300">{selectedProposal.contractor?.email}</p>
                  </div>
                </div>
              </div>

              {/* Proposal Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-stone-700 rounded-lg p-4">
                  <p className="text-stone-500 text-sm mb-1">Tổng giá trị</p>
                  <p className="text-amber-300 font-semibold text-xl">
                    {formatCurrency(selectedProposal.priceTotal)}
                  </p>
                </div>
                <div className="bg-stone-700 rounded-lg p-4">
                  <p className="text-stone-500 text-sm mb-1">Thời gian thi công</p>
                  <p className="text-stone-300 text-lg">{selectedProposal.durationDays} ngày</p>
                </div>
                <div className="bg-stone-700 rounded-lg p-4">
                  <p className="text-stone-500 text-sm mb-1">Trạng thái</p>
                  <p className={`font-medium text-lg ${getStatusColor(selectedProposal.status)}`}>
                    {selectedProposal.status}
                  </p>
                </div>
              </div>

              {/* Terms */}
              {selectedProposal.termsSummary && (
                <div className="bg-stone-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-amber-300 mb-3">Điều khoản</h4>
                  <p className="text-stone-300">{selectedProposal.termsSummary}</p>
                </div>
              )}

              {/* Items */}
              {selectedProposal.items && selectedProposal.items.length > 0 && (
                <div className="bg-stone-700 rounded-lg p-4">
                  <h4 className="text-lg font-medium text-amber-300 mb-3">Chi tiết hạng mục</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-stone-600">
                          <th className="text-left py-2 text-stone-400">Tên hạng mục</th>
                          <th className="text-left py-2 text-stone-400">Đơn vị</th>
                          <th className="text-right py-2 text-stone-400">Số lượng</th>
                          <th className="text-right py-2 text-stone-400">Đơn giá</th>
                          <th className="text-right py-2 text-stone-400">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedProposal.items.map((item: any, index: number) => (
                          <tr key={index} className="border-b border-stone-600/50">
                            <td className="py-2 text-stone-300">{item.name}</td>
                            <td className="py-2 text-stone-300">{item.unit}</td>
                            <td className="py-2 text-stone-300 text-right">{item.qty}</td>
                            <td className="py-2 text-stone-300 text-right">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="py-2 text-amber-300 text-right font-medium">
                              {formatCurrency(item.qty * item.unitPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-600">
                <button
                  onClick={() => setShowProposalModal(false)}
                  className="px-4 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 rounded-lg transition-colors"
                >
                  Đóng
                </button>
                {selectedProposal.status === 'Submitted' && !proposals.some(p => p.status === 'Accepted') && (
                  <button
                    onClick={() => handleAcceptProposal(selectedProposal.id)}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    Chấp nhận Proposal
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Contract Modal */}
      {showContractModal && selectedProposal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-amber-300">Tạo Hợp đồng</h3>
              <button
                onClick={() => {
                  setShowContractModal(false);
                  setContractTerms('');
                  setSelectedProposal(null);
                }}
                className="text-stone-400 hover:text-stone-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-stone-700 rounded-lg p-4">
                <h4 className="text-lg font-medium text-amber-300 mb-2">Thông tin Proposal</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-stone-500">Nhà thầu</p>
                    <p className="text-stone-300">{selectedProposal.contractor?.companyName}</p>
                  </div>
                  <div>
                    <p className="text-stone-500">Giá trị</p>
                    <p className="text-amber-300 font-semibold">
                      {formatCurrency(selectedProposal.priceTotal)}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-stone-300 mb-2">
                  Điều khoản hợp đồng <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={contractTerms}
                  onChange={(e) => setContractTerms(e.target.value)}
                  placeholder="Nhập điều khoản hợp đồng..."
                  className="w-full h-32 px-3 py-2 bg-stone-700 border border-stone-600 rounded-lg text-stone-300 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowContractModal(false);
                    setContractTerms('');
                    setSelectedProposal(null);
                  }}
                  className="px-4 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 rounded-lg transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleCreateContract}
                  disabled={!contractTerms.trim() || creatingContract}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  {creatingContract ? 'Đang tạo...' : 'Tạo hợp đồng'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


