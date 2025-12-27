import { auth } from '@clerk/nextjs/server';
import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/libs/DB';
import { reportSchema } from '@/models/Schema';

// GET /api/reports/[id] - Get a specific report
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

    const reportId = Number.parseInt(params.id, 10);

    const [report] = await db
      .select()
      .from(reportSchema)
      .where(and(
        eq(reportSchema.id, reportId),
        eq(reportSchema.orgId, orgId),
      ));

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch report' },
      { status: 500 },
    );
  }
}

// PATCH /api/reports/[id] - Update report sharing settings
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

    const reportId = Number.parseInt(params.id, 10);
    const body = await request.json();

    const [existingReport] = await db
      .select()
      .from(reportSchema)
      .where(and(
        eq(reportSchema.id, reportId),
        eq(reportSchema.orgId, orgId),
      ));

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 },
      );
    }

    const [updatedReport] = await db
      .update(reportSchema)
      .set({
        isShared: body.isShared ?? existingReport.isShared,
        sharedWith: body.sharedWith ?? existingReport.sharedWith,
      })
      .where(eq(reportSchema.id, reportId))
      .returning();

    return NextResponse.json({ report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    return NextResponse.json(
      { error: 'Failed to update report' },
      { status: 500 },
    );
  }
}

// DELETE /api/reports/[id] - Delete a report
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

    const reportId = Number.parseInt(params.id, 10);

    const [existingReport] = await db
      .select()
      .from(reportSchema)
      .where(and(
        eq(reportSchema.id, reportId),
        eq(reportSchema.orgId, orgId),
      ));

    if (!existingReport) {
      return NextResponse.json(
        { error: 'Report not found' },
        { status: 404 },
      );
    }

    await db
      .delete(reportSchema)
      .where(eq(reportSchema.id, reportId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting report:', error);
    return NextResponse.json(
      { error: 'Failed to delete report' },
      { status: 500 },
    );
  }
}
