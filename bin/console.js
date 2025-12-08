#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const args = require("args");
const { S3Client, ListObjectsV2Command } = require("@aws-sdk/client-s3");

/**
 * Debug an 11ty data file by running it and outputting the result as JSON.
 * @param {string} name The name of the command
 * @param {string} sub The sub-command name
 * @param {object} options The command options
 */
const debug11ty = (name, sub, options) => {
  const eleventyFile = path.normalize(
    path.join(__dirname, "../src/_data/" + options.data + ".js")
  );

  if (!fs.existsSync(eleventyFile)) {
    console.error("File does not exist: " + eleventyFile);
    process.exit(1);
  }

  const func = require(eleventyFile);

  if (!func) {
    console.error("No function found for data: " + options.data);
    process.exit(1);
  }

  if (typeof func !== "function") {
    console.error("Data is not a function: " + options.data);
    process.exit(1);
  }

  console.log(JSON.stringify(func(), null, 2));
};

/**
 * Get a list of images from S3 and output as JSON.
 * @param {string} name The name of the command
 * @param {string} sub The sub-command name
 * @param {object} options The command options
 */
const getImageList = async (name, sub, options) => {
  const client = new S3Client({ region: "eu-west-1" });
  const { bucket: Bucket, maxKeys: MaxKeys } = options;

  const results = [];
  const params = {
    Bucket,
    MaxKeys,
    ContinuationToken: null
  };

  do {
    const data = await client.send(new ListObjectsV2Command(params));

    results.push(...(data.Contents || []));

    params.ContinuationToken = data.IsTruncated
      ? data.NextContinuationToken
      : null;
  } while (params.ContinuationToken && !MaxKeys); // paginate only if no maxKeys

  const output = path.normalize(path.join(__dirname, "../", options.output));

  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(results, null, 2));

  console.log(`Wrote ${results.length} records to ${output}`);
};

args
  .option("data", "The path to the data in src/_data", "cameras")
  .command("debug-11ty", "Debug the 11ty output", debug11ty)
  .option(
    "max-keys",
    "Limit the total number of records to retrieve from S3, if not set all records will be retrieved"
  )
  .option("bucket", "The S3 bucket to query", "ldsc-webcam-main-archived")
  .option("output", "The output file path", "data/images.json")
  .command(
    "dump",
    "Gets the raw data from S3 and dumps it to stdout",
    getImageList
  );

args.parse(process.argv);
