// src/features/contractors/components/ContractorCard/ContractorCard.tsx
import React, { useRef, useEffect } from "react";
import { Card, Rate, Tag, Button, Space, Avatar, Tooltip, Badge } from "antd";
import {
  HeartOutlined,
  HeartFilled,
  StarFilled,
  EnvironmentOutlined,
  TeamOutlined,
  CalendarOutlined,
  PhoneOutlined,
  EyeOutlined,
  SafetyCertificateOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import QuoteSendButton from "../../../quotes/QuoteSendButton";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import type { ContractorSummary } from "@/lib/api/contractors";
import styles from "./ContractorCard.module.scss";

// Register GSAP plugin
gsap.registerPlugin(ScrollTrigger);

interface ContractorCardProps {
  contractor: ContractorSummary;
  onFavorite?: (contractorId: string) => void;
  isFavorited?: boolean;
  showAnimation?: boolean;
  animationDelay?: number;
}

const ContractorCard: React.FC<ContractorCardProps> = ({
  contractor,
  onFavorite,
  isFavorited = false,
  showAnimation = true,
  animationDelay = 0,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showAnimation || !cardRef.current) return;

    const card = cardRef.current;

    // Initial state
    gsap.set(card, {
      opacity: 0,
      y: 50,
      scale: 0.9,
    });

    // Animation on scroll
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: card,
        start: "top 90%",
        end: "bottom 10%",
        toggleActions: "play none none reverse",
      },
      delay: animationDelay,
    });

    tl.to(card, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.6,
      ease: "power2.out",
    });

    // Hover animations
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -5,
        boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        duration: 0.3,
        ease: "power2.out",
      });
    };

    card.addEventListener("mouseenter", handleMouseEnter);
    card.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      card.removeEventListener("mouseenter", handleMouseEnter);
      card.removeEventListener("mouseleave", handleMouseLeave);
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === card) {
          trigger.kill();
        }
      });
    };
  }, [showAnimation, animationDelay]);

  const formatBudget = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
      notation: "compact",
    }).format(amount);
  };

  const formatExperience = (years: number) => {
    return years > 0 ? `${years} năm KN` : "Mới";
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavorite?.(contractor.id);
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 90) return "success";
    if (percentage >= 70) return "warning";
    return "default";
  };

  return (
    <div ref={cardRef} className={styles.contractorCard}>
      <Badge.Ribbon
        text={contractor.isPremium ? "Premium" : undefined}
        color="gold"
        style={{ display: contractor.isPremium ? "block" : "none" }}
      >
        <Card
          hoverable
          className={styles.card}
          cover={
            <div className={styles.coverContainer}>
              {contractor.featuredImageUrl ? (
                <img
                  alt={contractor.companyName}
                  src={contractor.featuredImageUrl}
                  className={styles.coverImage}
                />
              ) : (
                <div className={styles.placeholderCover}>
                  <TeamOutlined style={{ fontSize: 48, color: "#bfbfbf" }} />
                </div>
              )}

              {/* Overlay badges */}
              <div className={styles.badgeOverlay}>
                {contractor.isVerified && (
                  <Tooltip title="Đã xác thực">
                    <Tag icon={<SafetyCertificateOutlined />} color="blue">
                      Verified
                    </Tag>
                  </Tooltip>
                )}

                {contractor.isPremium && (
                  <Tooltip title="Tài khoản Premium">
                    <Tag icon={<CrownOutlined />} color="gold">
                      Premium
                    </Tag>
                  </Tooltip>
                )}
              </div>

              {/* Favorite button */}
              <Button
                type="text"
                icon={isFavorited ? <HeartFilled /> : <HeartOutlined />}
                className={`${styles.favoriteBtn} ${
                  isFavorited ? styles.favorited : ""
                }`}
                onClick={handleFavoriteClick}
              />
            </div>
          }
          actions={[
            <Button key="view" type="link" icon={<EyeOutlined />}>
              <Link href={`/contractors/${contractor.id}`}>Xem chi tiết</Link>
            </Button>,
            <QuoteSendButton 
              key="send-quote" 
              contractorId={contractor.id} 
              contractorName={contractor.companyName}
              type="link" 
              size="small"
            />,
            <Button key="contact" type="link" icon={<PhoneOutlined />}>
              Liên hệ
            </Button>,
          ]}
        >
          <div className={styles.cardContent}>
            {/* Header */}
            <div className={styles.header}>
              <div className={styles.title}>
                <h3 className={styles.companyName}>
                  <Link href={`/contractors/${contractor.id}`}>
                    {contractor.companyName}
                  </Link>
                </h3>
                <div className={styles.rating}>
                  <Rate
                    disabled
                    defaultValue={contractor.averageRating}
                    allowHalf
                    style={{ fontSize: 14 }}
                  />
                  <span className={styles.ratingText}>
                    {contractor.averageRating.toFixed(1)} (
                    {contractor.totalReviews})
                  </span>
                </div>
              </div>
            </div>

            {/* Description */}
            {contractor.description && (
              <p className={styles.description}>
                {contractor.description.length > 100
                  ? `${contractor.description.substring(0, 100)}...`
                  : contractor.description}
              </p>
            )}

            {/* Info Grid */}
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <EnvironmentOutlined />
                <span>{contractor.city || "Da Nang"}</span>
              </div>

              <div className={styles.infoItem}>
                <CalendarOutlined />
                <span>{formatExperience(contractor.yearsOfExperience)}</span>
              </div>

              <div className={styles.infoItem}>
                <TeamOutlined />
                <span>{contractor.completedProjects} dự án</span>
              </div>

              {(contractor.minProjectBudget || contractor.maxProjectBudget) && (
                <div className={styles.infoItem}>
                  <span className={styles.budget}>
                    {contractor.minProjectBudget && contractor.maxProjectBudget
                      ? `${formatBudget(
                          contractor.minProjectBudget
                        )} - ${formatBudget(contractor.maxProjectBudget)}`
                      : contractor.minProjectBudget
                      ? `Từ ${formatBudget(contractor.minProjectBudget)}`
                      : `Đến ${formatBudget(contractor.maxProjectBudget!)}`}
                  </span>
                </div>
              )}
            </div>

            {/* Specialties */}
            {contractor.specialties.length > 0 && (
              <div className={styles.specialties}>
                {contractor.specialties.slice(0, 3).map((specialty, index) => (
                  <Tag key={index} color="blue" className={styles.specialtyTag}>
                    {specialty}
                  </Tag>
                ))}
                {contractor.specialties.length > 3 && (
                  <Tag className={styles.moreTag}>
                    +{contractor.specialties.length - 3} khác
                  </Tag>
                )}
              </div>
            )}

            {/* Profile completion */}
            <div className={styles.completion}>
              <div className={styles.completionLabel}>
                Hồ sơ hoàn thiện:
                <Tag
                  color={getCompletionColor(
                    contractor.profileCompletionPercentage
                  )}
                  style={{ marginLeft: 8 }}
                >
                  {contractor.profileCompletionPercentage}%
                </Tag>
              </div>
            </div>
          </div>
        </Card>
      </Badge.Ribbon>
    </div>
  );
};

export default ContractorCard;
