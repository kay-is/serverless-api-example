global.fetch = require("node-fetch");
const Cognito = require("amazon-cognito-identity-js");

const userPool = new Cognito.CognitoUserPool({
  UserPoolId: process.env.USER_POOL_ID,
  ClientId: process.env.USER_POOL_CLIENT_ID
});

exports.signUp = (username, password) =>
  new Promise((resolve, reject) =>
    userPool.signUp(username, password, null, null, (error, result) =>
      error ? reject(error) : resolve(result)
    )
  );

exports.signIn = (username, password) =>
  new Promise((resolve, reject) => {
    const authenticationDetails = new Cognito.AuthenticationDetails({
      Username: username,
      Password: password
    });
    const cognitoUser = new Cognito.CognitoUser({
      Username: username,
      Pool: userPool
    });
    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: result => resolve(result.getIdToken().getJwtToken()),
      onFailure: reject
    });
  });
