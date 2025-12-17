---
title: Reports
description: API reference for reporting users and content
---

Report users for violations and manage report moderation.

## Base Endpoint

All report endpoints are prefixed with `/reports`

---

## User Reporting

### Report User

```http
POST /reports/users/:userId
```

Report a user for violating community guidelines.

**Authentication:** Required

**URL Parameters:**
- `userId` (string) - User ID to report

**Request Body:**
```json
{
  "reason": "HARASSMENT",
  "description": "Detailed description of the violation",
  "evidence": "Optional evidence or links"
}
```

**Report Reasons:**
- `HARASSMENT` - Harassment or bullying
- `SPAM` - Spam or unwanted content
- `INAPPROPRIATE_CONTENT` - Inappropriate or offensive content
- `IMPERSONATION` - Impersonating another user
- `CHEATING` - Cheating or exploiting
- `OTHER` - Other violations

**Response:**
```json
{
  "id": "report-id",
  "reporterId": "your-user-id",
  "reportedUserId": "user-id",
  "reason": "HARASSMENT",
  "status": "PENDING",
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

## My Reports

### Get My Reports

```http
GET /reports/me
```

Get all reports submitted by the current user.

**Authentication:** Required

**Response:**
```json
{
  "reports": [
    {
      "id": "report-id",
      "reportedUser": {
        "id": "user-id",
        "username": "username",
        "displayName": "Display Name"
      },
      "reason": "HARASSMENT",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z",
      "updatedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Report Statuses:**
- `PENDING` - Waiting for review
- `UNDER_REVIEW` - Being reviewed by a moderator
- `RESOLVED` - Report has been resolved
- `DISMISSED` - Report was dismissed

---

### Get My Report Details

```http
GET /reports/:reportId
```

Get details of one of your submitted reports.

**Authentication:** Required

**URL Parameters:**
- `reportId` (string) - Report ID

**Response:**
```json
{
  "id": "report-id",
  "reportedUser": {
    "id": "user-id",
    "username": "username"
  },
  "reason": "HARASSMENT",
  "description": "Detailed description",
  "evidence": "Evidence provided",
  "status": "UNDER_REVIEW",
  "moderatorNotes": "Notes from moderator (if any)",
  "resolution": "Resolution details (if resolved)",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-02T00:00:00Z"
}
```

---

### Cancel Report

```http
DELETE /reports/:reportId
```

Cancel a pending report that you submitted.

**Authentication:** Required

**URL Parameters:**
- `reportId` (string) - Report ID

**Response:**
```json
{
  "message": "Report cancelled successfully"
}
```

**Note:** Can only cancel reports with `PENDING` status.

---

## Moderation Endpoints

### Get All Reports

```http
GET /reports/moderation/all
```

Get all reports for moderation.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**Query Parameters:**
- `status` (string, optional) - Filter by status (PENDING, UNDER_REVIEW, RESOLVED, DISMISSED)

**Response:**
```json
{
  "reports": [
    {
      "id": "report-id",
      "reporter": {
        "id": "reporter-id",
        "username": "reporter"
      },
      "reportedUser": {
        "id": "user-id",
        "username": "username"
      },
      "reason": "HARASSMENT",
      "status": "PENDING",
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 15
}
```

---

### Get Report Details

```http
GET /reports/moderation/:reportId
```

Get detailed information about a report for moderation.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**URL Parameters:**
- `reportId` (string) - Report ID

**Response:**
```json
{
  "id": "report-id",
  "reporter": {
    "id": "reporter-id",
    "username": "reporter",
    "email": "reporter@example.com"
  },
  "reportedUser": {
    "id": "user-id",
    "username": "username",
    "email": "user@example.com",
    "previousReports": 2
  },
  "reason": "HARASSMENT",
  "description": "Detailed description",
  "evidence": "Evidence",
  "status": "PENDING",
  "history": [...],
  "createdAt": "2024-01-01T00:00:00Z"
}
```

---

### Moderate Report

```http
PATCH /reports/moderation/:reportId
```

Take action on a report.

**Authentication:** Required (Moderator, Admin, or Super Admin)

**URL Parameters:**
- `reportId` (string) - Report ID

**Request Body:**
```json
{
  "action": "RESOLVE",
  "resolution": "User has been warned",
  "moderatorNotes": "Internal notes about the decision",
  "userAction": "WARNING"
}
```

**Actions:**
- `TAKE_UNDER_REVIEW` - Mark as under review
- `RESOLVE` - Resolve the report (action taken)
- `DISMISS` - Dismiss the report (no action needed)

**User Actions:** (when resolving)
- `WARNING` - Issue a warning
- `SUSPENSION` - Suspend the user
- `BAN` - Ban the user
- `NONE` - No action taken on the user

**Response:**
```json
{
  "message": "Report moderated successfully",
  "report": {
    "id": "report-id",
    "status": "RESOLVED",
    "resolution": "User has been warned",
    "moderatedBy": "moderator-id",
    "moderatedAt": "2024-01-02T00:00:00Z"
  }
}
```

---

### Delete Report

```http
DELETE /reports/moderation/:reportId
```

Permanently delete a report.

**Authentication:** Required (Admin or Super Admin)

**URL Parameters:**
- `reportId` (string) - Report ID

**Response:**
```json
{
  "message": "Report deleted successfully"
}
```

**Note:** This action is permanent and should be used carefully.
