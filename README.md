# SALT
Smart Asset Lifecycle Tracker
PROJECT
AWS Smart Asset Lifecycle Tracker
│
├── EPIC — Week 1: Authentication & Core Asset Management
│   ├── Task — Create Git repository
│   ├── Task — Assign team responsibilities
│   ├── Task — Create architecture diagram
│   ├── Task — Design DynamoDB data model
│   ├── Task — Deploy Cognito User Pool
│   ├── Task — Create Cognito groups and test users
│   ├── Task — Build login/logout/password reset
│   ├── Task — Protect application pages
│   ├── Task — Configure API Gateway Cognito authorizer
│   ├── Task — Create DynamoDB asset table
│   ├── Task — Implement manual asset creation
│   ├── Task — Implement asset viewing/search
│   └── Task — Add at least 10 test assets
│
├── EPIC — Week 2: Secure Image Upload & AI Identification
│   ├── Task — Create private S3 bucket
│   ├── Task — Implement secure image uploads
│   ├── Task — Block public image access
│   ├── Task — Trigger Lambda for image processing
│   ├── Task — Integrate Bedrock vision model
│   ├── Task — Request structured AI output
│   ├── Task — Display AI suggestions
│   ├── Task — Allow accept/edit/reject
│   ├── Task — Add manual fallback
│   └── Task — Save approved asset data to DynamoDB
│
├── EPIC — Week 3: Depreciation & Maintenance Intelligence
│   ├── Task — Add purchase/salvage/useful life fields
│   ├── Task — Implement straight-line depreciation
│   ├── Task — Display current book value
│   ├── Task — Add maintenance history
│   ├── Task — Create AI maintenance recommendations
│   ├── Task — Calculate maintenance dates
│   ├── Task — Calculate replacement date
│   ├── Task — Add EventBridge scheduled checks
│   ├── Task — Add SNS notifications
│   └── Task — Test multiple asset conditions
│
└── EPIC — Week 4: Security, Testing, Monitoring & Presentation
    ├── Task — Finish Cognito group authorization
    ├── Task — Enforce backend permissions
    ├── Task — Apply least-privilege IAM
    ├── Task — Secure S3 image access
    ├── Task — Add CloudWatch logs and alarms
    ├── Task — Test unauthorized requests
    ├── Task — Test error handling
    ├── Task — Complete IaC deployment
    ├── Task — Review for exposed credentials
    ├── Task — Complete documentation
    └── Task — Prepare final demo
