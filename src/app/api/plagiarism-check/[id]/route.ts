import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import {
  documentSchema,
  flaggedSectionSchema,
  matchedSourceSchema,
  plagiarismCheckSchema,
} from '@/models/Schema';

// GET /api/plagiarism-check/[id] - Get a specific plagiarism check with details
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

    const checkId = Number.parseInt(params.id, 10);

    // Get the check
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

    // Get the document
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

    return NextResponse.json({
      check,
      document,
      matchedSources,
      flaggedSections,
    });
  } catch (error) {
    console.error('Error fetching plagiarism check:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plagiarism check' },
      { status: 500 },
    );
  }
}

// DELETE /api/plagiarism-check/[id] - Delete a plagiarism check
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

    const checkId = Number.parseInt(params.id, 10);

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

    // Delete related records first (foreign key constraints)
    await db
      .delete(flaggedSectionSchema)
      .where(eq(flaggedSectionSchema.checkId, checkId));

    await db
      .delete(matchedSourceSchema)
      .where(eq(matchedSourceSchema.checkId, checkId));

    // Delete the check
    await db
      .delete(plagiarismCheckSchema)
      .where(eq(plagiarismCheckSchema.id, checkId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting plagiarism check:', error);
    return NextResponse.json(
      { error: 'Failed to delete plagiarism check' },
      { status: 500 },
    );
  }
}
