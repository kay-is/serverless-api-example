const fs = require("fs");
const { promisify } = require("util");
const request = promisify(require("request"));

// This file tests some basic image upload and tagging as CLI
// it gets the API URL from an api-url file

const baseUrl = fs.readFileSync(__dirname + "/api-url", 'utf8').trim();

console.log("Using API base URL: " + baseUrl);

const run = async () => {
  let result;
  
  console.log("Sign up as user 'test'");
  result = await sendRequest({
    method: "POST",
    url: baseUrl + "signup", 
    body: {
      username: "test",
      password: "Abc123!"
    }
  });
  console.log(result);

  console.log("Sign in as user 'test'");
  result = await sendRequest({
    method: "POST",
    url: baseUrl + "signin", 
    body: {
      username: "test",
      password: "Abc123!"
    }
  });
  console.log(result);
  const {token} = result;

  console.log("Get signed S3 image URL");
  result = await sendRequest({
    method: "POST",
    url: baseUrl + "images",
    headers: {
      Authorization: "Bearer " + token
    }
  });
  console.log(result);

  const imagePath = __dirname + '/test.jpg'
  const knownLength = fs.statSync(imagePath).size; 

  console.log("Upload image to S3");
  result = await sendRequest({
    method: "POST",
    url: result.formConfig.uploadUrl,
    formData: {
      ...result.formConfig.formFields,
      file: { // S3 expects file in the "file" field
        value: fs.createReadStream(imagePath),
        options: {
          filename: result.formConfig.formFields.Key,
          contentType: 'image/jpeg',
          knownLength
        }
      }
    }
  });
  console.log(result);

  await sleep(1000);

  console.log("Get all tags");
  result = await sendRequest({
    method: "GET",
    url: baseUrl + "tags",
    headers: {
      Authorization: "Bearer " + token
    }
  });
  console.log(result);

  const tag = result.tags[0];

  console.log("Get images by tag: " + tag);
  result = await sendRequest({
    method: "GET",
    url: baseUrl + `tags/${tag}/images`,
    headers: {
      Authorization: "Bearer " + token
    }
  });
  console.log(JSON.stringify(result, null, 2));
};

const sendRequest = async options => {
  if (options.body) options.body = JSON.stringify(options.body);
  const result = await request(options);
  try {
    return JSON.parse(result.body);
  } catch(e) {
    return result.body
  }
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

run();