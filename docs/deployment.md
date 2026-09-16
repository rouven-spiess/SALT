# Deployment guide — approved team account

**Status:** Local infrastructure validation has passed. Deployment to the approved team account and real AWS verification remain pending. Results and limits are recorded in [local verification](local-verification.md). Infrastructure deployment can proceed independently of AWSASSET-6; the complete application also requires the authentication provider integration.

## Resource ownership: this is a new stack

`template.yaml` defines a new Cognito user pool, five groups, resource server/scope, public app client, hosted-login prefix domain, API Gateway REST API/stage/authorizer, demo Lambda, execution role, invocation permissions, and log group. CloudFormation generates pool/client/API/function/role identifiers; the deployment owner supplies the stack name and domain prefix. Required group names and /demo and /admin are application contracts, not account-specific resource names.

The template does not discover, import, update, or attach to an existing team pool or API. It does not create real test users, frontend hosting, a database, or Bedrock resources.

If the team already owns a pool/API, stop before creating a parallel stack: agree the owning template/repository and integrate these definitions there in a separate change. An existing pool requires its ARN/issuer, agreed app client, resource-server scope and groups; an existing API needs the authorizer and scopes bound to every protected method plus Lambda invocation permissions, deployment, and CORS. Simply changing an output URL or a React variable does not secure the existing API. No existing-resource integration mode is implemented or tested here.

## Required inputs

| Input | Source / purpose |
| --- | --- |
| TeamProfile | Explicit teammate-account CLI/SSO profile; never default/personal credentials |
| ExpectedTeamAccount | Teammate-confirmed 12-digit account ID, entered at runtime; not saved in this repo |
| TeamRegion | Teammate-selected supported commercial AWS region, passed explicitly |
| StackName | Team-approved stack name; choose a new stack for first deployment |
| ArtifactBucket | Team-managed private deployment bucket in the selected account/region |
| ExecutionRoleArn | Team-approved CloudFormation service role in that account |
| FrontendOrigin | Exact HTTPS origin without trailing slash; HTTP localhost with chosen port allowed for development |
| CallbackPath / LogoutPath | Paths agreed with AWSASSET-6; defaults /callback and / |
| ApiStageName | Team-selected API stage |
| ResourceServerIdentifier | Team-selected scope namespace; RequiredScope output adds /demo.read |
| CognitoDomainPrefix | Unique lowercase prefix for Cognito's hosted-login domain |

The template has no fixed account ID, deployment region, frontend origin, API stage, or physical pool/API/function/role name. AWS service DNS suffixes are conventions, not personal endpoints. CognitoDomain currently targets commercial AWS (amazoncognito.com); China/GovCloud need a separately reviewed domain/feature configuration.

Local development defaults to localhost:3000 only. Override DEV_PORT in a local .env file or shell; set LOCAL_TEST_ORIGIN for HTTP smoke tests. Do not use --port independently of DEV_PORT, because the local session origin check must match the server.

## Local checks (no AWS credentials needed)

Node 22.12+, npm, Python 3.11+, and SAM are needed. Docker is not required for these checks.

```powershell
npm.cmd ci
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install aws-sam-cli==1.166.2
npm.cmd test
npm.cmd run check:build
$ValidationRegion = Read-Host 'Region to use for local template validation'
$env:SAM_CLI_TELEMETRY = '0'
$env:AWS_EC2_METADATA_DISABLED = 'true'
.\.venv\Scripts\sam.exe validate --lint --region $ValidationRegion
.\.venv\Scripts\sam.exe build --region $ValidationRegion
```

In separate terminals, run npm.cmd run dev and npm.cmd run test:local. Browser steps and actual results are in the local verification report. The build check supplies public example.invalid fixtures and writes .local/build-check; never deploy that fixture frontend. Normal npm.cmd run build requires real stack outputs.

## Deployment permissions

See [deployment permissions](deployment-permissions.md). Use an existing team-approved CloudFormation service role and private artifact bucket. CAPABILITY_IAM acknowledges role creation; it does not grant the deploying principal permissions. No personal-account credentials or profile values are included here.

## Deployment procedure — pending execution

The deployment owner must confirm approval for new resources and verify the target account before running these commands. SSO login, if needed, is performed using the explicit team profile outside this repository. Enter public configuration at prompts; use neither secrets nor tokens as parameters.

```powershell
$TeamProfile = Read-Host 'Teammate AWS CLI profile'
$ExpectedTeamAccount = Read-Host 'Teammate-confirmed account ID'
$TeamRegion = Read-Host 'Teammate AWS region'
$StackName = Read-Host 'Team stack name'
$ArtifactBucket = Read-Host 'Team private artifact bucket in this region'
$ExecutionRoleArn = Read-Host 'Team CloudFormation execution role ARN'
$FrontendOrigin = Read-Host 'Exact frontend origin without trailing slash'
$CallbackPath = Read-Host 'Callback path agreed with AWSASSET-6'
$LogoutPath = Read-Host 'Logout path agreed with AWSASSET-6'
$ApiStageName = Read-Host 'API stage'
$ResourceServerIdentifier = Read-Host 'Scope namespace'
$CognitoDomainPrefix = Read-Host 'Unique Cognito domain prefix'

function Assert-TeamAccount {
    if ([string]::IsNullOrWhiteSpace($TeamProfile) -or $TeamProfile -eq 'default' -or
        [string]::IsNullOrWhiteSpace($TeamRegion) -or $ExpectedTeamAccount -notmatch '^\d{12}$') {
        throw 'An explicit team profile, region, and confirmed account ID are required.'
    }
    $ActualAccount = aws sts get-caller-identity --profile $TeamProfile --region $TeamRegion --query Account --output text
    if ($LASTEXITCODE -ne 0 -or $ActualAccount.Trim() -ne $ExpectedTeamAccount) {
        throw 'Account verification failed. Stop; do not deploy.'
    }
    if ($ExecutionRoleArn -notmatch "^arn:aws:iam::${ExpectedTeamAccount}:role/.+") {
        throw 'CloudFormation role must belong to the confirmed team account.'
    }
}
Assert-TeamAccount

$SamArgs = @(
    'deploy', '--template-file', '.aws-sam/build/template.yaml',
    '--profile', $TeamProfile, '--region', $TeamRegion,
    '--stack-name', $StackName, '--s3-bucket', $ArtifactBucket,
    '--s3-prefix', $StackName, '--role-arn', $ExecutionRoleArn,
    '--capabilities', 'CAPABILITY_IAM', '--no-execute-changeset',
    '--parameter-overrides',
    "FrontendOrigin=$FrontendOrigin", "CallbackPath=$CallbackPath",
    "LogoutPath=$LogoutPath", "ApiStageName=$ApiStageName",
    "ResourceServerIdentifier=$ResourceServerIdentifier",
    "CognitoDomainPrefix=$CognitoDomainPrefix"
)
.\.venv\Scripts\sam.exe @SamArgs
if ($LASTEXITCODE -ne 0) { throw 'Change-set preparation failed.' }
```

This uploads artifacts and creates a CloudFormation change set in the approved team account, but does not execute the resource changes. It is a cloud action, not an offline dry run. Review the exact change-set ARN returned by SAM, additions/replacements, IAM role, callbacks, account, region, and existing-resource ownership before continuing. Do not save tokens or credentials in transcripts.

```powershell
$ChangeSetArn = Read-Host 'Exact reviewed change-set ARN returned by SAM'
Assert-TeamAccount
if ($ChangeSetArn -notlike "arn:aws:cloudformation:${TeamRegion}:${ExpectedTeamAccount}:changeSet/*") {
    throw 'Change-set ARN does not match the confirmed team account and region.'
}
aws cloudformation describe-change-set --change-set-name $ChangeSetArn --stack-name $StackName --profile $TeamProfile --region $TeamRegion
# Teammate reviews and decides to execute the exact change set:
Assert-TeamAccount
aws cloudformation execute-change-set --change-set-name $ChangeSetArn --stack-name $StackName --profile $TeamProfile --region $TeamRegion
if ($LASTEXITCODE -ne 0) { throw 'Change-set execution failed.' }
# First deployment; use stack-update-complete for a later update:
aws cloudformation wait stack-create-complete --stack-name $StackName --profile $TeamProfile --region $TeamRegion
if ($LASTEXITCODE -ne 0) { throw 'Stack did not reach completion; inspect stack events.' }
aws cloudformation describe-stacks --stack-name $StackName --profile $TeamProfile --region $TeamRegion --query 'Stacks[0].Outputs'
```

Do not proceed with frontend integration if stack creation fails. Review events and rollback with the team. UserPool has Retain on delete/replacement; the other resources do not all share that protection. Deleting a stack can leave a retained pool and users behind; cleanup must be planned separately.

## Stack outputs and frontend connection

Copy .env.example to ignored .env.aws.local after successful teammate deployment. Copy only public values from outputs:

| Stack output | React variable / use |
| --- | --- |
| UserPoolId | VITE_COGNITO_USER_POOL_ID; test-user administration |
| ClientId | VITE_COGNITO_CLIENT_ID |
| CognitoDomain | VITE_COGNITO_DOMAIN |
| IssuerUrl | VITE_COGNITO_ISSUER |
| ApiBaseUrl | VITE_API_URL, including stage |
| RequiredScope | VITE_AUTH_SCOPE |
| CallbackUrl | VITE_AUTH_CALLBACK_URL |
| LogoutUrl | VITE_AUTH_LOGOUT_URL |
| FrontendOrigin | Exact frontend hosting origin / CORS |
| UserPoolArn | Pool ownership and authorizer inspection |
| ApiId / ApiStageName | API inspection and integration references |
| DeploymentRegion | Region confirmation / SDK configuration if needed |

AWSASSET-6 must implement frontend/team-auth.js using its chosen login SDK/components. frontend/team-config.js exposes these public auth settings. See [the integration contract](auth-contract.md). The provider owns login, callback/PKCE/state validation, logout, password reset, token expiry/refresh, and session-change notification. The current placeholder cannot sign in to AWS.

Then run npm.cmd run dev:aws (with the matching registered local origin), or npm.cmd run build for the team-hosted frontend. Host dist/ with HTTPS, security headers, and SPA rewrites for the agreed callback path and /protected. Frontend hosting is separate. Re-run the [AWS verification checklist](aws-verification-checklist.md) against that exact deployed configuration before completing Jira security acceptance.

References: [SAM deployment options](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-deploy.html), [CloudFormation service roles](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html), [CloudFormation portability](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html).
