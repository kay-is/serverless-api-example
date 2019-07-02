# Serverless API Example

Example API implementation for [this article](#).

## Uses

- AWS SDK
- AWS CLI
- AWS SAM
- AWS SAM CLI
- AWS CloudFormation (via CLI)
- AWS Lambda
- AWS API-Gateway
- AWS S3
- AWS Elasticsearch Service
- AWS Cognito
- AWS Systems Manager Parameter Store

## Requirements

- Node.js >8.10
- AWS CLI
- AWS SAM CLI

## Setup

    npm i
    npm run createDeployBucket
    npm run setup
    npm run store-api-key -- <CLARIFAI_API_KEY>
    
## Test

    npm run test
