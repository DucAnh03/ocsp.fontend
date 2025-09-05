// src/features/contractors/components/ContractorSearch/ContractorSearch.tsx
import React, { useState, useEffect, useCallback } from "react";
import {
  Input,
  Button,
  Select,
  Slider,
  Card,
  Row,
  Col,
  Space,
  AutoComplete,
  Checkbox,
  Rate,
  InputNumber,
  Divider,
  Tag,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
} from "@ant-design/icons";
import { useContractorStore } from "@/store/contractor-store";
import { useDebounce } from "@/hooks/useDebounce";
import type { SearchFilters, SortOption } from "../../types/contractor.types";
import styles from "./ContractorSearch.module.scss";

const { Option } = Select;

const SPECIALTIES = [
  "Xây dựng nhà ở",
  "Xây dựng thương mại",
  "Sửa chữa cải tạo",
  "Điện nước",
  "Sơn và hoàn thiện",
  "Lát gạch và đá",
  "Mái nhà",
  "Cảnh quan",
  "Thiết kế nội thất",
];

const SORT_OPTIONS: { label: string; value: SortOption }[] = [
  { label: "Relevance", value: 0 },
  { label: "Premium trước", value: 7 },
  { label: "Đánh giá cao nhất", value: 1 },
  { label: "Kinh nghiệm nhiều nhất", value: 2 },
  { label: "Hoàn thành nhiều dự án", value: 3 },
  { label: "Giá từ thấp đến cao", value: 4 },
  { label: "Giá từ cao đến thấp", value: 5 },
  { label: "Mới nhất", value: 6 },
];

const CITIES = [
  "Da Nang",
  "Hồ Chí Minh",
  "Hà Nội",
  "Hải Phòng",
  "Cần Thơ",
  "Biên Hòa",
  "Huế",
  "Nha Trang",
  "Buôn Ma Thuột",
  "Vinh",
];

interface ContractorSearchProps {
  showAdvancedFilters?: boolean;
  onSearch?: () => void;
}

const ContractorSearch: React.FC<ContractorSearchProps> = ({
  showAdvancedFilters = true,
  onSearch,
}) => {
  const {
    searchFilters,
    searchSuggestions,
    setSearchFilters,
    clearSearchFilters,
    searchContractors,
    getSearchSuggestions,
    searchLoading,
  } = useContractorStore();

  const [localFilters, setLocalFilters] =
    useState<SearchFilters>(searchFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [budgetRange, setBudgetRange] = useState<[number, number]>([
    searchFilters.minBudget || 50000000,
    searchFilters.maxBudget || 1000000000,
  ]);

  const debouncedQuery = useDebounce(localFilters.query || "", 300);

  // Get search suggestions when query changes
  useEffect(() => {
    if (debouncedQuery) {
      getSearchSuggestions(debouncedQuery);
    }
  }, [debouncedQuery, getSearchSuggestions]);

  // Update local filters when store changes
  useEffect(() => {
    setLocalFilters(searchFilters);
  }, [searchFilters]);

  const handleSearch = useCallback(() => {
    setSearchFilters({
      ...localFilters,
      minBudget: budgetRange[0],
      maxBudget: budgetRange[1],
    });
    searchContractors();
    onSearch?.();
  }, [
    localFilters,
    budgetRange,
    setSearchFilters,
    searchContractors,
    onSearch,
  ]);

  const handleClearFilters = () => {
    const clearedFilters = { sortBy: 7 as SortOption }; // Premium
    setLocalFilters(clearedFilters);
    setBudgetRange([50000000, 1000000000]);
    clearSearchFilters();
    searchContractors();
  };

  const handleFilterChange = (key: keyof SearchFilters, value: any) => {
    setLocalFilters((prev) => ({ ...prev, [key]: value }));
  };

  const formatBudget = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const autoCompleteOptions = searchSuggestions.map((suggestion) => ({
    value: suggestion,
    label: suggestion,
  }));

  return (
    <Card className={styles.searchContainer}>
      {/* Main Search Bar */}
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={16} md={18}>
          <AutoComplete
            options={autoCompleteOptions}
            value={localFilters.query}
            onChange={(value) => handleFilterChange("query", value)}
            onSelect={(value) => handleFilterChange("query", value)}
            placeholder="Tìm kiếm nhà thầu theo tên, chuyên môn, khu vực..."
            size="large"
            style={{ width: "100%" }}
          >
            <Input
              prefix={<SearchOutlined />}
              size="large"
              onPressEnter={handleSearch}
            />
          </AutoComplete>
        </Col>

        <Col xs={12} sm={4} md={3}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            loading={searchLoading}
            onClick={handleSearch}
            block
          >
            Tìm kiếm
          </Button>
        </Col>

        {showAdvancedFilters && (
          <Col xs={12} sm={4} md={3}>
            <Button
              icon={<FilterOutlined />}
              size="large"
              onClick={() => setShowFilters(!showFilters)}
              block
            >
              Bộ lọc
            </Button>
          </Col>
        )}
      </Row>

      {/* Quick Filters */}
      <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
        <Col>
          <Tag.CheckableTag
            checked={localFilters.isVerified === true}
            onChange={(checked) =>
              handleFilterChange("isVerified", checked ? true : undefined)
            }
          >
            Đã xác thực
          </Tag.CheckableTag>
        </Col>
        <Col>
          <Tag.CheckableTag
            checked={localFilters.isPremium === true}
            onChange={(checked) =>
              handleFilterChange("isPremium", checked ? true : undefined)
            }
          >
            Premium
          </Tag.CheckableTag>
        </Col>
        <Col>
          <Tag.CheckableTag
            checked={!!localFilters.minRating && localFilters.minRating >= 4}
            onChange={(checked) =>
              handleFilterChange("minRating", checked ? 4 : undefined)
            }
          >
            Đánh giá 4+ sao
          </Tag.CheckableTag>
        </Col>
        <Col>
          <Tag.CheckableTag
            checked={
              !!localFilters.minYearsExperience &&
              localFilters.minYearsExperience >= 5
            }
            onChange={(checked) =>
              handleFilterChange("minYearsExperience", checked ? 5 : undefined)
            }
          >
            Kinh nghiệm 5+ năm
          </Tag.CheckableTag>
        </Col>
      </Row>

      {/* Advanced Filters */}
      {showFilters && showAdvancedFilters && (
        <>
          <Divider />
          <Row gutter={[16, 16]}>
            {/* Location Filter */}
            <Col xs={24} sm={12} md={6}>
              <label className={styles.filterLabel}>Khu vực</label>
              <Select
                placeholder="Chọn khu vực"
                value={localFilters.location}
                onChange={(value) => handleFilterChange("location", value)}
                style={{ width: "100%" }}
                allowClear
              >
                {CITIES.map((city) => (
                  <Option key={city} value={city}>
                    {city}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Specialties Filter */}
            <Col xs={24} sm={12} md={6}>
              <label className={styles.filterLabel}>Chuyên môn</label>
              <Select
                mode="multiple"
                placeholder="Chọn chuyên môn"
                value={localFilters.specialties}
                onChange={(value) => handleFilterChange("specialties", value)}
                style={{ width: "100%" }}
              >
                {SPECIALTIES.map((specialty) => (
                  <Option key={specialty} value={specialty}>
                    {specialty}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Sort By */}
            <Col xs={24} sm={12} md={6}>
              <label className={styles.filterLabel}>Sắp xếp</label>
              <Select
                value={localFilters.sortBy}
                onChange={(value) => handleFilterChange("sortBy", value)}
                style={{ width: "100%" }}
              >
                {SORT_OPTIONS.map((option) => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
            </Col>

            {/* Rating Filter */}
            <Col xs={24} sm={12} md={6}>
              <label className={styles.filterLabel}>Đánh giá tối thiểu</label>
              <Rate
                value={localFilters.minRating}
                onChange={(value) => handleFilterChange("minRating", value)}
                allowClear
              />
            </Col>

            {/* Experience Filter */}
            <Col xs={24} sm={12} md={8}>
              <label className={styles.filterLabel}>
                Kinh nghiệm tối thiểu (năm)
              </label>
              <InputNumber
                min={0}
                max={50}
                value={localFilters.minYearsExperience}
                onChange={(value) =>
                  handleFilterChange("minYearsExperience", value)
                }
                style={{ width: "100%" }}
                placeholder="Năm kinh nghiệm"
              />
            </Col>

            {/* Budget Range Filter */}
            <Col xs={24} sm={12} md={16}>
              <label className={styles.filterLabel}>
                Ngân sách dự án: {formatBudget(budgetRange[0])} -{" "}
                {formatBudget(budgetRange[1])}
              </label>
              <Slider
                range
                min={10000000}
                max={5000000000}
                step={10000000}
                value={budgetRange}
                onChange={(value) => setBudgetRange(value as [number, number])}
                tooltip={{
                  formatter: (value) => formatBudget(value || 0),
                }}
              />
            </Col>
          </Row>

          {/* Filter Actions */}
          <Row justify="end" style={{ marginTop: 16 }}>
            <Space>
              <Button icon={<ClearOutlined />} onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={searchLoading}
              >
                Áp dụng bộ lọc
              </Button>
            </Space>
          </Row>
        </>
      )}
    </Card>
  );
};

export default ContractorSearch;
