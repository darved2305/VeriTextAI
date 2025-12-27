import { auth } from '@clerk/nextjs/server';
import { and, desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { documentSchema } from '@/models/Schema';

// GET /api/documents - List all documents for the organization
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

    let query = db
      .select()
      .from(documentSchema)
      .where(eq(documentSchema.orgId, orgId))
      .orderBy(desc(documentSchema.createdAt))
      .limit(limit)
      .offset(offset);

    if (status) {
      query = db
        .select()
        .from(documentSchema)
        .where(and(
          eq(documentSchema.orgId, orgId),
          eq(documentSchema.status, status as 'pending' | 'processing' | 'completed' | 'failed'),
        ))
        .orderBy(desc(documentSchema.createdAt))
        .limit(limit)
        .offset(offset);
    }

    const documents = await query;

    return NextResponse.json({ documents, count: documents.length });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 },
    );
  }
}

// POST /api/documents - Upload a new document
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
    const { title, fileName, fileType, fileSize, content, studentName, studentId, courseId, language } = body;

    if (!title || !fileName || !fileType || !fileSize) {
      return NextResponse.json(
        { error: 'Missing required fields: title, fileName, fileType, fileSize' },
        { status: 400 },
      );
    }

    const [document] = await db
      .insert(documentSchema)
      .values({
        orgId,
        userId,
        title,
        fileName,
        fileType,
        fileSize,
        content: content || null,
        studentName: studentName || null,
        studentId: studentId || null,
        courseId: courseId || null,
        language: language || 'en',
        status: 'pending',
      })
      .returning();

    return NextResponse.json({ document }, { status: 201 });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' },
      { status: 500 },
    );
  }
}
