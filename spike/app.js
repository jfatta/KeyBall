var KeyVault = require('azure-keyvault');
var AuthenticationContext = require('adal-node').AuthenticationContext;
 
var clientId = "client id here";
var clientSecret = "secret here";
var vaultUri = "https://{vault}.vault.azure.net";
var secretUri = vaultUri + "/secrets/{secret name here}";
 
// Authenticator - retrieves the access token 
var authenticator = function (challenge, callback) {
 
  // Create a new authentication context. 
  var context = new AuthenticationContext(challenge.authorization);
  
  // Use the context to acquire an authentication token. 
  return context.acquireTokenWithClientCredentials(challenge.resource, clientId, clientSecret, function (err, tokenResponse) {
    if (err) throw err;
    // Calculate the value to be set in the request's Authorization header and resume the call. 
    var authorizationValue = tokenResponse.tokenType + ' ' + tokenResponse.accessToken;
 
    return callback(null, authorizationValue);
  });
 
};


var credentials = new KeyVault.KeyVaultCredentials(authenticator);
var client = new KeyVault.KeyVaultClient(credentials);

// Retrieve the secret
client.getSecret(secretUri, function (getErr, getSecretBundle) {
  if (getErr) throw getErr;
  console.log('\n\nSecret ', getSecretBundle.id, ' is retrieved.\n');
});