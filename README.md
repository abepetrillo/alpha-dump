# Alpha Dump

> Lambda microservice triggered on cron job to generate a Postgres database dump and upload it as a stream to S3.

Alpha Dump is a [AWS Lambda](https://aws.amazon.com/lambda) function deployed using the [Serverless Framework](https://serverless.com). It generates a Postgres database dump using the `pg_dump` binary executed in a Lambda function and uploads it as a stream to an S3 bucket.

This allows to upload very large databases as a multi-part uploads, which are additionally GZipped, without provisioning or managing servers. You pay only for the compute time you consume - there is no charge when your code is not running.

## Limits

The maximum execution time is 5 minutes. The database must be dumped within this time window.


## Requirements

* git
* node
* yarn

## Quick start

### 1. Clone the repo & install

```bash
$ git clone git@github.com:alphasights/alpha-dump.git
$ cd alpha-dump
$ yarn
```

### 2. Configure AWS

#### Credentials

In order to test it out locally (and upload to a live S3 bucket) or deploy to production (from your local machine or a CI environment), you need to set up an AWS Profile.

1. Go to the [AWS IAM](https://console.aws.amazon.com/iam) console
2. Go to **Users**, and click **Add user**
3. As the user name, enter `alphadump-deploy`
4. In **Access type**, select `Programmatic access` 
5. Click **Next: Permissions**
6. Scroll down and click **Next: Review**
7. Click **Create user**

Copy the **Access key ID** and the **Secret access key** in a safe place.

Back in Users, click the user we just created.

1. Under the **Permissions** tab, click **Add inline policy** at the bottom
2. Select **Custom Policy** and click **Select**
3. As **Policy Name** enter `ServerlessDeploy`
4. In the **Policy Document** enter the policy shown below. This policy allows access to the infrastructure used by CloudFormation and the Lambda. These resources are suffixed with `alphadump-`. 
	* **Please change `YourBackupS3BucketARNhere` for the ARN of your backup S3 Bucket.**
5. Click **Apply Policy**

<details>
<summary style="cursor: pointer;">Click to show policy</summary>
<pre>
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "cloudformation:*"
            ],
            "Effect": "Allow",
            "Resource": "arn:aws:cloudformation:us-east-1:579859358947:stack/alphadump-*"
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:*"
            ],
            "Resource": [
                "arn:aws:s3:::alphadump-*",
                "YourBackupS3BucketARNhere"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "s3:CreateBucket"
            ],
            "Resource": [
                "*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "lambda:*"
            ],
            "Resource": [
                "arn:aws:lambda:us-east-1:579859358947:function:alphadump-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "iam:*"
            ],
            "Resource": [
                "arn:aws:iam::579859358947:role/alphadump-*"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:*"
            ],
            "Resource": [
                "arn:aws:logs:us-east-1:579859358947:log-group:/aws/lambda/alphadump-*:"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "logs:DescribeLogStreams",
                "logs:FilterLogEvents",
                "logs:DeleteLogGroup",
                "logs:CreateLogGroup",
                "logs:DescribeLogGroups"
            ],
            "Resource": [
                "arn:aws:logs:us-east-1:579859358947:log-group::log-stream:"
            ]
        },
        {
            "Effect": "Allow",
            "Action": [
                "events:*"
            ],
            "Resource": [
                "arn:aws:events:us-east-1:579859358947:rule/alphadump-*"
            ]
        }
    ]
}
</pre>
</details>

Back in your terminal, run the following substituting the required variables:

```bash
$ PROFILE=<profile-name> KEY=<key> SECRET=<secret> yarn credentials
```

#### S3 Buckets

1. Go to the [AWS S3](https://console.aws.amazon.com/s3) console
2. Click **Create bucket**
3. Enter `alphadump-deployments-<randomstring>` and update `serverless.yml/provider.deploymentBucket` 
4. Click **Next** through the default configuration and finally **Create bucket**
5. Create another bucket called `alphadump-dev<randomstring>`. This is the default bucket for development uploads. Update `.env/S3_BUCKET` accordingly.
6. Create another bucket for production uploads. This is the bucket that will host the backups of the database. Name it any way you want.

> **Note:** These resources could be created along with the CloudFormation stack generated by the Serverless Framework. We chose not to do this because moving/deleting them would bring the CloudFormation stack to an inconsistent state. In this way we keep the buckets separate from the Lambda, which is managed by the Serverless Framework.


### 3. Configure environment variables

The required environment variables are in the `.example-env` file. 

In order ro run the Lambda **locally**, copy the file and rename it to `.env`, then set their values:

```bash
export NODE_ENV=development
export AWS_PROFILE=<my-profile>
export S3_BUCKET=<the bucket where the dumps will be uplaoded>
export DB_NAME=<database name>
export DB_HOST=<database host>
export DB_USER=<database user>
export DB_PASSWORD=<database password>
```

**Note:** After deploying the Lambda to **production**, you have to set these variables directly in the [AWS Lambda Console](https://console.aws.amazon.com/lambda).

All of them are required except for `AWS_PROFILE`.

Don't forget to set `NODE_ENV=production`

### 4. Deployment (development)

To create the CloudFormation stack and do the initial deployment, run:

```bash
$ yarn deploy:stack
```

If you modify the Lambda's code and want to update only the Lambda function, run:

```bash
$ yarn deploy:function
```

These commands use the `.env` environment variables and will deploy the `dev` stage.

### 5. Invocation

To invoke the Lambda function immediately, run:

```bash
$ yarn invoke
```

If you want to see the latest logs, run:

```bash
$ yarn logs
```

## Production Deployment

When deploying to production, either from a local machine or a CI environment, you have to manually set the `PROFILE` and `S3_BUCKET` environment variables to their production values.

The commands introduced in **4.** and **5.** can be suffixed with `:prod` to avoid using the `.env` file and use the shell environment instead.

You can deploy by to production by running:

```bash
$ PROFILE=my-deploy-profile S3_BUCKET=awesome-db-backups yarn deploy:stack:prod
```

If you want to update the function's code without making changes to the infrastructure, run:

```bash
$ PROFILE=my-deploy-profile S3_BUCKET=awesome-db-backups yarn deploy:function:prod
```


## Scripts

### Development

`$ yarn credentials`

`$ yarn build`

`$ yarn deploy:stack`

`$ yarn deploy:function`

`$ yarn invoke:local`

`$ yarn invoke`

`$ yarn logs`


### Testing

`$ yarn test:unit`

`$ yarn test:lint`

`$ yarn test`


### Production

`$ yarn deploy:stack:prod`

`$ yarn deploy:function:prod`

`$ yarn invoke:prod`

`$ yarn logs:prod`


## Infrastructure



## Contributing

## License


