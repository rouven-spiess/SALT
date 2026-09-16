# Jira handoff index

These Markdown notes are ready to copy into the existing issues. Jira itself has not been updated. Status reflects evidence, not code presence. **Ready for teammate deployment** of NEW infrastructure after local tests, browser checks, SAM lint/build and React compilation passed on 2026-09-13. Real deployment and AWS security verification remain PENDING.

| Issue | Local implementation | AWS verification |
| --- | --- | --- |
| [AWSASSET-4](AWSASSET-4.md) — Deploy Cognito pool | SAM pool/client/domain definitions | SAM lint/build passed; not deployed |
| [AWSASSET-5](AWSASSET-5.md) — Groups and test users | Five groups defined; local permission tests pass | Groups not deployed; no real test users created |
| [AWSASSET-7](AWSASSET-7.md) — Protected pages | React demo guard and auth-provider seam | Local browser checks passed; real provider depends on AWSASSET-6 |
| [AWSASSET-8](AWSASSET-8.md) — API authorizer | SAM authorizer and Lambda group checks | Real API Gateway security tests not run |

See [deployment handoff](../deployment.md), [local verification](../local-verification.md), [AWS verification checklist](../aws-verification-checklist.md), and [AWSASSET-6 integration contract](../auth-contract.md). It is proposed coordination material, not confirmation of teammate agreement.

Bedrock integration is **additional proposed scope**. [Its proposal](../bedrock-plan.md) needs a separate team-agreed Jira issue before implementation; it is not an acceptance criterion of these four issues.

Commit messages must include applicable existing issue keys. Suggested subjects:

- AWSASSET-4 AWSASSET-5: define Cognito pool and five groups
- AWSASSET-7: scaffold React protected demo and AWSASSET-6 adapter
- AWSASSET-8: enforce API token context and demo group permissions

The original local folder had no Git history. The application import is prepared on feature/import-asset-tracker, based on the existing mrleom/SALT main history. See Git history for import commits; Jira has not been updated. The original SALT project plan is preserved in README.md and application setup is in ASSET_TRACKER.md.
