exports.handler = async () => ({
  statusCode: 200,
  headers: { "Access-Control-Allow-Origin": "*" },
  body: JSON.stringify({
    endpoints: [
      {
        title: "Sign Up",
        method: "POST",
        url: "/Prod/singup",
        statusCode: 201,
        requestBody: {
          username: "string",
          password: "string"
        }
      },
      {
        title: "Sign In",
        method: "POST",
        url: "/Prod/singin",
        statusCode: 201,
        responseBody: {
          username: "string",
          password: "string"
        },
        responseBody: {
          token: "string"
        }
      },
      {
        title: "Create Image",
        method: "POST",
        url: "/Prod/images",
        statusCode: 201,
        responseBody: {
          formConfig: {
            uploadUrl: "string",
            formFields: {
              Key: "string",
              bucket: "string",
              Policy: "string",
              "X-Amz-Algorithm": "string",
              "X-Amz-Credential": "string",
              "X-Amz-Date": "string",
              "X-Amz-Security-Token": "string",
              "X-Amz-Signature": "string"
            }
          }
        }
      },
      {
        title: "List Images",
        method: "GET",
        url: "/Prod/images",
        responseBody: {
          images: [
            {
              id: "string",
              fileUrl: "string",
              tags: ["string"]
            }
          ]
        }
      },
      {
        title: "Delete Image",
        method: "DELETE",
        url: "/Prod/images/{imageId}"
      },
      {
        title: "List Tags",
        method: "GET",
        url: "/Prod/tags",
        responseBody: {
          tags: ["string"]
        }
      },
      {
        title: "List Images by Tag",
        method: "GET",
        url: "/Prod/tags/{tagName}/images",
        statusCode: 308
      },
    ]
  })
});