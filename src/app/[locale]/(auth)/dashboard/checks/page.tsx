'use client';

import { useOrganization } from '@clerk/nextjs';
import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle,
  Clock,
  Code,
  Eye,
  FileText,
  Play,
  RefreshCw,
  Search as SearchIcon,
  XCircle,
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
import type { Document, PlagiarismCheck } from '@/types/Document';

const statusIcons = {
  pending: <Clock className="size-4 text-yellow-500" />,
  processing: <RefreshCw className="size-4 animate-spin text-blue-500" />,
  completed: <CheckCircle className="size-4 text-green-500" />,
  failed: <XCircle className="size-4 text-red-500" />,
};

const checkTypeIcons = {
  plagiarism: <BookOpen className="size-4" />,
  ai_detection: <Bot className="size-4" />,
  paraphrase: <FileText className="size-4" />,
  code_similarity: <Code className="size-4" />,
};

const checkTypeLabels = {
  plagiarism: 'Plagiarism Check',
  ai_detection: 'AI Detection',
  paraphrase: 'Paraphrase Detection',
  code_similarity: 'Code Similarity',
};

function getScoreColor(score: number | null): string {
  if (score === null) {
    return 'text-gray-400';
  }
  if (score < 20) {
    return 'text-green-600';
  }
  if (score < 40) {
    return 'text-yellow-600';
  }
  if (score < 70) {
    return 'text-orange-600';
  }
  return 'text-red-600';
}

function getScoreBg(score: number | null): string {
  if (score === null) {
    return 'bg-gray-100';
  }
  if (score < 20) {
    return 'bg-green-100';
  }
  if (score < 40) {
    return 'bg-yellow-100';
  }
  if (score < 70) {
    return 'bg-orange-100';
  }
  return 'bg-red-100';
}

export default function PlagiarismCheckPage() {
  const t = useTranslations('PlagiarismCheck');
  const { organization } = useOrganization();
  const [checks, setChecks] = useState<PlagiarismCheck[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewCheckModal, setShowNewCheckModal] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [checksRes, docsRes] = await Promise.all([
        fetch('/api/plagiarism-check'),
        fetch('/api/documents?status=pending'),
      ]);

      const checksData = await checksRes.json();
      const docsData = await docsRes.json();

      if (checksData.checks) {
        setChecks(checksData.checks);
      }
      if (docsData.documents) {
        setDocuments(docsData.documents);
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [organization?.id]);

  const startCheck = async (documentId: number, checkType: string) => {
    try {
      const response = await fetch('/api/plagiarism-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId, checkType }),
      });

      const data = await response.json();
      if (data.check) {
        setChecks([data.check, ...checks]);
        setShowNewCheckModal(false);
      }
    } catch (error) {
      console.error('Failed to start check:', error);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="p-6">
        {/* Stats Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-100 p-2">
                <SearchIcon className="size-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">{checks.length}</p>
                <p className="text-sm text-muted-foreground">Total Checks</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-100 p-2">
                <CheckCircle className="size-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {checks.filter(c => c.status === 'completed').length}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-yellow-100 p-2">
                <Clock className="size-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {checks.filter(c => c.status === 'processing').length}
                </p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-orange-100 p-2">
                <AlertTriangle className="size-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold">
                  {checks.filter(c => (c.overallScore || 0) > 40).length}
                </p>
                <p className="text-sm text-muted-foreground">Flagged</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Checks</h2>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowNewCheckModal(true)}>
              <Play className="mr-2 size-4" />
              New Check
            </Button>
          </div>
        </div>

        {/* Checks Table */}
        <div className="rounded-lg border bg-white">
          {loading
            ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-8 animate-spin text-muted-foreground" />
                </div>
              )
            : checks.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <SearchIcon className="mb-4 size-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No plagiarism checks yet</h3>
                    <p className="mt-1 text-muted-foreground">
                      Upload a document and run your first check
                    </p>
                    <Button className="mt-4" onClick={() => setShowNewCheckModal(true)}>
                      <Play className="mr-2 size-4" />
                      Start Check
                    </Button>
                  </div>
                )
              : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Document ID</TableHead>
                        <TableHead>Check Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Similarity</TableHead>
                        <TableHead>AI Score</TableHead>
                        <TableHead>Originality</TableHead>
                        <TableHead>Sources</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {checks.map(check => (
                        <TableRow key={check.id}>
                          <TableCell>
                            #
                            {check.documentId}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {checkTypeIcons[check.checkType]}
                              <span className="text-sm">{checkTypeLabels[check.checkType]}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {statusIcons[check.status]}
                            </div>
                          </TableCell>
                          <TableCell>
                            {check.overallScore !== null
                              ? (
                                  <span className={`rounded-full px-2 py-1 text-sm font-medium ${getScoreBg(check.overallScore)} ${getScoreColor(check.overallScore)}`}>
                                    {check.overallScore}
                                    %
                                  </span>
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {check.aiScore !== null
                              ? (
                                  <span className={`rounded-full px-2 py-1 text-sm font-medium ${getScoreBg(check.aiScore)} ${getScoreColor(check.aiScore)}`}>
                                    {check.aiScore}
                                    %
                                  </span>
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {check.originalityScore !== null
                              ? (
                                  <span className="font-medium text-green-600">
                                    {check.originalityScore}
                                    %
                                  </span>
                                )
                              : '-'}
                          </TableCell>
                          <TableCell>{check.sourceCount || 0}</TableCell>
                          <TableCell>{formatDate(check.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <a href={`/dashboard/checks/${check.id}`}>
                                <Eye className="size-4" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
        </div>
      </div>

      {/* New Check Modal */}
      {showNewCheckModal && (
        <NewCheckModal
          documents={documents}
          onClose={() => setShowNewCheckModal(false)}
          onSubmit={startCheck}
        />
      )}
    </>
  );
}

function NewCheckModal({
  documents,
  onClose,
  onSubmit,
}: {
  documents: Document[];
  onClose: () => void;
  onSubmit: (documentId: number, checkType: string) => void;
}) {
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [checkType, setCheckType] = useState('plagiarism');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentId) {
      return;
    }

    setSubmitting(true);
    await onSubmit(documentId, checkType);
    setSubmitting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Start Plagiarism Check</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="check-document" className="mb-1 block text-sm font-medium">Select Document *</label>
            <select
              id="check-document"
              className="w-full rounded-md border border-input px-3 py-2"
              value={documentId || ''}
              onChange={e => setDocumentId(Number.parseInt(e.target.value, 10))}
              required
            >
              <option value="">Choose a document...</option>
              {documents.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.title}
                  {' '}
                  (
                  {doc.fileName}
                  )
                </option>
              ))}
            </select>
            {documents.length === 0 && (
              <p className="mt-1 text-sm text-muted-foreground">
                No pending documents. Upload a document first.
              </p>
            )}
          </div>

          <div>
            <label htmlFor="check-type" className="mb-1 block text-sm font-medium">Check Type *</label>
            <select
              id="check-type"
              className="w-full rounded-md border border-input px-3 py-2"
              value={checkType}
              onChange={e => setCheckType(e.target.value)}
            >
              <option value="plagiarism">Plagiarism Check</option>
              <option value="ai_detection">AI Content Detection</option>
              <option value="paraphrase">Paraphrase Detection</option>
              <option value="code_similarity">Code Similarity</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!documentId || submitting}>
              {submitting
                ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Starting...
                    </>
                  )
                : (
                    <>
                      <Play className="mr-2 size-4" />
                      Start Check
                    </>
                  )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
