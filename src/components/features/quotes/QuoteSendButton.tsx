"use client";

import React, { useState } from 'react';
import { Button } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import QuoteSendModal from './QuoteSendModal';

interface QuoteSendButtonProps {
  contractorId?: string; // Nếu có thì gửi đến nhà thầu cụ thể, nếu không thì gửi đến tất cả
  contractorName?: string; // Tên nhà thầu để hiển thị trong modal
  onSuccess?: () => void;
  onError?: (error: string) => void;
  size?: 'small' | 'middle' | 'large';
  type?: 'default' | 'primary' | 'link';
  className?: string;
}

export default function QuoteSendButton({ 
  contractorId, 
  contractorName,
  onSuccess, 
  onError,
  size = 'middle',
  type = 'default',
  className 
}: QuoteSendButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const handleSuccess = () => {
    onSuccess?.();
    setShowModal(false);
  };

  const handleError = (error: string) => {
    onError?.(error);
  };

  return (
    <>
      <Button
        type={type}
        size={size}
        icon={<FileTextOutlined />}
        onClick={() => setShowModal(true)}
        className={`${className || ''} flex items-center`}
        style={{ 
          display: 'flex',
          alignItems: 'center',
          paddingTop: '8px',
          paddingLeft: '12px',
        }}
      >
        {contractorId ? 'Gửi Quote' : 'Gửi Quote đến tất cả'}
      </Button>

      <QuoteSendModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={handleSuccess}
        sendToAll={!contractorId}
        contractorId={contractorId}
        contractorName={contractorName}
      />
    </>
  );
}
