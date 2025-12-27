import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { documentSchema } from '@/models/Schema';

// GET /api/documents/[id] - Get a specific document
export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const documentId = Number.parseInt(params.id, 10);

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

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json(
      { error: 'Failed to fetch document' },
      { status: 500 },
    );
  }
}

// PATCH /api/documents/[id] - Update a document
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const documentId = Number.parseInt(params.id, 10);
    const body = await request.json();

    const [existingDocument] = await db
      .select()
      .from(documentSchema)
      .where(and(
        eq(documentSchema.id, documentId),
        eq(documentSchema.orgId, orgId),
      ));

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    const [updatedDocument] = await db
      .update(documentSchema)
      .set({
        title: body.title ?? existingDocument.title,
        studentName: body.studentName ?? existingDocument.studentName,
        studentId: body.studentId ?? existingDocument.studentId,
        courseId: body.courseId ?? existingDocument.courseId,
        content: body.content ?? existingDocument.content,
        status: body.status ?? existingDocument.status,
      })
      .where(eq(documentSchema.id, documentId))
      .returning();

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 },
    );
  }
}

// DELETE /api/documents/[id] - Delete a document
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const { userId, orgId } = await auth();

    if (!userId || !orgId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const documentId = Number.parseInt(params.id, 10);

    const [existingDocument] = await db
      .select()
      .from(documentSchema)
      .where(and(
        eq(documentSchema.id, documentId),
        eq(documentSchema.orgId, orgId),
      ));

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 },
      );
    }

    await db
      .delete(documentSchema)
      .where(eq(documentSchema.id, documentId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 },
    );
  }
}
