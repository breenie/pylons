# Pylons 🚡

Webcam image archive of the [Lake District Ski Club](https://www.https://www.ldscsnowski.co.uk/).

## Barebones

```
npm ci
npm run dump:data
npm run build:css
npx @11ty/eleventy --serve --watch
# Visit http://localhost:8080/
```

## Configure the hosting/stack

Create a certificate in AWS ACM in `us-east-1`, note the ARN.

```sh
aws cloudformation create-stack \
  --stack-name pylons-production \
  --region eu-west-1 \
  --parameters \
    ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
  --template-body file://templates/main.yml \
  --capabilities CAPABILITY_NAMED_IAM
```

Grab the access key and secret from the outputs in cloudformation (pretend to understand/care about the secutiry implications of storing these in plain).
Head over to GitHub and configure the repository environments, then add the following variables:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY` (make this secret)
- `AWS_DEFAULT_REGION`
- `BUCKET`
