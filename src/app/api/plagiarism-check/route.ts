import { auth } from '@clerk/nextjs/server';
import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { analyzePlagiarism } from '@/libs/PlagiarismEngine';
import {
  documentSchema,
  flaggedSectionSchema,
  matchedSourceSchema,
  plagiarismCheckSchema,
} from '@/models/Schema';

// GET /api/plagiarism-check - List all plagiarism checks
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
    const status = searchParams.get('status');
    const limit = Number.parseInt(searchParams.get('limit') || '50', 10);
    const offset = Number.parseInt(searchParams.get('offset') || '0', 10);

    let checks;
    if (status) {
      checks = await db
        .select()
        .from(plagiarismCheckSchema)
        .where(and(
          eq(plagiarismCheckSchema.orgId, orgId),
          eq(plagiarismCheckSchema.status, status as 'pending' | 'processing' | 'completed' | 'failed'),
        ))
        .orderBy(desc(plagiarismCheckSchema.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      checks = await db
        .select()
        .from(plagiarismCheckSchema)
        .where(eq(plagiarismCheckSchema.orgId, orgId))
        .orderBy(desc(plagiarismCheckSchema.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return NextResponse.json({ checks, count: checks.length });
  } catch (error) {
    console.error('Error fetching plagiarism checks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plagiarism checks' },
      { status: 500 },
    );
  }
}

// POST /api/plagiarism-check - Start a new plagiarism check
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
    const { documentId, checkType = 'plagiarism' } = body;

    if (!documentId) {
      return NextResponse.json(
        { error: 'Missing required field: documentId' },
        { status: 400 },
      );
    }

    // Verify document exists and belongs to org
    const [document] = await db
      .select()
      .from(documentSchema)
      .where(and(
        eq(documentSchema.id, documentId),
        eq(documentSchema.orgId, orgId),
      ));

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    if (!document.content) {
      return NextResponse.json(
        { error: 'Document has no content to analyze' },
        { status: 400 },
      );
    }

    // Create plagiarism check record
    const [check] = await db
      .insert(plagiarismCheckSchema)
      .values({
        documentId,
        orgId,
        userId,
        checkType: checkType as 'plagiarism' | 'ai_detection' | 'paraphrase' | 'code_similarity',
        status: 'processing',
      })
      .returning();

    if (!check) {
      return NextResponse.json(
        { error: 'Failed to create plagiarism check' },
        { status: 500 },
      );
    }

    // Update document status
    await db
      .update(documentSchema)
      .set({ status: 'processing' })
      .where(eq(documentSchema.id, documentId));

    // Run plagiarism analysis (async, but we return immediately)
    runPlagiarismAnalysis(check.id, document.content, checkType, documentId);

    return NextResponse.json({ check }, { status: 201 });
  } catch (error) {
    console.error('Error creating plagiarism check:', error);
    return NextResponse.json(
      { error: 'Failed to create plagiarism check' },
      { status: 500 },
    );
  }
}

// Background plagiarism analysis function
async function runPlagiarismAnalysis(
  checkId: number,
  content: string,
  checkType: string,
  documentId: number,
) {
  const startTime = Date.now();

  try {
    // Run the plagiarism engine
    const result = await analyzePlagiarism(content, checkType);

    // Insert matched sources
    if (result.matchedSources && result.matchedSources.length > 0) {
      for (const source of result.matchedSources) {
        const [insertedSource] = await db
          .insert(matchedSourceSchema)
          .values({
            checkId,
            sourceUrl: source.url,
            sourceTitle: source.title,
            sourceAuthor: source.author,
            sourceType: source.type,
            matchPercentage: source.matchPercentage,
            matchedText: source.matchedText,
            originalText: source.originalText,
            startPosition: source.startPosition,
            endPosition: source.endPosition,
            severity: source.severity as 'low' | 'medium' | 'high' | 'critical',
          })
          .returning();

        const sourceRecord = insertedSource;

        // Insert flagged sections for this source
        if (source.flaggedSections && sourceRecord) {
          for (const section of source.flaggedSections) {
            await db.insert(flaggedSectionSchema).values({
              checkId,
              sectionType: section.type,
              text: section.text,
              startPosition: section.startPosition,
              endPosition: section.endPosition,
              confidence: section.confidence,
              severity: section.severity as 'low' | 'medium' | 'high' | 'critical',
              explanation: section.explanation,
              matchedSourceId: sourceRecord.id,
            });
          }
        }
      }
    }

    // Insert additional flagged sections (AI detection, paraphrasing)
    if (result.flaggedSections && result.flaggedSections.length > 0) {
      for (const section of result.flaggedSections) {
        await db.insert(flaggedSectionSchema).values({
          checkId,
          sectionType: section.type,
          text: section.text,
          startPosition: section.startPosition,
          endPosition: section.endPosition,
          confidence: section.confidence,
          severity: section.severity as 'low' | 'medium' | 'high' | 'critical',
          explanation: section.explanation,
        });
      }
    }

    const processingTime = Date.now() - startTime;

    // Update check with results
    await db
      .update(plagiarismCheckSchema)
      .set({
        status: 'completed',
        overallScore: result.overallScore,
        aiScore: result.aiScore,
        paraphraseScore: result.paraphraseScore,
        originalityScore: result.originalityScore,
        wordCount: result.wordCount,
        sentenceCount: result.sentenceCount,
        sourceCount: result.matchedSources?.length || 0,
        flaggedSections: result.flaggedSections?.length || 0,
        processingTime,
        completedAt: new Date(),
      })
      .where(eq(plagiarismCheckSchema.id, checkId));

    // Update document status
    await db
      .update(documentSchema)
      .set({ status: 'completed' })
      .where(eq(documentSchema.id, documentId));
  } catch (error) {
    console.error('Plagiarism analysis failed:', error);

    // Update check with error
    await db
      .update(plagiarismCheckSchema)
      .set({
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Analysis failed',
        processingTime: Date.now() - startTime,
      })
      .where(eq(plagiarismCheckSchema.id, checkId));

    // Update document status
    await db
      .update(documentSchema)
      .set({ status: 'failed' })
      .where(eq(documentSchema.id, documentId));
  }
}
