const AWS = require("aws-sdk");
const elasticsearch = require("./aws-es-lambda");

exports.handler = async event => {
  switch (event.httpMethod.toLowerCase()) {
    case "post":
      return createImage(event);
    case "delete":
      return deleteImage(event);
    default: 
      return listImages(event);
  }
};

// Called with API-GW event
const createImage = async event => {
  const userName = extractUserName(event);
  const fileName = "" + Math.random() + Date.now() + "+" + userName;
  const { url, fields } = await createPresignedUploadCredentials(fileName);
  return response({
    formConfig: {
      uploadUrl: url,
      formFields: fields
    }
  }, 201);
};

// Called with API-GW event
const deleteImage = async event => {
  const { imageId } = event.pathParameters;
  await elasticsearch.delete("images", imageId);
  return response({ message: "Deleted image: " + imageId });
};

// Called with API-GW event
const listImages = async event => {
  const userName = extractUserName(event);
  
  // Bad Elasticsearch query to retrieve all images of user with a specific tag
  // Please improve :D
  const queries = []
  
  const params = {
    query: {
      bool: {
        must: [{ wildcard: { fileName: "*" + userName } }]
      }
    }
  };
  
  
  if (event.queryStringParameters && event.queryStringParameters.tags) {
    let tags = event.queryStringParameters.tags.split(",");
    if (tags.length === 1) tags = tags[0];
    params.query.bool.filter = [{ match: { tags } }];
  }

  console.log(JSON.stringify(params));
  const result = await elasticsearch.query("images", params);
  console.log(JSON.stringify(result));
  const images = result.body.hits.hits.map(hit => ({
    id: hit._id,
    tags: hit._source.tags,
    fileUrl: `https://${process.env.IMAGE_BUCKET_NAME}.s3.amazonaws.com/${hit._source.fileName}`
  }));
  return response({ images });
};

// ============================== HELPERS ==============================

const extractUserName = event => event.requestContext.authorizer.claims["cognito:username"];

const response = (data, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(data),
  headers: { "Access-Control-Allow-Origin": "*" }
});

const s3Client = new AWS.S3();
const createPresignedUploadCredentials = fileName => {
  const params = {
    Bucket: process.env.IMAGE_BUCKET_NAME,
    Fields: { Key: fileName }
  };

  return new Promise((resolve, reject) =>
    s3Client.createPresignedPost(params, (error, result) =>
      error ? reject(error) : resolve(result)
    )
  );
};
