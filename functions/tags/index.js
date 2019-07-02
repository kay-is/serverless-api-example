const AWS = require("aws-sdk");
const imageRecognition = require("./image-recognition");
const elasticsearch = require("aws-es-lambda");

exports.handler = async event => {
  if (event.path === "/tags") return listTags(event);
  if (!!event.Records) return extractTags(event);
  return listImages(event);
};

// Called with S3 event
const extractTags = async event => {
  const record = event.Records[0];
  const bucketName = record.s3.bucket.name;
  const fileName = record.s3.object.key;
  const tags = await imageRecognition.predict(`https://${bucketName}.s3.amazonaws.com/${fileName}`);
  await elasticsearch.post("images/image", { fileName, tags });
};

// Called with API-GW event
const listTags = async event => {
  const userName = extractUserName(event);
  // Bad Elasticsearch query to get all tags of all images of current user,
  // please improve :D
  const params = {
    query: { wildcard: { fileName: "*" + userName } },
    aggs: { tags_count: { terms: { field: "tags" } } }
  };
  const result = await elasticsearch.query("images", params);
  const tags = result.body.aggregations.tags_count.buckets.map(tag => tag.key)
  return createResponse({ tags });
};

// Called with API-GW event
const listImages = async event => ({
  statusCode: 308, // Permanent Redirect
  headers: {
    "Access-Control-Allow-Origin": "*",
    Location: "/Prod/images?tags=" + event.pathParameters.tagId
  }
});

// ============================== HELPERS ==============================

const createResponse = (data = { message: "OK" }, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(data),
  headers: { "Access-Control-Allow-Origin": "*" }
});

const extractUserName = event => event.requestContext.authorizer.claims["cognito:username"];
