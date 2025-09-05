// src/app/contractors/[id]/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Row,
  Col,
  Card,
  Typography,
  Rate,
  Tag,
  Button,
  Space,
  Divider,
  Avatar,
  Breadcrumb,
  Tabs,
  Image,
  Statistic,
  Timeline,
  Empty,
  Spin,
  Alert,
  Badge,
  Tooltip,
} from "antd";
import {
  HomeOutlined,
  TeamOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
  StarFilled,
  MessageOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  FileTextOutlined,
  PictureOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { useContractorStore } from "../../../store/contractor-store";
import { useAuth, UserRole } from "../../../hooks/useAuth";
import QuoteSendModal from "../../../components/features/quotes/QuoteSendModal";
import styles from "./contractor-detail.module.scss";

gsap.registerPlugin(ScrollTrigger);

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const ContractorDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { currentContractor, loading, error, fetchContractorProfile } =
    useContractorStore();

  const [activeTab, setActiveTab] = useState("overview");
  const [isFavorited, setIsFavorited] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showSendQuoteModal, setShowSendQuoteModal] = useState(false);

  const contractorId = params.id as string;

  useEffect(() => {
    setMounted(true);
    if (contractorId) {
      fetchContractorProfile(contractorId);
    }
  }, [contractorId, fetchContractorProfile]);

  useEffect(() => {
    // Check if favorited
    const favorites = JSON.parse(
      localStorage.getItem("favoriteContractors") || "[]"
    );
    setIsFavorited(favorites.includes(contractorId));
  }, [contractorId]);

  useEffect(() => {
    if (currentContractor && mounted) {
      // Page entrance animations
      const tl = gsap.timeline();

      tl.fromTo(
        ".hero-section",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      )
        .fromTo(
          ".info-section",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".content-section",
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" },
          "-=0.2"
        );
    }
  }, [currentContractor, mounted]);

  const handleFavorite = () => {
    const favorites = JSON.parse(
      localStorage.getItem("favoriteContractors") || "[]"
    );
    let newFavorites: string[];

    if (isFavorited) {
      newFavorites = favorites.filter((id: string) => id !== contractorId);
    } else {
      newFavorites = [...favorites, contractorId];
    }

    localStorage.setItem("favoriteContractors", JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);
  };

  const handleContact = () => {
    if (user?.role === UserRole.Homeowner) {
      // Open chat or contact modal
      console.log("Contact contractor:", contractorId);
    } else {
      router.push("/login");
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentContractor?.companyName,
          text: `Xem hồ sơ nhà thầu ${currentContractor?.companyName}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleSendQuote = () => {
    if (user?.role === UserRole.Homeowner) {
      setShowSendQuoteModal(true);
    } else {
      router.push("/login");
    }
  };

  const handleQuoteSent = () => {
    console.log("Quote sent successfully to", currentContractor?.companyName);
    setShowSendQuoteModal(false);
  };

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className={styles.contractorDetail}>
        <div className={styles.content}>
          <div className={styles.loadingContainer}>
            <Spin size="large" tip="Đang tải thông tin nhà thầu...">
              <div style={{ height: 400 }} />
            </Spin>
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentContractor) {
    return (
      <div className={styles.contractorDetail}>
        <div className={styles.content}>
          <Alert
            message="Lỗi tải dữ liệu"
            description={error || "Không thể tải thông tin nhà thầu"}
            type="error"
            showIcon
            action={
              <Button onClick={() => router.push("/contractors")}>
                Quay lại danh sách
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const contractor = currentContractor;

  return (
    <div className={styles.contractorDetail}>
      <div className={styles.content}>
        {/* Breadcrumb */}
        <Breadcrumb className={styles.breadcrumb}>
          <Breadcrumb.Item>
            <Link href="/">
              <HomeOutlined />
              <span>Trang chủ</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link href="/contractors">
              <TeamOutlined />
              <span>Nhà thầu</span>
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>{contractor.companyName}</Breadcrumb.Item>
        </Breadcrumb>

        {/* Hero Section */}
        <div className="hero-section">
          <Card className={styles.heroCard}>
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} lg={16}>
                <div className={styles.companyInfo}>
                  <div className={styles.header}>
                    <div className={styles.titleSection}>
                      <Title level={1} className={styles.companyName}>
                        {contractor.companyName}
                        {contractor.isPremium && (
                          <Badge
                            count={
                              <CrownOutlined style={{ color: "#faad14" }} />
                            }
                            offset={[0, 0]}
                          />
                        )}
                        {contractor.isVerified && (
                          <Tooltip title="Đã xác thực">
                            <CheckCircleOutlined
                              style={{ color: "#52c41a", marginLeft: 8 }}
                            />
                          </Tooltip>
                        )}
                      </Title>

                      <div className={styles.rating}>
                        <Rate
                          disabled
                          value={contractor.averageRating}
                          allowHalf
                        />
                        <Text className={styles.ratingText}>
                          {contractor.averageRating.toFixed(1)}(
                          {contractor.totalReviews} đánh giá)
                        </Text>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      <Space>
                        <Button
                          icon={
                            isFavorited ? <HeartFilled /> : <HeartOutlined />
                          }
                          onClick={handleFavorite}
                          className={isFavorited ? styles.favorited : ""}
                        >
                          {isFavorited ? "Đã lưu" : "Lưu"}
                        </Button>
                        <Button
                          icon={<ShareAltOutlined />}
                          onClick={handleShare}
                        >
                          Chia sẻ
                        </Button>
                        {user?.role === UserRole.Homeowner && (
                          <Button
                            type="primary"
                            icon={<SendOutlined />}
                            onClick={handleSendQuote}
                          >
                            Gửi Quote
                          </Button>
                        )}
                        <Button
                          type="primary"
                          icon={<MessageOutlined />}
                          size="large"
                          onClick={handleContact}
                        >
                          Liên hệ
                        </Button>
                      </Space>
                    </div>
                  </div>

                  {contractor.description && (
                    <Paragraph className={styles.description}>
                      {contractor.description}
                    </Paragraph>
                  )}

                  {/* Quick Info */}
                  <div className={styles.quickInfo}>
                    <Row gutter={[16, 16]}>
                      {contractor.city && (
                        <Col span={12}>
                          <div className={styles.infoItem}>
                            <EnvironmentOutlined />
                            <span>
                              {contractor.city}, {contractor.province}
                            </span>
                          </div>
                        </Col>
                      )}
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <CalendarOutlined />
                          <span>
                            {contractor.yearsOfExperience} năm kinh nghiệm
                          </span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <TeamOutlined />
                          <span>
                            {contractor.completedProjects} dự án hoàn thành
                          </span>
                        </div>
                      </Col>
                      <Col span={12}>
                        <div className={styles.infoItem}>
                          <TrophyOutlined />
                          <span>Đội ngũ {contractor.teamSize} người</span>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Specialties */}
                  {contractor.specialties.length > 0 && (
                    <div className={styles.specialties}>
                      <Text strong>Chuyên môn:</Text>
                      <div className={styles.specialtyTags}>
                        {contractor.specialties.map((specialty, index) => (
                          <Tag
                            key={index}
                            color="blue"
                            className={styles.specialtyTag}
                          >
                            {specialty.specialtyName}
                          </Tag>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={24} lg={8}>
                <div className="info-section">
                  <Row gutter={[16, 16]}>
                    <Col span={12}>
                      <Card className={styles.statCard}>
                        <Statistic
                          title="Dự án đang thực hiện"
                          value={contractor.ongoingProjects}
                          prefix={<FileTextOutlined />}
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card className={styles.statCard}>
                        <Statistic
                          title="Hồ sơ hoàn thiện"
                          value={contractor.profileCompletionPercentage}
                          suffix="%"
                          prefix={<CheckCircleOutlined />}
                        />
                      </Card>
                    </Col>
                    {(contractor.minProjectBudget ||
                      contractor.maxProjectBudget) && (
                      <Col span={24}>
                        <Card className={styles.statCard}>
                          <Text strong>Ngân sách dự án:</Text>
                          <div className={styles.budget}>
                            {contractor.minProjectBudget &&
                            contractor.maxProjectBudget
                              ? `${formatBudget(
                                  contractor.minProjectBudget
                                )} - ${formatBudget(
                                  contractor.maxProjectBudget
                                )}`
                              : contractor.minProjectBudget
                              ? `Từ ${formatBudget(
                                  contractor.minProjectBudget
                                )}`
                              : `Đến ${formatBudget(
                                  contractor.maxProjectBudget!
                                )}`}
                          </div>
                        </Card>
                      </Col>
                    )}
                  </Row>
                </div>
              </Col>
            </Row>
          </Card>
        </div>

        {/* Content Section */}
        <div className="content-section">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            className={styles.contentTabs}
          >
            <TabPane tab="Tổng quan" key="overview">
              <Row gutter={[24, 24]}>
                <Col xs={24} lg={16}>
                  {/* Contact Information */}
                  <Card title="Thông tin liên hệ" className={styles.infoCard}>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      {contractor.contactPhone && (
                        <div className={styles.contactItem}>
                          <PhoneOutlined />
                          <span>{contractor.contactPhone}</span>
                        </div>
                      )}
                      {contractor.contactEmail && (
                        <div className={styles.contactItem}>
                          <MailOutlined />
                          <span>{contractor.contactEmail}</span>
                        </div>
                      )}
                      {contractor.website && (
                        <div className={styles.contactItem}>
                          <GlobalOutlined />
                          <a
                            href={contractor.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {contractor.website}
                          </a>
                        </div>
                      )}
                      {contractor.address && (
                        <div className={styles.contactItem}>
                          <EnvironmentOutlined />
                          <span>{contractor.address}</span>
                        </div>
                      )}
                    </Space>
                  </Card>
                </Col>

                <Col xs={24} lg={8}>
                  {/* Verification Status */}
                  <Card title="Trạng thái xác thực" className={styles.infoCard}>
                    <Space
                      direction="vertical"
                      size="middle"
                      style={{ width: "100%" }}
                    >
                      <div className={styles.verificationItem}>
                        <CheckCircleOutlined
                          style={{
                            color: contractor.isVerified
                              ? "#52c41a"
                              : "#d9d9d9",
                          }}
                        />
                        <span>Tài khoản đã xác thực</span>
                      </div>
                      <div className={styles.verificationItem}>
                        <CrownOutlined
                          style={{
                            color: contractor.isPremium ? "#faad14" : "#d9d9d9",
                          }}
                        />
                        <span>Tài khoản Premium</span>
                      </div>
                      <div className={styles.verificationItem}>
                        <SafetyCertificateOutlined
                          style={{
                            color:
                              contractor.documents.length > 0
                                ? "#52c41a"
                                : "#d9d9d9",
                          }}
                        />
                        <span>Giấy tờ đầy đủ</span>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </TabPane>

            <TabPane tab="Hồ sơ năng lực" key="portfolio">
              {contractor.portfolios.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {contractor.portfolios
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((portfolio) => (
                      <Col xs={24} sm={12} lg={8} key={portfolio.id}>
                        <Card
                          hoverable
                          cover={
                            portfolio.imageUrl ? (
                              <Image
                                alt={portfolio.projectName}
                                src={portfolio.imageUrl}
                                height={200}
                                style={{ objectFit: "cover" }}
                              />
                            ) : (
                              <div className={styles.portfolioPlaceholder}>
                                <PictureOutlined style={{ fontSize: 48 }} />
                              </div>
                            )
                          }
                          className={styles.portfolioCard}
                        >
                          <Card.Meta
                            title={portfolio.projectName}
                            description={
                              <div>
                                {portfolio.projectDescription && (
                                  <Paragraph
                                    ellipsis={{ rows: 2, expandable: true }}
                                    className={styles.portfolioDescription}
                                  >
                                    {portfolio.projectDescription}
                                  </Paragraph>
                                )}
                                <div className={styles.portfolioMeta}>
                                  {portfolio.projectValue && (
                                    <Text type="secondary">
                                      Giá trị:{" "}
                                      {formatBudget(portfolio.projectValue)}
                                    </Text>
                                  )}
                                  <Text type="secondary">
                                    Hoàn thành:{" "}
                                    {formatDate(portfolio.completedDate)}
                                  </Text>
                                </div>
                                {portfolio.clientTestimonial && (
                                  <blockquote className={styles.testimonial}>
                                    "{portfolio.clientTestimonial}"
                                  </blockquote>
                                )}
                              </div>
                            }
                          />
                        </Card>
                      </Col>
                    ))}
                </Row>
              ) : (
                <Empty
                  description="Chưa có dự án nào được đăng tải"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>

            <TabPane tab="Đánh giá" key="reviews">
              {contractor.recentReviews.length > 0 ? (
                <div className={styles.reviewsList}>
                  {contractor.recentReviews.map((review) => (
                    <Card key={review.id} className={styles.reviewCard}>
                      <div className={styles.reviewHeader}>
                        <div className={styles.reviewerInfo}>
                          <Avatar size="large">
                            {review.reviewerName.charAt(0)}
                          </Avatar>
                          <div>
                            <Title level={5}>{review.reviewerName}</Title>
                            <Text type="secondary">
                              {formatDate(review.createdAt)}
                            </Text>
                          </div>
                        </div>
                        <Rate disabled value={review.rating} />
                      </div>
                      {review.comment && (
                        <Paragraph className={styles.reviewComment}>
                          {review.comment}
                        </Paragraph>
                      )}
                      {review.projectName && (
                        <Tag color="blue">{review.projectName}</Tag>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <Empty
                  description="Chưa có đánh giá nào"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>

            <TabPane tab="Giấy tờ" key="documents">
              {contractor.documents.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {contractor.documents.map((document) => (
                    <Col xs={24} sm={12} lg={8} key={document.id}>
                      <Card className={styles.documentCard}>
                        <div className={styles.documentHeader}>
                          <FileTextOutlined style={{ fontSize: 24 }} />
                          <div>
                            <Title level={5}>{document.documentName}</Title>
                            <Tag
                              color={document.isVerified ? "green" : "orange"}
                            >
                              {document.isVerified
                                ? "Đã xác thực"
                                : "Chờ xác thực"}
                            </Tag>
                          </div>
                        </div>
                        <div className={styles.documentInfo}>
                          <Text type="secondary">
                            Loại: {document.documentType}
                          </Text>
                          <Text type="secondary">
                            Hết hạn: {formatDate(document.expiryDate)}
                          </Text>
                        </div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <Empty
                  description="Chưa có giấy tờ nào được tải lên"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )}
            </TabPane>
          </Tabs>
        </div>
      </div>

      {/* Quote Send Modal */}
      <QuoteSendModal
        isOpen={showSendQuoteModal}
        onClose={() => setShowSendQuoteModal(false)}
        onSuccess={handleQuoteSent}
        sendToAll={false}
        contractorId={contractorId}
        contractorName={currentContractor?.companyName || ""}
      />
    </div>
  );
};

export default ContractorDetailPage;
