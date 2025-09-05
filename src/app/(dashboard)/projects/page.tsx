"use client";

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/layout/Header';
import { projectsApi, type ProjectResponseDto } from '@/lib/projects/projects.api';
import QuotesSection from './QuotesSection';
import InvitesSection from './InvitesSection';
import ContractsSection from './ContractsSection';

export default function ProjectsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectResponseDto[]>([]);
  const [activeTab, setActiveTab] = useState<'projects' | 'quotes' | 'invites' | 'contracts'>('projects');


  const params = useSearchParams();
  useEffect(() => {
    const tab = (params.get('tab') || 'projects').toLowerCase();
    if (tab === 'projects' || tab === 'quotes' || tab === 'invites' || tab === 'contracts') setActiveTab(tab as any);
  }, [params]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await projectsApi.getMyProjects();
      setProjects(data);
    } catch (e: any) {
      setError(e?.response?.data?.message || e?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined | null) => {
    if (!dateString) return 'Chưa có';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Ngày không hợp lệ';
      return date.toLocaleDateString('vi-VN');
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-green-400 bg-green-400/10 border-green-400/30';
      case 'completed': return 'text-blue-400 bg-blue-400/10 border-blue-400/30';
      case 'onhold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
      case 'draft': return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
      default: return 'text-stone-400 bg-stone-400/10 border-stone-400/30';
    }
  };

  if (loading) return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-stone-300">Loading projects...</div>
        </div>
      </div>
    </>
  );

  if (error) return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-rose-400">{error}</div>
        </div>
      </div>
    </>
  );

  const cardCls = 'bg-stone-800/60 backdrop-blur-xl rounded-xl border border-stone-700 shadow-lg p-5 text-stone-100';
  const titleCls = 'text-xl font-semibold text-amber-300 tracking-wide';
  const btnPrimary = 'inline-flex items-center justify-center rounded-md bg-amber-600 text-stone-900 px-4 py-2 font-semibold hover:bg-amber-500 active:bg-amber-600 transition';


  return (
    <>
      <Header />
      <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-stone-900 via-stone-900/95 to-stone-900 text-stone-100 pt-20">
        <div className="max-w-6xl mx-auto px-4 py-10">
          {activeTab === 'projects' && (
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-amber-200">Dự án của tôi</h1>
              <Link href="/projects/create" className={btnPrimary}>
                Tạo dự án mới
              </Link>
            </div>
          )}

          {activeTab === 'projects' && (projects.length === 0 ? (
            <div className={cardCls}>
              <div className="text-center py-12">
                <div className="text-2xl text-stone-400 mb-4">Chưa có dự án nào</div>
                <div className="text-stone-500 mb-6">Bắt đầu tạo dự án đầu tiên của bạn</div>
                <Link href="/projects/create" className={btnPrimary}>
                  Tạo dự án đầu tiên
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {projects.map((project) => (
                <div key={project.id} className={cardCls}>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-stone-100 line-clamp-2">{project.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </div>
                  
                  <p className="text-stone-400 text-sm mb-4 line-clamp-2">{project.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <span className="text-stone-500 w-20">Địa chỉ:</span>
                      <span className="text-stone-300">{project.address}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-stone-500 w-20">Diện tích:</span>
                      <span className="text-stone-300">{project.floorArea}m²</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-stone-500 w-20">Số tầng:</span>
                      <span className="text-stone-300">{project.numberOfFloors}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-stone-500 w-20">Ngân sách:</span>
                      <span className="text-stone-300">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="text-stone-500 w-20">Ngày bắt đầu:</span>
                      <span className="text-stone-300">{formatDate(project.startDate)}</span>
                    </div>
                    {project.estimatedCompletionDate && (
                      <div className="flex items-center text-sm">
                        <span className="text-stone-500 w-20">Dự kiến:</span>
                        <span className="text-stone-300">{formatDate(project.estimatedCompletionDate)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-700/60">
                    <div className="text-xs text-stone-500">
                      Tạo: {formatDate(project.createdAt)}
                    </div>
                    <Link 
                      href={`/projects/${project.id}`}
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium transition"
                    >
                      Xem chi tiết →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ))}

          {activeTab === 'quotes' && (
            <QuotesSection projects={projects} />
          )}
          {activeTab === 'invites' && (
            <InvitesSection />
          )}
          {activeTab === 'contracts' && (
            <ContractsSection />
          )}
        </div>
      </div>
    </>
  );
}