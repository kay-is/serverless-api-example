const path = require("path");
const AWS = require("aws-sdk");

// Basic AWS Elasticsearch util functions copied from an AWS example

const httpClient = new AWS.HttpClient();
const credentials = new AWS.EnvironmentCredentials("AWS");
const endpoint = new AWS.Endpoint(process.env.ELASTICSEARCH_URL);

const sendRequest = ({ httpMethod, requestPath, payload }) =>
  new Promise((resolve, reject) => {
    const request = new AWS.HttpRequest(endpoint, process.env.REGION);

    request.method = httpMethod;
    request.path = path.join(request.path, requestPath);
    request.body = payload;
    request.headers["Content-Type"] = "application/json";
    request.headers.Host = process.env.ELASTICSEARCH_URL;

    const signer = new AWS.Signers.V4(request, "es");
    signer.addAuthorization(credentials, new Date());

    httpClient.handleRequest(
      request,
      null,
      response => {
        const { statusCode, statusMessage, headers } = response;
        let body = "";
        response.on("data", chunk => (body += chunk));
        response.on("end", () => {
          const data = { statusCode, statusMessage, headers };
          if (body) data.body = JSON.parse(body);
          resolve(data);
        });
      },
      reject
    );
  });

exports.query = (index, data) =>
  sendRequest({
    httpMethod: "POST",
    requestPath: index + "/_search",
    payload: JSON.stringify(data)
  });

exports.post = (index, data) =>
  sendRequest({
    httpMethod: "POST",
    requestPath: index,
    payload: JSON.stringify(data)
  });
