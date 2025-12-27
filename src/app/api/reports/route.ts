import { auth } from '@clerk/nextjs/server';
import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import {
  documentSchema,
  flaggedSectionSchema,
  matchedSourceSchema,
  plagiarismCheckSchema,
  reportSchema,
} from '@/models/Schema';

// GET /api/reports - List all reports
export async function GET(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    const reports = await db
      .select()
      .from(reportSchema)
      .where(eq(reportSchema.orgId, orgId))
      .orderBy(desc(reportSchema.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ reports, count: reports.length });
  } catch (error) {
    console.error('Error fetching reports:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reports' },
      { status: 500 },
    );
  }
}

// POST /api/reports - Generate a new report from a plagiarism check
export async function POST(request: Request) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { checkId, reportType = 'full' } = body;

    if (!checkId) {
      return NextResponse.json(
        { error: 'Missing required field: checkId' },
        { status: 400 },
      );
    }

    // Verify check exists and belongs to org
    const [check] = await db
      .select()
      .from(plagiarismCheckSchema)
      .where(and(
        eq(plagiarismCheckSchema.id, checkId),
        eq(plagiarismCheckSchema.orgId, orgId),
      ));

    if (!check) {
      return NextResponse.json(
        { error: 'Plagiarism check not found' },
        { status: 404 },
      );
    }

    if (check.status !== 'completed') {
      return NextResponse.json(
        { error: 'Plagiarism check is not completed yet' },
        { status: 400 },
      );
    }

    // Get document
    const [document] = await db
      .select()
      .from(documentSchema)
      .where(eq(documentSchema.id, check.documentId));

    // Get matched sources
    const matchedSources = await db
      .select()
      .from(matchedSourceSchema)
      .where(eq(matchedSourceSchema.checkId, checkId));

    // Get flagged sections
    const flaggedSections = await db
      .select()
      .from(flaggedSectionSchema)
      .where(eq(flaggedSectionSchema.checkId, checkId));

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    // Generate report data
    const reportData = {
      document: {
        title: document.title,
        fileName: document.fileName,
        studentName: document.studentName,
        studentId: document.studentId,
        courseId: document.courseId,
        submittedAt: document.createdAt,
      },
      results: {
        overallScore: check.overallScore,
        aiScore: check.aiScore,
        paraphraseScore: check.paraphraseScore,
        originalityScore: check.originalityScore,
        wordCount: check.wordCount,
        sentenceCount: check.sentenceCount,
        sourceCount: check.sourceCount,
        flaggedSections: check.flaggedSections,
        processingTime: check.processingTime,
        completedAt: check.completedAt,
      },
      matchedSources: matchedSources.map(source => ({
        title: source.sourceTitle,
        url: source.sourceUrl,
        author: source.sourceAuthor,
        type: source.sourceType,
        matchPercentage: source.matchPercentage,
        severity: source.severity,
      })),
      flaggedContent: flaggedSections.map(section => ({
        type: section.sectionType,
        text: section.text.substring(0, 200) + (section.text.length > 200 ? '...' : ''),
        confidence: section.confidence,
        severity: section.severity,
        explanation: section.explanation,
      })),
      generatedAt: new Date().toISOString(),
      reportType,
    };

    // Create report record
    const [report] = await db
      .insert(reportSchema)
      .values({
        checkId,
        orgId,
        reportType,
        reportData,
        isShared: false,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      })
      .returning();

    return NextResponse.json({ report, reportData }, { status: 201 });
  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 },
    );
  }
}
