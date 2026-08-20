# Cloud progress contract

K-App stores one cloud snapshot per Supabase user:

```text
user_progress
├── user_id        uuid, primary key, auth.users reference
├── schema_version integer, root snapshot format version
├── progress_data  jsonb, payload for that root version
├── created_at     timestamptz, set by PostgreSQL
└── updated_at     timestamptz, set by PostgreSQL and refreshed by trigger
```

The current root version is `1`, exposed in TypeScript as
`CURRENT_PROGRESS_SCHEMA_VERSION`. A V1 row therefore means:

```text
schema_version = 1
progress_data  = ProgressV1
```

`schema_version` versions the entire cloud snapshot. It is deliberately
separate from internal subsystem versions such as
`grammarProgress.schemaVersion`; internal versions remain owned by their
subsystems.

## Read and write rules

The client reads all five columns, validates `schema_version` first, then sends
`progress_data` through the central `migrateProgressSnapshot` entry point. V1
is loaded by `loadProgressV1`, which validates the root and structural fields
before applying the existing grammar normalizer. Invalid payloads never become
an empty progression.

Cloud writes contain only `user_id`, `schema_version`, and `progress_data`.
PostgreSQL supplies `created_at`; the `set_user_progress_updated_at` trigger is
the authority for `updated_at`. Business timestamps inside `progress_data`
keep their own meaning and are not substitutes for the row timestamp.

If no cloud row exists, the complete current local progression is uploaded as
V1. If a supported row exists, it is normalized and passed to the existing
local/cloud merge. An unknown version or invalid payload stops synchronization,
keeps local progress intact, and performs no upsert.

## Adding a future root version

To add V2, define the V2 payload contract, add a focused `migrateV1ToV2`
function, extend `migrateProgressSnapshot` so versions advance sequentially,
and only then increment `CURRENT_PROGRESS_SCHEMA_VERSION`. Add fixtures for
both the migration and the new upsert version. Do not remove or repurpose
internal subsystem versions.

## Deployment

Apply `supabase/migrations/20260818120000_user_progress.sql` manually. The
migration intentionally does not use `IF NOT EXISTS`: if a remote
`user_progress` table or related objects already exist, deployment must fail so
their shape can be inspected and reconciled explicitly. After applying it,
verify the five columns, RLS policies, grants, foreign key, check constraint,
and update trigger in the target Supabase project.
