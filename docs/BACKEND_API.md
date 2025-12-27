# VeriText AI - Backend API Documentation

This document describes the backend API routes and database schema created for the VeriText AI Academic Integrity & Plagiarism Detection platform.

## Table of Contents

- [Database Schema](#database-schema)
- [API Routes](#api-routes)
  - [Documents API](#documents-api)
  - [Plagiarism Check API](#plagiarism-check-api)
  - [Reports API](#reports-api)
- [Plagiarism Engine](#plagiarism-engine)
- [Dashboard Pages](#dashboard-pages)
- [Environment Configuration](#environment-configuration)

---

## Database Schema

Located in `src/models/Schema.ts`

### Tables

#### `documentSchema`
Stores uploaded documents for plagiarism checking.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `userId` | varchar(256) | Clerk user ID |
| `organizationId` | varchar(256) | Optional organization ID |
| `title` | varchar(512) | Document title |
| `content` | text | Full document content |
| `fileType` | varchar(50) | File type (pdf, docx, txt, etc.) |
| `fileSize` | integer | File size in bytes |
| `wordCount` | integer | Word count |
| `language` | varchar(10) | Detected language (default: 'en') |
| `status` | varchar(50) | Status: pending, processing, completed, failed |
| `createdAt` | timestamp | Creation timestamp |
| `updatedAt` | timestamp | Last update timestamp |

#### `plagiarismCheckSchema`
Tracks plagiarism check runs and results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `documentId` | integer | Foreign key to document |
| `userId` | varchar(256) | Clerk user ID |
| `organizationId` | varchar(256) | Optional organization ID |
| `overallScore` | real | Overall similarity score (0-100) |
| `aiScore` | real | AI detection score (0-100) |
| `paraphraseScore` | real | Paraphrase detection score (0-100) |
| `webSourceScore` | real | Web source match score (0-100) |
| `academicSourceScore` | real | Academic source match score (0-100) |
| `status` | varchar(50) | Status: pending, processing, completed, failed |
| `errorMessage` | text | Error message if failed |
| `processingTimeMs` | integer | Processing time in milliseconds |
| `createdAt` | timestamp | Creation timestamp |
| `completedAt` | timestamp | Completion timestamp |

#### `matchedSourceSchema`
Stores matched sources found during plagiarism checks.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `checkId` | integer | Foreign key to plagiarism check |
| `url` | varchar(2048) | Source URL |
| `title` | varchar(512) | Source title |
| `author` | varchar(256) | Source author |
| `sourceType` | varchar(50) | Type: web, academic, database, student_paper |
| `matchPercentage` | real | Match percentage |
| `matchedText` | text | Matched text excerpt |
| `originalText` | text | Original text from source |
| `startPosition` | integer | Start position in document |
| `endPosition` | integer | End position in document |
| `severity` | varchar(20) | Severity: low, medium, high, critical |
| `createdAt` | timestamp | Creation timestamp |

#### `flaggedSectionSchema`
Flags specific sections for plagiarism, AI content, or paraphrasing.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `checkId` | integer | Foreign key to plagiarism check |
| `sourceId` | integer | Optional foreign key to matched source |
| `flagType` | varchar(50) | Type: plagiarism, ai_generated, paraphrased |
| `text` | text | Flagged text |
| `startPosition` | integer | Start position in document |
| `endPosition` | integer | End position in document |
| `confidence` | real | Confidence score (0-1) |
| `severity` | varchar(20) | Severity: low, medium, high, critical |
| `explanation` | text | Explanation of the flag |
| `createdAt` | timestamp | Creation timestamp |

#### `reportSchema`
Stores generated plagiarism reports.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `checkId` | integer | Foreign key to plagiarism check |
| `userId` | varchar(256) | Clerk user ID |
| `organizationId` | varchar(256) | Optional organization ID |
| `reportType` | varchar(50) | Type: summary, detailed, executive |
| `format` | varchar(20) | Format: pdf, html, json |
| `fileUrl` | varchar(2048) | Generated file URL |
| `expiresAt` | timestamp | Expiration timestamp |
| `accessCount` | integer | Access count |
| `isPublic` | boolean | Public access flag |
| `shareToken` | varchar(256) | Unique share token |
| `createdAt` | timestamp | Creation timestamp |

#### `apiUsageSchema`
Tracks API usage for billing and analytics.

| Column | Type | Description |
|--------|------|-------------|
| `id` | serial | Primary key |
| `userId` | varchar(256) | Clerk user ID |
| `organizationId` | varchar(256) | Optional organization ID |
| `endpoint` | varchar(256) | API endpoint |
| `method` | varchar(10) | HTTP method |
| `wordCount` | integer | Words processed |
| `responseTimeMs` | integer | Response time in milliseconds |
| `statusCode` | integer | HTTP status code |
| `createdAt` | timestamp | Creation timestamp |

---

## API Routes

### Documents API

#### `GET /api/documents`
List all documents for the authenticated user.

**Query Parameters:**
- `organizationId` (optional): Filter by organization

**Response:**
```json
{
  "documents": [
    {
      "id": 1,
      "title": "Research Paper",
      "fileType": "pdf",
      "wordCount": 5000,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/documents`
Upload a new document.

**Request Body:**
```json
{
  "title": "My Research Paper",
  "content": "Full document content...",
  "fileType": "pdf",
  "fileSize": 102400,
  "organizationId": "org_123" // optional
}
```

**Response:**
```json
{
  "document": {
    "id": 1,
    "title": "My Research Paper",
    "wordCount": 1500,
    "status": "pending"
  }
}
```

#### `GET /api/documents/[id]`
Get a specific document by ID.

**Response:**
```json
{
  "document": {
    "id": 1,
    "title": "My Research Paper",
    "content": "Full document content...",
    "fileType": "pdf",
    "wordCount": 1500,
    "status": "completed"
  }
}
```

#### `PATCH /api/documents/[id]`
Update a document.

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content..."
}
```

#### `DELETE /api/documents/[id]`
Delete a document.

---

### Plagiarism Check API

#### `GET /api/plagiarism-check`
List all plagiarism checks for the authenticated user.

**Query Parameters:**
- `organizationId` (optional): Filter by organization
- `documentId` (optional): Filter by document

**Response:**
```json
{
  "checks": [
    {
      "id": 1,
      "documentId": 1,
      "overallScore": 15.5,
      "aiScore": 8.2,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/plagiarism-check`
Start a new plagiarism check.

**Request Body:**
```json
{
  "documentId": 1,
  "organizationId": "org_123" // optional
}
```

**Response:**
```json
{
  "check": {
    "id": 1,
    "documentId": 1,
    "status": "processing"
  },
  "message": "Plagiarism check started"
}
```

The check runs asynchronously. Poll the GET endpoint to check status.

#### `GET /api/plagiarism-check/[id]`
Get detailed results for a specific check.

**Response:**
```json
{
  "check": {
    "id": 1,
    "documentId": 1,
    "overallScore": 15.5,
    "aiScore": 8.2,
    "paraphraseScore": 12.0,
    "webSourceScore": 10.5,
    "status": "completed",
    "processingTimeMs": 2500
  },
  "sources": [
    {
      "id": 1,
      "url": "https://example.com/article",
      "title": "Similar Article",
      "matchPercentage": 45.5,
      "severity": "high"
    }
  ],
  "flaggedSections": [
    {
      "id": 1,
      "flagType": "ai_generated",
      "text": "This paragraph appears to be AI-generated...",
      "confidence": 0.85,
      "severity": "medium"
    }
  ]
}
```

#### `DELETE /api/plagiarism-check/[id]`
Delete a plagiarism check and all related data.

---

### Reports API

#### `GET /api/reports`
List all reports for the authenticated user.

**Query Parameters:**
- `organizationId` (optional): Filter by organization

**Response:**
```json
{
  "reports": [
    {
      "id": 1,
      "checkId": 1,
      "reportType": "detailed",
      "format": "pdf",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

#### `POST /api/reports`
Generate a new report.

**Request Body:**
```json
{
  "checkId": 1,
  "reportType": "detailed", // summary, detailed, executive
  "format": "pdf", // pdf, html, json
  "isPublic": false,
  "organizationId": "org_123" // optional
}
```

**Response:**
```json
{
  "report": {
    "id": 1,
    "checkId": 1,
    "reportType": "detailed",
    "format": "pdf",
    "fileUrl": "/reports/abc123.pdf",
    "shareToken": "unique-share-token"
  }
}
```

#### `GET /api/reports/[id]`
Get a specific report.

**Response:**
```json
{
  "report": {
    "id": 1,
    "checkId": 1,
    "reportType": "detailed",
    "format": "pdf",
    "fileUrl": "/reports/abc123.pdf",
    "isPublic": false,
    "accessCount": 5
  },
  "check": {
    "overallScore": 15.5,
    "aiScore": 8.2
  },
  "document": {
    "title": "Research Paper",
    "wordCount": 5000
  }
}
```

#### `DELETE /api/reports/[id]`
Delete a report.

---

## Plagiarism Engine

Located in `src/libs/PlagiarismEngine.ts`

### Main Functions

#### `analyzePlagiarism(content: string, options?: AnalysisOptions): Promise<PlagiarismResult>`

Analyzes text for plagiarism, AI content, and paraphrasing.

**Options:**
```typescript
type AnalysisOptions = {
  checkWebSources?: boolean; // Check against web sources
  checkAcademicSources?: boolean; // Check academic databases
  checkStudentPapers?: boolean; // Check student paper database
  detectAI?: boolean; // Detect AI-generated content
  detectParaphrase?: boolean; // Detect paraphrasing
  language?: string; // Document language
};
```

**Returns:**
```typescript
type PlagiarismResult = {
  overallScore: number; // 0-100 similarity percentage
  aiScore: number; // 0-100 AI detection probability
  paraphraseScore: number; // 0-100 paraphrase detection
  webSourceScore: number; // Web source matches
  academicSourceScore: number; // Academic source matches
  matchedSources: MatchedSource[];
  flaggedSections: FlaggedSection[];
  processingTimeMs: number;
};
```

#### `analyzeCodeSimilarity(code: string, language: string): Promise<PlagiarismResult>`

Specialized analysis for code submissions.

### Detection Methods

1. **AI Content Detection** - Pattern matching for common AI writing patterns
2. **Paraphrase Detection** - Identifies reworded content using linguistic analysis
3. **Web Source Matching** - Simulated web search for matching content
4. **Sentence Analysis** - Per-sentence similarity scoring

---

## Dashboard Pages

### Documents Page
**Route:** `/dashboard/documents`

Features:
- Document list with status indicators
- Upload new documents via modal
- Delete documents
- View document details

### Plagiarism Checks Page
**Route:** `/dashboard/checks`

Features:
- List of all checks with scores
- Score statistics cards
- Run new checks
- View detailed results

### Reports Page
**Route:** `/dashboard/reports`

Features:
- List of generated reports
- Filter by report type
- Download/share reports
- Generate new reports

---

## Environment Configuration

Add these variables to your `.env.local`:

```env
# Required for AI detection features
OPENAI_API_KEY=your-openai-api-key

# Optional - Stripe is not required for development
# STRIPE_SECRET_KEY=
# STRIPE_WEBHOOK_SECRET=
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
```

---

## Database Migrations

After modifying the schema, run:

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate
```

---

## Authentication

All API routes require authentication via Clerk. The `userId` is automatically extracted from the session.

For organization-scoped resources, pass `organizationId` in the request body or query parameters.

---

## Error Handling

All API routes return consistent error responses:

```json
{
  "error": "Error message description"
}
```

HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Future Enhancements

- [ ] Real web source API integration (Google Custom Search, Bing)
- [ ] Academic database integration (CrossRef, Semantic Scholar)
- [ ] OpenAI GPT-based AI detection
- [ ] PDF/DOCX file upload and parsing
- [ ] Webhook notifications for completed checks
- [ ] Batch document processing
- [ ] Export to LMS (Canvas, Blackboard, Moodle)
