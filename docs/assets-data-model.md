# Asset records — DynamoDB model and group policy

Week 1 stores assets in one on-demand table on the existing `salt-auth-sandbox` stack. Authentication remains Cognito access tokens with scope `demo.read`. Groups decide asset actions. Photo objects and Bedrock fields stay null until Week 2.

## Keys

| Key | Asset metadata item | User profile item |
| --- | --- | --- |
| `PK` | `ASSET#<assetId>` | `USER#<cognitoSub>` |
| `SK` | `METADATA` | `PROFILE` |
| `GSI1PK` / `GSI1SK` | `TAG#<assetTag lowercase>` / `ASSET#<assetId>` | (none) |
| `GSI2PK` / `GSI2SK` | `USER#<assignedUserId>` / `ASSET#<assetId>` | (none) |
| `GSI3PK` / `GSI3SK` | `DEPT#<department>` / `ASSET#<assetId>` | (none) |

Access patterns:

- Get one asset: `GetItem` on `ASSET#id` / `METADATA`
- Unique tag: `Query` GSI1 `TAG#tag`; create fails with 409 if a row exists
- Employee list: `Query` GSI2 `USER#<sub>`
- Manager list: `Query` GSI3 `DEPT#<profile.department>`
- Technician / Administrator / Auditor list: `Scan` with `SK = METADATA`
- Manager department: `GetItem` `USER#<sub>` / `PROFILE`

Book value is computed on read from purchase value, salvage value, useful life, and purchase date. It is not stored.

## Group policy

| Group | Create `POST /assets` | Read | Update `PATCH /assets/{id}` |
| --- | --- | --- | --- |
| Employee | No | Assigned to token `sub` only | Problem report on assigned assets: `status`, `condition`, `problemNote` |
| Technician | Yes | All | `condition`, `status`, cleaning and maintenance dates |
| Manager | No | Department from profile item | No |
| Administrator | Yes | All | All asset fields except `assetId` / `createdAt` |
| Auditor | No | All | No |
| No group | No | No | No |

Hiding a button is not authorization. Lambda applies the same rules to direct API calls.

## HTTP API

All routes require the Cognito authorizer and `demo.read` scope. CORS allows `GET,POST,PATCH,OPTIONS`.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/assets` | Create; server generates `assetId` |
| `GET` | `/assets` | List/search with `q`, `tag`, `status`, `category` |
| `GET` | `/assets/{id}` | Get one visible record |
| `PATCH` | `/assets/{id}` | Role-limited update |

Exact `tag` uses GSI1. Other search filters scan or query the role-visible set. Unknown properties and overlong strings are rejected.

Allowed `status` values: `Available`, `Assigned`, `Checked Out`, `In Maintenance`, `Damaged`, `Lost`, `Stolen`, `Retired`.

