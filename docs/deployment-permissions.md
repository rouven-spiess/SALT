# Required deployment permissions

The teammate/account administrator supplies these permissions. This is a capability inventory to scope to the chosen stack/resources, not a blanket IAM policy or a request for AdministratorAccess. Organization SCPs, permission boundaries, tag rules, and customer-managed encryption keys can add constraints; the effective policy must be verified in the team account.

| Principal | Required capability |
| --- | --- |
| Teammate CLI deployment identity | STS GetCallerIdentity; CloudFormation CreateChangeSet, DescribeChangeSet, ExecuteChangeSet, DeleteChangeSet, DescribeStacks, DescribeStackEvents, GetTemplate and template validation/summary as needed, scoped to the approved stack/change sets |
| Same CLI identity | Upload/read/list deployment artifacts in the approved private S3 bucket/prefix (GetBucketLocation, ListBucket, GetObject, PutObject; multipart upload actions if required) |
| Same CLI identity | iam:PassRole only for the team CloudFormation execution role, with iam:PassedToService restricted to cloudformation.amazonaws.com |
| CloudFormation execution role | Trust cloudformation.amazonaws.com; read deployment artifacts; create/update/read/delete the resources below, including rollback and required tagging |
| Cognito portion of that role | UserPool, UserPoolClient, UserPoolDomain, UserPoolResourceServer, and Group create/describe/update/delete operations; ListGroups/ListUserPoolClients and ListTagsForResource/TagResource/UntagResource as required |
| API portion | API Gateway control-plane GET/POST/PUT/PATCH/DELETE for the new REST API, resources/methods, authorizer, deployments, stages, and gateway responses |
| Lambda portion | CreateFunction, GetFunction/GetFunctionConfiguration, UpdateFunctionCode/Configuration, DeleteFunction, AddPermission/RemovePermission/GetPolicy, and required function tagging |
| IAM portion | Create/Get/DeleteRole, UpdateAssumeRolePolicy, Attach/Detach/ListAttachedRolePolicies, Put/Get/Delete/ListRolePolicies, role tagging; PassRole limited to the generated Lambda role for lambda.amazonaws.com |
| Logs portion | Create/Describe/DeleteLogGroup, Put/DeleteRetentionPolicy, and required tags for the stack's log group |
| Optional bucket encryption | Relevant KMS encrypt/decrypt/data-key permissions for artifact upload/read if the team bucket requires its own KMS key |

Resources without known IDs at creation require carefully scoped creation permissions (for example stack-generated name prefixes, service/region/account constraints where supported). The administrator should inspect the SAM-expanded template after sam build/transform and the actual change set. API Gateway control-plane ARNs differ from execute-api invocation ARNs; do not substitute one for the other in deployment policies.

The Lambda runtime gets SAM's logging execution role (AWSLambdaBasicExecutionRole). That managed policy permits log writes; it is not an application administrator role. No Bedrock, Cognito administration, S3 application-data access, or database write permissions are requested for this function. API Gateway gets permission to invoke the specific function through SAM-generated resource policies. No public function URL is created.

Test-user provisioning is a separate, authorized human/admin task: cognito-idp:AdminCreateUser, AdminAddUserToGroup, AdminGetUser, AdminListGroupsForUser, ListUsers, and approved reset/cleanup operations as needed. Invitation delivery and temporary passwords must stay in Cognito/the team's approved credential channel, never files, Jira notes, or browser test recordings. The app's Administrator group does not grant these IAM permissions.

Local React tests, SAM lint, and SAM build do not require deployment permissions. Neither a passing local check nor this permission inventory proves that a team role can deploy successfully.

References: [SAM permissions and CloudFormation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-permissions-cloudformation.html), [passing a CloudFormation service role](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html).
