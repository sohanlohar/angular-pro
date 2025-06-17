#!/bin/bash
set -e
export TAG=$(date "+%F")
set +x
aws sts get-caller-identity
echo "SELECTED_AWS_ACCOUNT_ID"=$ACC_ID
echo "SELECTED_CLUSTER"=$EKS_NAME
echo "SELECTED_ENVIRONMENT"=$EKS_ENV
ASSUME_ROLE_OUTPUT=$(aws sts assume-role --role-arn arn:aws:iam::$ACC_ID:role/pmd-svc-eks-role --role-session-name jenkins)
export AWS_ACCESS_KEY_ID=$(echo $ASSUME_ROLE_OUTPUT | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo $ASSUME_ROLE_OUTPUT | jq -r '.Credentials.SecretAccessKey')
export AWS_SESSION_TOKEN=$(echo $ASSUME_ROLE_OUTPUT | jq -r '.Credentials.SessionToken')
export AWS_DEFAULT_REGION=$AWS_REGION
set -x 
echo "######## K8s Deployments Started##########"                   
aws eks update-kubeconfig --name $EKS_NAME
sed -i 's/dockercicd/$CI_PIPELINE_ID/g' $PWD/k8s_deployments/$EKS_ENV/$EKS_ENV-deploy.yml
echo $EKS_ENV-$TAG-$CI_PIPELINE_ID
CI_PIPELINE_ID=$EKS_ENV-$TAG-$CI_PIPELINE_ID envsubst < $PWD/k8s_deployments/$EKS_ENV/$EKS_ENV-deploy.yml | kubectl apply --v=3 -f - || { echo "kubectl apply failed"; exit 1; }
echo "######## K8s Deployments Completed##########" 