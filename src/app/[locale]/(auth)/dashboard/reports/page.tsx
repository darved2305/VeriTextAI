'use client';

import { useOrganization } from '@clerk/nextjs';
import {
  Calendar,
  Eye,
  FileText,
  RefreshCw,
  Share2,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TitleBar } from '@/features/dashboard/TitleBar';
import type { Report } from '@/types/Document';

export default function ReportsPage() {
  const t = useTranslations('Reports');
  const { organization } = useOrganization();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      const data = await response.json();
      if (data.reports) {
        setReports(data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [organization?.id]);

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this report?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReports(reports.filter(r => r.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const handleShare = async (id: number, isShared: boolean) => {
    try {
      await fetch(`/api/reports/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isShared: !isShared }),
      });

      setReports(reports.map(r =>
        r.id === id ? { ...r, isShared: !isShared } : r,
      ));
    } catch (error) {
      console.error('Failed to update sharing:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getReportTypeBadge = (type: string | null) => {
    const types: Record<string, { label: string; color: string }> = {
      full: { label: 'Full Report', color: 'bg-blue-100 text-blue-800' },
      summary: { label: 'Summary', color: 'bg-green-100 text-green-800' },
      student: { label: 'Student View', color: 'bg-purple-100 text-purple-800' },
    };

    const typeInfo = types[type || 'full'] || types.full!;
    return (
      <span className={`rounded-full px-2 py-1 text-xs font-medium ${typeInfo.color}`}>
        {typeInfo.label}
      </span>
    );
  };

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Generated Reports</h2>
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="mr-2 size-4" />
            Refresh
          </Button>
        </div>

        {/* Reports Table */}
        <div className="rounded-lg border bg-white">
          {loading
            ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-8 animate-spin text-muted-foreground" />
                </div>
              )
            : reports.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="mb-4 size-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No reports generated yet</h3>
                    <p className="mt-1 text-muted-foreground">
                      Run a plagiarism check and generate a report to see it here
                    </p>
                  </div>
                )
              : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Check ID</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Document</TableHead>
                        <TableHead>Similarity Score</TableHead>
                        <TableHead>Shared</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Expires</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell>
                            #
                            {report.checkId}
                          </TableCell>
                          <TableCell>{getReportTypeBadge(report.reportType)}</TableCell>
                          <TableCell>
                            {(report.reportData as any)?.document?.title || '-'}
                          </TableCell>
                          <TableCell>
                            {(report.reportData as any)?.results?.overallScore !== undefined
                              ? (
                                  <span className="font-medium">
                                    {(report.reportData as any).results.overallScore}
                                    %
                                  </span>
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            <span className={`rounded-full px-2 py-1 text-xs font-medium ${
                              report.isShared
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            >
                              {report.isShared ? 'Shared' : 'Private'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Calendar className="size-3 text-muted-foreground" />
                              {formatDate(report.createdAt)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {report.expiresAt ? formatDate(report.expiresAt) : 'Never'}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/dashboard/reports/${report.id}`}>
                                  <Eye className="size-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleShare(report.id, report.isShared || false)}
                              >
                                <Share2 className={`size-4 ${report.isShared ? 'text-green-500' : ''}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(report.id)}
                              >
                                <Trash2 className="size-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
        </div>
      </div>
    </>
  );
}
