import {
  bigint,
  boolean,
  integer,
  json,
  pgEnum,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// The migration is automatically applied during the next database interaction,
// so there's no need to run it manually or restart the Next.js server.

// Enums
export const documentStatusEnum = pgEnum('document_status', ['pending', 'processing', 'completed', 'failed']);
export const checkTypeEnum = pgEnum('check_type', ['plagiarism', 'ai_detection', 'paraphrase', 'code_similarity']);
export const severityEnum = pgEnum('severity', ['low', 'medium', 'high', 'critical']);

// VeriText AI - Database Schema
export const organizationSchema = pgTable(
  'organization',
  {
    id: text('id').primaryKey(),
    stripeCustomerId: text('stripe_customer_id'),
    stripeSubscriptionId: text('stripe_subscription_id'),
    stripeSubscriptionPriceId: text('stripe_subscription_price_id'),
    stripeSubscriptionStatus: text('stripe_subscription_status'),
    stripeSubscriptionCurrentPeriodEnd: bigint(
      'stripe_subscription_current_period_end',
      { mode: 'number' },
    ),
    updatedAt: timestamp('updated_at', { mode: 'date' })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => {
    return {
      stripeCustomerIdIdx: uniqueIndex('stripe_customer_id_idx').on(
        table.stripeCustomerId,
      ),
    };
  },
);

// Documents table - stores uploaded assignments/papers
export const documentSchema = pgTable('document', {
  id: serial('id').primaryKey(),
  orgId: text('org_id').notNull(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(), // pdf, docx, txt, code
  fileSize: integer('file_size').notNull(), // in bytes
  content: text('content'), // extracted text content
  language: text('language').default('en'),
  courseId: text('course_id'), // optional course/class association
  studentName: text('student_name'),
  studentId: text('student_id'),
  status: documentStatusEnum('status').default('pending').notNull(),
  metadata: json('metadata').$type<Record<string, unknown>>(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Plagiarism Check table - stores check requests and overall results
export const plagiarismCheckSchema = pgTable('plagiarism_check', {
  id: serial('id').primaryKey(),
  documentId: integer('document_id').notNull().references(() => documentSchema.id),
  orgId: text('org_id').notNull(),
  userId: text('user_id').notNull(),
  checkType: checkTypeEnum('check_type').default('plagiarism').notNull(),
  status: documentStatusEnum('status').default('pending').notNull(),
  overallScore: real('overall_score'), // 0-100 percentage similarity
  aiScore: real('ai_score'), // 0-100 AI detection probability
  paraphraseScore: real('paraphrase_score'), // 0-100 paraphrase detection
  originalityScore: real('originality_score'), // 0-100 originality score
  wordCount: integer('word_count'),
  sentenceCount: integer('sentence_count'),
  sourceCount: integer('source_count'), // number of matched sources
  flaggedSections: integer('flagged_sections'),
  processingTime: integer('processing_time'), // in milliseconds
  errorMessage: text('error_message'),
  completedAt: timestamp('completed_at', { mode: 'date' }),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Matched Sources table - stores individual source matches
export const matchedSourceSchema = pgTable('matched_source', {
  id: serial('id').primaryKey(),
  checkId: integer('check_id').notNull().references(() => plagiarismCheckSchema.id),
  sourceUrl: text('source_url'),
  sourceTitle: text('source_title'),
  sourceAuthor: text('source_author'),
  sourceType: text('source_type'), // web, academic, database, student_paper
  matchPercentage: real('match_percentage').notNull(),
  matchedText: text('matched_text'),
  originalText: text('original_text'),
  startPosition: integer('start_position'),
  endPosition: integer('end_position'),
  severity: severityEnum('severity').default('medium'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Flagged Sections table - detailed flagged content
export const flaggedSectionSchema = pgTable('flagged_section', {
  id: serial('id').primaryKey(),
  checkId: integer('check_id').notNull().references(() => plagiarismCheckSchema.id),
  sectionType: text('section_type').notNull(), // plagiarism, ai_generated, paraphrased
  text: text('text').notNull(),
  startPosition: integer('start_position').notNull(),
  endPosition: integer('end_position').notNull(),
  confidence: real('confidence').notNull(), // 0-1 confidence score
  severity: severityEnum('severity').default('medium'),
  explanation: text('explanation'),
  matchedSourceId: integer('matched_source_id').references(() => matchedSourceSchema.id),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Reports table - generated PDF/HTML reports
export const reportSchema = pgTable('report', {
  id: serial('id').primaryKey(),
  checkId: integer('check_id').notNull().references(() => plagiarismCheckSchema.id),
  orgId: text('org_id').notNull(),
  reportType: text('report_type').default('full'), // full, summary, student
  reportUrl: text('report_url'),
  reportData: json('report_data').$type<Record<string, unknown>>(),
  isShared: boolean('is_shared').default(false),
  sharedWith: json('shared_with').$type<string[]>(),
  expiresAt: timestamp('expires_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// API Usage tracking
export const apiUsageSchema = pgTable('api_usage', {
  id: serial('id').primaryKey(),
  orgId: text('org_id').notNull(),
  userId: text('user_id').notNull(),
  endpoint: text('endpoint').notNull(),
  method: text('method').notNull(),
  documentsProcessed: integer('documents_processed').default(0),
  wordsProcessed: integer('words_processed').default(0),
  creditsUsed: integer('credits_used').default(0),
  responseTime: integer('response_time'), // in milliseconds
  statusCode: integer('status_code'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Legacy todo schema (keeping for compatibility)
export const todoSchema = pgTable('todo', {
  id: serial('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

// Type exports for use in application
export type Organization = typeof organizationSchema.$inferSelect;
export type NewOrganization = typeof organizationSchema.$inferInsert;

export type Document = typeof documentSchema.$inferSelect;
export type NewDocument = typeof documentSchema.$inferInsert;

export type PlagiarismCheck = typeof plagiarismCheckSchema.$inferSelect;
export type NewPlagiarismCheck = typeof plagiarismCheckSchema.$inferInsert;

export type MatchedSource = typeof matchedSourceSchema.$inferSelect;
export type NewMatchedSource = typeof matchedSourceSchema.$inferInsert;

export type FlaggedSection = typeof flaggedSectionSchema.$inferSelect;
export type NewFlaggedSection = typeof flaggedSectionSchema.$inferInsert;

export type Report = typeof reportSchema.$inferSelect;
export type NewReport = typeof reportSchema.$inferInsert;

export type ApiUsage = typeof apiUsageSchema.$inferSelect;
export type NewApiUsage = typeof apiUsageSchema.$inferInsert;
