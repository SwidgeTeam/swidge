## Requirements

### Terraform

- An IAM account has to exist with admin privileges, it will be used by Terraform to set things up
- An S3 bucket has to exist, it will be used as backend by Terraform to store the state

### Ansible

- Copy `inventory.template.yml` to create `inventory.yml`, needed to track all create instances

## Deploy a new environment

- Create two SSH key-pair's for the EC2 instances(API and relayer), and set them on the env variables.
- Add the keyfile paths to the Ansible inventory.
- Execute Terraform apply to create to spin up the infrastructure.
- Add the instances IPs to the Ansible inventory.
- Create an access key for `github-deployer-{env}`.
- Copy the `github-deployer-{env}` key details into GitHub secrets. Needed to deploy to S3 and invalidate distributions.
- Set the frontend bucket name into GitHub secrets.
- Set the frontend Cloudfront distribution ID into GitHub secrets.
- Copy the API/relayer IP into GitHub secrets.
- Copy the API/relayer SSH private key into GitHub secrets. Needed to connect to instance and push changes.

