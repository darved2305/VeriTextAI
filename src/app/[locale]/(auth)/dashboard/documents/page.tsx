'use client';

import { useOrganization } from '@clerk/nextjs';
import {
  CheckCircle,
  Clock,
  Eye,
  FileText,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  XCircle,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TitleBar } from '@/features/dashboard/TitleBar';
import type { Document } from '@/types/Document';

const statusIcons = {
  pending: <Clock className="size-4 text-yellow-500" />,
  processing: <RefreshCw className="size-4 animate-spin text-blue-500" />,
  completed: <CheckCircle className="size-4 text-green-500" />,
  failed: <XCircle className="size-4 text-red-500" />,
};

const statusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export default function DocumentsPage() {
  const t = useTranslations('Documents');
  const { organization } = useOrganization();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/documents');
      const data = await response.json();
      if (data.documents) {
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [organization?.id]);

  const handleDelete = async (id: number) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete document:', error);
    }
  };

  const handleUpload = async (file: File, title: string, studentName?: string, studentId?: string) => {
    try {
      const content = await file.text();

      const response = await fetch('/api/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          fileName: file.name,
          fileType: file.type || 'text/plain',
          fileSize: file.size,
          content,
          studentName,
          studentId,
        }),
      });

      const data = await response.json();
      if (data.document) {
        setDocuments([data.document, ...documents]);
        setShowUploadModal(false);
      }
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
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

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    || doc.fileName.toLowerCase().includes(searchQuery.toLowerCase())
    || doc.studentName?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <>
      <TitleBar
        title={t('title_bar')}
        description={t('title_bar_description')}
      />

      <div className="p-6">
        {/* Actions Bar */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchDocuments}>
              <RefreshCw className="mr-2 size-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="mr-2 size-4" />
              Upload Document
            </Button>
          </div>
        </div>

        {/* Documents Table */}
        <div className="rounded-lg border bg-white">
          {loading
            ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="size-8 animate-spin text-muted-foreground" />
                </div>
              )
            : filteredDocuments.length === 0
              ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <FileText className="mb-4 size-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No documents found</h3>
                    <p className="mt-1 text-muted-foreground">
                      {searchQuery ? 'Try a different search term' : 'Upload your first document to get started'}
                    </p>
                    {!searchQuery && (
                      <Button className="mt-4" onClick={() => setShowUploadModal(true)}>
                        <Upload className="mr-2 size-4" />
                        Upload Document
                      </Button>
                    )}
                  </div>
                )
              : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>File</TableHead>
                        <TableHead>Student</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Uploaded</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDocuments.map(doc => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium">{doc.title}</TableCell>
                          <TableCell className="text-muted-foreground">{doc.fileName}</TableCell>
                          <TableCell>{doc.studentName || '-'}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {statusIcons[doc.status]}
                              <span className="text-sm">{statusLabels[doc.status]}</span>
                            </div>
                          </TableCell>
                          <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                          <TableCell>{formatDate(doc.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <a href={`/dashboard/documents/${doc.id}`}>
                                  <Eye className="size-4" />
                                </a>
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(doc.id)}
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

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
        />
      )}
    </>
  );
}

// Upload Modal Component
function UploadModal({
  onClose,
  onUpload,
}: {
  onClose: () => void;
  onUpload: (file: File, title: string, studentName?: string, studentId?: string) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title) {
      return;
    }

    setUploading(true);
    await onUpload(file, title, studentName || undefined, studentId || undefined);
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-semibold">Upload Document</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="doc-title" className="mb-1 block text-sm font-medium">Title *</label>
            <Input
              id="doc-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Assignment 1 - Essay"
              required
            />
          </div>

          <div>
            <label htmlFor="doc-file" className="mb-1 block text-sm font-medium">File *</label>
            <Input
              id="doc-file"
              type="file"
              accept=".txt,.pdf,.doc,.docx,.md"
              onChange={e => setFile(e.target.files?.[0] || null)}
              required
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Supported: .txt, .pdf, .doc, .docx, .md
            </p>
          </div>

          <div>
            <label htmlFor="student-name" className="mb-1 block text-sm font-medium">Student Name</label>
            <Input
              id="student-name"
              value={studentName}
              onChange={e => setStudentName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="student-id" className="mb-1 block text-sm font-medium">Student ID</label>
            <Input
              id="student-id"
              value={studentId}
              onChange={e => setStudentId(e.target.value)}
              placeholder="STU-12345"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || !title || uploading}>
              {uploading
                ? (
                    <>
                      <RefreshCw className="mr-2 size-4 animate-spin" />
                      Uploading...
                    </>
                  )
                : (
                    <>
                      <Upload className="mr-2 size-4" />
                      Upload
                    </>
                  )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
