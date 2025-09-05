"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { contractorQuotesApi, type QuoteRequestDetailDto } from '@/lib/quotes/quotes.contractor.api';
import { proposalsApi, type CreateProposalDto, type UpdateProposalDto } from '@/lib/proposals/proposals.api';

interface Props {}

export default function InvitesSection({}: Props) {
  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-amber-300 tracking-wide';

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [invites, setInvites] = useState<QuoteRequestDetailDto[]>([]);

  // Proposal form state
  const [showFormFor, setShowFormFor] = useState<string | null>(null);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [termsSummary, setTermsSummary] = useState<string>('');
  const [items, setItems] = useState<Array<{ name: string; unit: string; qty: number; unitPrice: number }>>([
    { name: '', unit: 'gói', qty: 1, unitPrice: 0 },
  ]);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const priceTotal = useMemo(() => items.reduce((s, i) => s + (i.qty || 0) * (i.unitPrice || 0), 0), [items]);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [previewFor, setPreviewFor] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<{priceTotal: number; durationDays: number; termsSummary?: string; items: {name:string; unit:string; qty:number; unitPrice:number}[]}|null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState<string | null>(null);
  const [projectDetailData, setProjectDetailData] = useState<QuoteRequestDetailDto | null>(null);

  // Load proposal detail once when previewFor changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!previewFor) return;
      const q = invites.find(i => i.id === previewFor);
      const mp = q?.myProposal;
      if (!mp?.id) return;
      try {
        setPreviewLoading(true);
        const full = await proposalsApi.getMineById(mp.id);
        setPreviewData({
          priceTotal: full.priceTotal,
          durationDays: full.durationDays,
          termsSummary: full.termsSummary,
          items: full.items.map(i => ({ name: i.name, unit: i.unit, qty: i.qty, unitPrice: i.unitPrice }))
        });
      } catch {
        // ignore
      } finally {
        setPreviewLoading(false);
      }
    };
    // reset data on open
    if (previewFor) {
      setPreviewData(null);
      void fetchPreview();
    }
  }, [previewFor, invites]);

  const loadInvites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contractorQuotesApi.myInvitesDetailed();
      setInvites(data);
    } catch (e: any) {
      setError(e?.response?.data || e?.message || 'Không tải được lời mời');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadInvites(); }, []);

  const resetForm = () => {
    setDurationDays(30);
    setTermsSummary('');
    setItems([{ name: '', unit: 'gói', qty: 1, unitPrice: 0 }]);
  };

  const addItem = () => setItems(prev => [...prev, { name: '', unit: 'gói', qty: 1, unitPrice: 0 }]);
  const removeItem = (idx: number) => setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, key: 'name'|'unit'|'qty'|'unitPrice', value: string) => {
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [key]: key === 'qty' || key === 'unitPrice' ? Number(value) : value } : it));
  };

  const onCreateProposal = async (quoteId: string) => {
    try {
      setSubmitting(true);
      const payload: CreateProposalDto = {
        quoteRequestId: quoteId,
        durationDays,
        termsSummary: termsSummary || undefined,
        items: items.map(i => ({ name: i.name.trim(), unit: i.unit.trim(), qty: i.qty, unitPrice: i.unitPrice })),
      };
      await proposalsApi.create(payload);
      setShowFormFor(null);
      resetForm();
      await loadInvites();
      alert('Đã tạo Proposal (Draft). Bạn có thể Submit để nộp.');
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Tạo Proposal thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitProposal = async (proposalId: string) => {
    try {
      setSubmitting(true);
      await proposalsApi.submit(proposalId);
      await loadInvites();
      alert('Đã nộp Proposal');
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Submit Proposal thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const onEditProposal = async (quoteId: string) => {
    try {
      setSubmitting(true);
      const draft = await proposalsApi.getMineByQuote(quoteId);
      // Pre-fill form
      setDurationDays(draft.durationDays);
      setTermsSummary(draft.termsSummary || '');
      setItems(draft.items.map(i => ({ name: i.name, unit: i.unit, qty: i.qty, unitPrice: i.unitPrice })));
      setShowFormFor(quoteId);
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Không tải được proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveDraft = async (quoteId: string) => {
    try {
      setSubmitting(true);
      const draft = await proposalsApi.getMineByQuote(quoteId);
      const payload: UpdateProposalDto = {
        durationDays,
        termsSummary: termsSummary || undefined,
        items: items.map(i => ({ name: i.name.trim(), unit: i.unit.trim(), qty: i.qty, unitPrice: i.unitPrice })),
      };
      await proposalsApi.updateDraft(draft.id, payload);
      alert('Đã lưu bản nháp');
      await loadInvites();
    } catch (e: any) {
      alert(e?.response?.data || e?.message || 'Lưu nháp thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewProjectDetail = (quoteId: string) => {
    const quote = invites.find(q => q.id === quoteId);
    if (quote) {
      setProjectDetailData(quote);
      setShowProjectDetail(quoteId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight text-amber-200">Lời mời báo giá</h3>
        <button className="px-3 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={loadInvites}>Tải lại</button>
      </div>

      {loading ? (
        <div className="text-stone-300">Đang tải...</div>
      ) : error ? (
        <div className="text-rose-400">{error}</div>
      ) : invites.length === 0 ? (
        <div className={cardCls}>Hiện chưa có lời mời nào</div>
      ) : (
        <div className="space-y-4">
          {invites.map(q => (
            <div key={q.id} className={cardCls}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-stone-100 font-medium mb-1">{q.scope || 'Không có mô tả'}</div>
                  <div className="text-xs text-stone-400">Dự án: {q.project?.name} • {q.project?.address}</div>
                  <div className="text-xs text-stone-400">Trạng thái: {q.status}{q.dueDate ? ` • Hạn: ${new Date(q.dueDate).toLocaleDateString('vi-VN')}` : ''}</div>
                </div>
                <div className="text-xs text-stone-500">#{q.id.slice(0,8)}</div>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <button
                  className="px-3 py-1.5 rounded-md bg-blue-600 hover:bg-blue-500 text-white"
                  onClick={() => handleViewProjectDetail(q.id)}
                >
                  Xem chi tiết dự án
                </button>
                {!q.myProposal?.id ? (
                  <button className="px-3 py-1.5 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-900" onClick={() => setShowFormFor(q.id)}>Tạo Proposal</button>
                ) : (
                  <>
                    <span className="text-xs text-stone-400">Proposal: {q.myProposal.status}</span>
                    {q.myProposal.status === 'Draft' ? (
                      <button className="px-3 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => onEditProposal(q.id)}>Sửa Proposal</button>
                    ) : (
                      <button className="px-3 py-1.5 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => setPreviewFor(q.id)}>Xem Proposal</button>
                    )}
                    {q.myProposal.status === 'Draft' && (
                      <button disabled={submitting} className="px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-stone-900 disabled:opacity-50" onClick={() => onSubmitProposal(q.myProposal!.id!)}>Nộp Proposal</button>
                    )}
                  </>
                )}
              </div>


              {showFormFor === q.id && (
                <div className="mt-4 border-t border-stone-700/60 pt-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm text-stone-300 mb-1">Thời gian thi công (ngày)</label>
                      <input type="number" value={durationDays} onChange={e => setDurationDays(Number(e.target.value))} className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100" />
                    </div>
                    <div className="lg:col-span-2">
                      <label className="block text-sm text-stone-300 mb-1">Điều khoản tóm tắt</label>
                      <input value={termsSummary} onChange={e => setTermsSummary(e.target.value)} className="w-full bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100" />
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm text-stone-300">Hạng mục</label>
                      <button className="px-2 py-1 rounded bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={addItem}>Thêm</button>
                    </div>
                    <div className="space-y-2">
                      {items.map((it, idx) => (
                        <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                          <input placeholder="Tên" className="col-span-4 bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100" value={it.name} onChange={e => updateItem(idx, 'name', e.target.value)} />
                          <input placeholder="Đơn vị" className="col-span-2 bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100" value={it.unit} onChange={e => updateItem(idx, 'unit', e.target.value)} />
                          <input type="number" placeholder="Số lượng" className="col-span-2 bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100" value={it.qty} onChange={e => updateItem(idx, 'qty', e.target.value)} />
                          <input type="number" placeholder="Đơn giá" className="col-span-3 bg-stone-900/50 border border-stone-700 rounded-md px-3 py-2 text-stone-100" value={it.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                          <button className="col-span-1 px-2 py-2 rounded bg-rose-700/70 hover:bg-rose-600/80 text-stone-50" onClick={() => removeItem(idx)}>Xoá</button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3 text-sm text-stone-400">Tổng tạm tính: <span className="text-amber-300 font-semibold">{priceTotal.toLocaleString('vi-VN')}</span></div>

                  <div className="mt-4 flex items-center gap-3">
                    {!q.myProposal?.id ? (
                      <button disabled={submitting} className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-900 disabled:opacity-50" onClick={() => onCreateProposal(q.id)}>Tạo Proposal</button>
                    ) : (
                      <button disabled={submitting} className="px-4 py-2 rounded-md bg-amber-600 hover:bg-amber-500 text-stone-900 disabled:opacity-50" onClick={() => onSaveDraft(q.id)}>Lưu bản nháp</button>
                    )}
                    <button className="px-4 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => { setShowFormFor(null); resetForm(); }}>Huỷ</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Project Detail Modal */}
      {showProjectDetail && projectDetailData && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-amber-300">Chi tiết dự án</h3>
              <button 
                className="text-stone-400 hover:text-stone-200 text-2xl" 
                onClick={() => { setShowProjectDetail(null); setProjectDetailData(null); }}
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Project Information */}
              <div className="bg-stone-700 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-amber-300 mb-6">Thông tin dự án</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Mô tả</p>
                    <p className="text-stone-100 text-lg">{projectDetailData.project.description || 'Chưa có mô tả'}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Địa chỉ</p>
                    <p className="text-stone-100 text-lg">{projectDetailData.project.address || 'Chưa cập nhật'}</p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Diện tích</p>
                    <p className="text-stone-100 text-lg">
                      {projectDetailData.project.floorArea ? `${projectDetailData.project.floorArea}m²` : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Số tầng</p>
                    <p className="text-stone-100 text-lg">
                      {projectDetailData.project.numberOfFloors || 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Ngân sách</p>
                    <p className="text-amber-300 font-semibold text-xl">
                      {projectDetailData.project.budget ? formatCurrency(projectDetailData.project.budget) : 'Chưa xác định'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Ngày bắt đầu</p>
                    <p className="text-stone-100 text-lg">
                      {projectDetailData.project.startDate ? formatDate(projectDetailData.project.startDate) : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Ngày hoàn thành dự kiến</p>
                    <p className="text-stone-100 text-lg">
                      {projectDetailData.project.estimatedCompletionDate ? formatDate(projectDetailData.project.estimatedCompletionDate) : 'Chưa cập nhật'}
                    </p>
                  </div>
                  <div>
                    <p className="text-stone-500 text-sm mb-2">Trạng thái dự án</p>
                    <p className="text-green-400 font-medium text-lg">Active</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-600">
                <button
                  onClick={() => { setShowProjectDetail(null); setProjectDetailData(null); }}
                  className="px-6 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Proposal Preview Modal */}
      {previewFor && (() => {
        const q = invites.find(i => i.id === previewFor);
        const mp = q?.myProposal;
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-5xl mx-auto max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-amber-300">Proposal của bạn</h3>
                <button className="text-stone-400 hover:text-stone-200 text-2xl" onClick={() => { setPreviewFor(null); setPreviewData(null); }}>×</button>
              </div>
              {!mp ? (
                <div className="text-stone-300">Chưa có proposal</div>
              ) : previewLoading || !previewData ? (
                <div className="text-stone-300">Đang tải chi tiết...</div>
              ) : (
                <div className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div><span className="text-stone-400">Trạng thái:</span> <span className="text-stone-100 font-medium">{mp.status}</span></div>
                    <div><span className="text-stone-400">Tổng giá:</span> <span className="text-amber-300 font-semibold">{previewData.priceTotal.toLocaleString('vi-VN')}</span></div>
                    <div><span className="text-stone-400">Thời gian thi công:</span> <span className="text-stone-100">{previewData.durationDays} ngày</span></div>
                  </div>
                  {previewData.termsSummary && (
                    <div>
                      <div className="text-stone-400">Điều khoản tóm tắt</div>
                      <div className="text-stone-100">{previewData.termsSummary}</div>
                    </div>
                  )}
                  <div>
                    <div className="text-stone-400 mb-2">Danh sách hạng mục</div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-stone-300">
                          <tr>
                            <th className="px-2 py-1">Hạng mục</th>
                            <th className="px-2 py-1">Đơn vị</th>
                            <th className="px-2 py-1">Số lượng</th>
                            <th className="px-2 py-1">Đơn giá</th>
                            <th className="px-2 py-1">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {previewData.items.map((it, idx) => (
                            <tr key={idx} className="border-t border-stone-700/60 text-stone-200">
                              <td className="px-2 py-1">{it.name}</td>
                              <td className="px-2 py-1">{it.unit}</td>
                              <td className="px-2 py-1">{it.qty}</td>
                              <td className="px-2 py-1">{it.unitPrice.toLocaleString('vi-VN')}</td>
                              <td className="px-2 py-1">{(it.qty * it.unitPrice).toLocaleString('vi-VN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-6 text-right">
                <button className="px-4 py-2 rounded-md bg-stone-700 hover:bg-stone-600 text-stone-200" onClick={() => { setPreviewFor(null); setPreviewData(null); }}>Đóng</button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}


