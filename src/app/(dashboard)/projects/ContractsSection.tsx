"use client";

import React, { useEffect, useState } from 'react';
import { FileTextOutlined, EyeOutlined, CalendarOutlined, UserOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { contractsApi, type ContractListItemDto, type ContractDetailDto } from '@/lib/contracts/contracts.api';
import { useAuth, UserRole } from '@/hooks/useAuth';

interface ContractsSectionProps {
  projectId?: string;
}

export default function ContractsSection({ projectId }: ContractsSectionProps) {
  const { user } = useAuth();
  const [contracts, setContracts] = useState<ContractListItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractListItemDto | null>(null);
  const [contractDetail, setContractDetail] = useState<ContractDetailDto | null>(null);
  const [showContractModal, setShowContractModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Load contracts
  useEffect(() => {
    const loadContracts = async () => {
      setLoading(true);
      try {
        console.log('Loading contracts...');
        // Call actual API to get contracts
        const data = await contractsApi.getAll();
        console.log('Contracts loaded:', data);
        setContracts(data);
      } catch (error) {
        console.error('Failed to load contracts:', error);
        // Show error message to user
        setSuccessMessage(`Lỗi tải hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    loadContracts();
  }, []);

  // Check for success message from localStorage
  useEffect(() => {
    const message = localStorage.getItem('contractSuccess');
    if (message) {
      setSuccessMessage(message);
      localStorage.removeItem('contractSuccess'); // Clear after reading
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleViewContract = async (contract: ContractListItemDto) => {
    setSelectedContract(contract);
    setShowContractModal(true);
    setLoadingDetail(true);
    
    try {
      const detail = await contractsApi.getDetailById(contract.id);
      setContractDetail(detail);
    } catch (error) {
      console.error('Failed to load contract detail:', error);
      setSuccessMessage(`Lỗi tải chi tiết hợp đồng: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleUpdateContractStatus = async (contractId: string, newStatus: number) => {
    setUpdatingStatus(contractId);
    try {
      await contractsApi.updateStatus(contractId, newStatus);
      
      // Reload contracts list
      const updatedContracts = await contractsApi.getAll();
      setContracts(updatedContracts);
      
      // Update contract detail if modal is open
      if (selectedContract && selectedContract.id === contractId) {
        const updatedDetail = await contractsApi.getDetailById(contractId);
        setContractDetail(updatedDetail);
      }
      
      // Show success message
      const statusNames = {
        0: 'Draft',
        1: 'PendingSignatures', 
        2: 'Active',
        3: 'Completed',
        4: 'Cancelled'
      };
      setSuccessMessage(`Cập nhật trạng thái hợp đồng thành công: ${statusNames[newStatus as keyof typeof statusNames]}`);
      
      // Auto-hide success message
      setTimeout(() => setSuccessMessage(null), 5000);
      
    } catch (error) {
      console.error('Failed to update contract status:', error);
      setSuccessMessage(`Lỗi cập nhật trạng thái: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusDisplayName = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'Draft': 'Nháp',
      'PendingSignatures': 'Chờ ký',
      'Active': 'Đang hiệu lực',
      'Completed': 'Hoàn thành',
      'Cancelled': 'Đã hủy'
    };
    return statusMap[status] || status;
  };

  const canSignContract = (contract: ContractListItemDto | ContractDetailDto) => {
    if (!user) return false;
    
    // Homeowner can initiate signing (Draft → PendingSignatures)
    if (user.role === UserRole.Homeowner && contract.status === 'Draft') {
      return true;
    }
    
    // Contractor can sign (PendingSignatures → Active)
    if (user.role === UserRole.Contractor && contract.status === 'PendingSignatures') {
      return true;
    }
    
    // Homeowner can complete (Active → Completed)
    if (user.role === UserRole.Homeowner && contract.status === 'Active') {
      return true;
    }
    
    return false;
  };

  const getNextStatus = (currentStatus: string, userRole: UserRole) => {
    if (userRole === UserRole.Homeowner) {
      if (currentStatus === 'Draft') return 1; // PendingSignatures
      if (currentStatus === 'Active') return 3; // Completed
    }
    if (userRole === UserRole.Contractor) {
      if (currentStatus === 'PendingSignatures') return 2; // Active
    }
    return null;
  };

  const getActionButtonText = (currentStatus: string, userRole: UserRole) => {
    if (userRole === UserRole.Homeowner) {
      if (currentStatus === 'Draft') return 'Khởi tạo ký hợp đồng';
      if (currentStatus === 'Active') return 'Hoàn tất hợp đồng';
    }
    if (userRole === UserRole.Contractor) {
      if (currentStatus === 'PendingSignatures') return 'Đồng ý ký hợp đồng';
    }
    return '';
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
      case 'PendingSignatures': return 'text-orange-400';
      case 'Active': return 'text-green-400';
      case 'Completed': return 'text-blue-400';
      case 'Cancelled': return 'text-red-400';
      default: return 'text-stone-400';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-stone-400">Đang tải hợp đồng...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Message */}
      {successMessage && (
        <div className={`rounded-lg p-4 ${
          successMessage.includes('Lỗi') || successMessage.includes('Error') 
            ? 'bg-red-600/20 border border-red-500/30 text-red-300' 
            : 'bg-green-600/20 border border-green-500/30 text-green-300'
        }`}>
          <div className="flex items-center gap-2">
            {successMessage.includes('Lỗi') || successMessage.includes('Error') ? (
              <span className="text-red-400">⚠️</span>
            ) : (
              <CheckCircleOutlined className="text-green-400" />
            )}
            <span>{successMessage}</span>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-amber-300">Hợp đồng</h2>
      </div>

      {contracts.length === 0 ? (
        <div className="text-center py-12">
          <FileTextOutlined className="text-6xl text-stone-600 mb-4" />
          <p className="text-stone-400 text-lg">Chưa có hợp đồng nào</p>
          <p className="text-stone-500 text-sm">Hợp đồng sẽ được tạo sau khi bạn chấp nhận proposal</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {contracts.map((contract) => (
            <div key={contract.id} className="bg-stone-800 rounded-lg border border-stone-700 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <FileTextOutlined className="text-amber-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-amber-300">
                        Hợp đồng #{contract.id.slice(-8)}
                      </h3>
                      <p className="text-stone-400 text-sm">
                        Dự án: {contract.projectName}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-stone-500 text-sm">Nhà thầu</p>
                      <p className="text-stone-300">
                        {contract.contractorName}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">Dự án</p>
                      <p className="text-stone-300">
                        {contract.projectName}
                      </p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">Trạng thái</p>
                      <p className={`font-medium ${getStatusColor(contract.status)}`}>
                        {getStatusDisplayName(contract.status)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-stone-500 text-sm">Ngày tạo</p>
                      <p className="text-stone-300">{formatDate(contract.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">Tổng giá trị</p>
                      <p className="text-amber-300 font-semibold text-lg">
                        {formatCurrency(contract.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {canSignContract(contract) && (
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(contract.status, user!.role);
                        if (nextStatus !== null) {
                          handleUpdateContractStatus(contract.id, nextStatus);
                        }
                      }}
                      disabled={updatingStatus === contract.id}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg transition-colors"
                    >
                      {updatingStatus === contract.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                      {getActionButtonText(contract.status, user!.role)}
                    </button>
                  )}
                  <button
                    onClick={() => handleViewContract(contract)}
                    className="flex items-center gap-2 px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-300 rounded-lg transition-colors"
                  >
                    <EyeOutlined />
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contract Detail Modal */}
      {showContractModal && selectedContract && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-800 rounded-xl border border-stone-700 p-6 w-full max-w-6xl mx-auto max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-amber-300">Chi tiết Hợp đồng</h3>
              <button
                onClick={() => {
                  setShowContractModal(false);
                  setContractDetail(null);
                }}
                className="text-stone-400 hover:text-stone-200 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-stone-400">Đang tải chi tiết hợp đồng...</div>
              </div>
            ) : contractDetail ? (
              <div className="space-y-6">
                {/* Contract Header */}
                <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-lg p-6 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-amber-300">Hợp đồng #{contractDetail.id.slice(-8)}</h4>
                      <p className="text-stone-400">Dự án: {selectedContract.projectName}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-semibold ${getStatusColor(contractDetail.status)}`}>
                        {getStatusDisplayName(contractDetail.status)}
                      </p>
                      <p className="text-amber-300 text-xl font-bold">
                        {formatCurrency(contractDetail.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract Basic Info */}
                <div className="bg-stone-700 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-amber-300 mb-4">Thông tin cơ bản</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-stone-500 text-sm">ID Hợp đồng</p>
                      <p className="text-stone-300 font-mono text-sm">{contractDetail.id}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">ID Dự án</p>
                      <p className="text-stone-300 font-mono text-sm">{contractDetail.projectId}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">ID Proposal</p>
                      <p className="text-stone-300 font-mono text-sm">{contractDetail.proposalId}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">Ngày tạo</p>
                      <p className="text-stone-300">{formatDate(contractDetail.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">Cập nhật cuối</p>
                      <p className="text-stone-300">{formatDate(contractDetail.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-sm">Tổng giá trị</p>
                      <p className="text-amber-300 font-semibold text-lg">
                        {formatCurrency(contractDetail.totalPrice)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract Terms */}
                {contractDetail.terms && (
                  <div className="bg-stone-700 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-amber-300 mb-4">Điều khoản hợp đồng</h4>
                    <div className="prose prose-invert max-w-none">
                      <p className="text-stone-300 whitespace-pre-wrap leading-relaxed">
                        {contractDetail.terms}
                      </p>
                    </div>
                  </div>
                )}

                {/* Contract Items */}
                {contractDetail.items && contractDetail.items.length > 0 && (
                  <div className="bg-stone-700 rounded-lg p-6">
                    <h4 className="text-lg font-medium text-amber-300 mb-4">Chi tiết hạng mục</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left text-sm">
                        <thead className="text-stone-300 border-b border-stone-600">
                          <tr>
                            <th className="px-4 py-3 font-medium">Hạng mục</th>
                            <th className="px-4 py-3 font-medium">Đơn vị</th>
                            <th className="px-4 py-3 font-medium text-right">Số lượng</th>
                            <th className="px-4 py-3 font-medium text-right">Đơn giá</th>
                            <th className="px-4 py-3 font-medium text-right">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contractDetail.items.map((item, index) => (
                            <tr key={item.id || index} className="border-b border-stone-600/50 text-stone-200">
                              <td className="px-4 py-3">{item.name}</td>
                              <td className="px-4 py-3">{item.unit}</td>
                              <td className="px-4 py-3 text-right">{item.qty}</td>
                              <td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td>
                              <td className="px-4 py-3 text-right font-medium text-amber-300">
                                {formatCurrency(item.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="text-stone-100 border-t-2 border-amber-500/50">
                          <tr>
                            <td colSpan={4} className="px-4 py-3 text-right font-semibold">
                              Tổng cộng:
                            </td>
                            <td className="px-4 py-3 text-right font-bold text-amber-300 text-lg">
                              {formatCurrency(contractDetail.totalPrice)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Contract Parties */}
                <div className="bg-stone-700 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-amber-300 mb-4">Các bên tham gia</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="text-stone-400 font-medium mb-2">Chủ nhà</h5>
                      <p className="text-stone-300">ID: {contractDetail.homeownerUserId}</p>
                    </div>
                    <div>
                      <h5 className="text-stone-400 font-medium mb-2">Nhà thầu</h5>
                      <p className="text-stone-300">{selectedContract.contractorName}</p>
                      <p className="text-stone-400 text-sm">ID: {contractDetail.contractorUserId}</p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-600">
                  <button
                    onClick={() => {
                      setShowContractModal(false);
                      setContractDetail(null);
                    }}
                    className="px-6 py-2 bg-stone-600 hover:bg-stone-500 text-stone-300 rounded-lg transition-colors"
                  >
                    Đóng
                  </button>
                  {canSignContract(contractDetail) && (
                    <button
                      onClick={() => {
                        const nextStatus = getNextStatus(contractDetail.status, user!.role);
                        if (nextStatus !== null) {
                          handleUpdateContractStatus(contractDetail.id, nextStatus);
                        }
                      }}
                      disabled={updatingStatus === contractDetail.id}
                      className="px-6 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      {updatingStatus === contractDetail.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircleOutlined />
                      )}
                      {getActionButtonText(contractDetail.status, user!.role)}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-stone-400">Không thể tải chi tiết hợp đồng</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
