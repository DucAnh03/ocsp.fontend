// src/app/contractors/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { Breadcrumb, Typography, Space, Button, FloatButton } from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  CustomerServiceOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import Link from "next/link";
import ContractorSearch from "@/./components/features/contractors/components/ContractorSearch/ContractorSearch";
import ContractorList from "@/./components/features/contractors/components/ContractorList/ContractorList";
import QuoteSendModal from "@/./components/features/quotes/QuoteSendModal";
import { useAuth, UserRole } from "../../hooks/useAuth";
import styles from "./contractors.module.scss";

const { Title, Paragraph } = Typography;

const ContractorsPage: React.FC = () => {
  const { user } = useAuth();
  const [favoriteContractors, setFavoriteContractors] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [showSendToAllModal, setShowSendToAllModal] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Load favorite contractors from localStorage
    const saved = localStorage.getItem("favoriteContractors");
    if (saved) {
      setFavoriteContractors(JSON.parse(saved));
    }

    // Page entrance animation
    const tl = gsap.timeline();

    tl.fromTo(
      ".page-header",
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    )
      .fromTo(
        ".search-section",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.4"
      )
      .fromTo(
        ".list-section",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
        "-=0.2"
      );
  }, []);

  const handleFavorite = (contractorId: string) => {
    let newFavorites: string[];

    if (favoriteContractors.includes(contractorId)) {
      newFavorites = favoriteContractors.filter((id) => id !== contractorId);
    } else {
      newFavorites = [...favoriteContractors, contractorId];
    }

    setFavoriteContractors(newFavorites);
    localStorage.setItem("favoriteContractors", JSON.stringify(newFavorites));

    // Show toast notification (you can implement this)
    // toast.success(
    //   favoriteContractors.includes(contractorId)
    //     ? 'Đã xóa khỏi danh sách yêu thích'
    //     : 'Đã thêm vào danh sách yêu thích'
    // );
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!mounted) {
    return <div style={{ minHeight: "100vh" }} />; // Prevent hydration mismatch
  }

  return (
    <div className={styles.contractorsPage}>
      <div className={styles.content}>
        {/* Breadcrumb */}
        <div className="page-header">
          <Breadcrumb
            className={styles.breadcrumb}
            items={[
              {
                title: (
                  <Link href="/">
                    <HomeOutlined />
                    <span>Trang chủ</span>
                  </Link>
                ),
              },
              {
                title: (
                  <>
                    <TeamOutlined />
                    <span>Nhà thầu</span>
                  </>
                ),
              },
            ]}
          />

          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div className={styles.headerContent}>
              <div className={styles.titleSection}>
                <Title level={1} className={styles.pageTitle}>
                  Tìm kiếm nhà thầu
                </Title>
                <Paragraph className={styles.pageDescription}>
                  Kết nối với các nhà thầu uy tín và chuyên nghiệp tại Đà Nẵng.
                  Tìm kiếm theo chuyên môn, khu vực và ngân sách phù hợp với dự
                  án của bạn.
                </Paragraph>
              </div>

              {user?.role === UserRole.Homeowner && (
                <div className={styles.headerActions}>
                  <Space>
                    <Button
                      type="primary"
                      size="large"
                      icon={<CustomerServiceOutlined />}
                    >
                      <Link href="/ai-assistant">Tư vấn AI</Link>
                    </Button>
                    <Button size="large" ghost>
                      <Link href="/dashboard/projects/create">Đăng dự án</Link>
                    </Button>
                    <Button
                      type="primary"
                      size="large"
                      icon={<SendOutlined />}
                      onClick={() => setShowSendToAllModal(true)}
                    >
                      Gửi Quote đến Tất cả
                    </Button>
                  </Space>
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className={styles.quickStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>500+</span>
                <span className={styles.statLabel}>Nhà thầu</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>1000+</span>
                <span className={styles.statLabel}>Dự án hoàn thành</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>4.8</span>
                <span className={styles.statLabel}>Đánh giá trung bình</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className={styles.searchSection}>
            <ContractorSearch
              showAdvancedFilters={true}
              onSearch={() => {
                // Scroll to results
                document.querySelector(".list-section")?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
            />
          </div>
        </div>

        {/* Results Section */}
        <div className="list-section">
          <div className={styles.listSection}>
            <ContractorList
              showPagination={true}
              itemsPerRow={{
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 4,
              }}
              favoriteContractors={favoriteContractors}
              onFavorite={handleFavorite}
            />
          </div>
        </div>

        {/* Float Actions */}
        {/* <FloatButton.Group trigger="hover" type="primary" style={{ right: 24 }}>
          <FloatButton tooltip="Lên đầu trang" onClick={scrollToTop} />
          {user?.role === UserRole.Homeowner && (
            <FloatButton
              tooltip="Tư vấn AI"
              icon={<CustomerServiceOutlined />}
              onClick={() => window.open("/ai-assistant", "_blank")}
            />
          )}
        </FloatButton.Group> */}
      </div>

      {/* Quote Send Modal */}
      <QuoteSendModal
        isOpen={showSendToAllModal}
        onClose={() => setShowSendToAllModal(false)}
        onSuccess={() => {
          // Refresh contractor list or show success message
          console.log('Quote sent successfully');
        }}
        sendToAll={true}
      />
    </div>
  );
};

export default ContractorsPage;
