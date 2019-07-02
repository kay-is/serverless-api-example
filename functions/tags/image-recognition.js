const AWS = require("aws-sdk")
const Clarifai = require("clarifai");

exports.predict = async imageUrl => {
  const clarifaiApp = await initClarifaiApp();
  const model = await clarifaiApp.models.initModel({
    version: "aa7f35c01e0642fda5cf400f543e7c40",
    id: Clarifai.GENERAL_MODEL
  });
  const clarifaiResult = await model.predict(imageUrl);
  const tags = clarifaiResult.outputs[0].data.concepts
    .filter(concept => concept.value > 0.9)
    .map(concept => concept.name);
  return tags;
};

let clarifaiApp = null;
const ssm = new AWS.SSM();
const initClarifaiApp = async () => {
  // The Lambda will only init the API client after a cold-start
  if (!clarifaiApp) {
    // Clarifai API needs an API key which is stored in SSM Parameter Store
    // The Parameter Store key is inside an environment variable
    const result = await ssm.getParameter({
      Name: process.env.PARAMETER_STORE_CLARIFAI_API_KEY, 
      WithDecryption: true
    }).promise();
    clarifaiApp = new Clarifai.App({ apiKey: result.Parameter.Value });
  }
  return clarifaiApp;
}