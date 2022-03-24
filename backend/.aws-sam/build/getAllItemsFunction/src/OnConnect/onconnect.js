const AWS = require('aws-sdk');
const jwt_decode = require('jwt-decode');
const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

exports.handler = async event => {
  console.log(event);
  var token = event.queryStringParameters.Auth;
	 token = jwt_decode(token);
  console.log(event);
  const d = new Date();
  const putParams = {
    TableName: 'reactchat_connections',
    Item: {
      connectionId: event.requestContext.connectionId,
      userid: token.sub,
      usename:token.username,
      createAt:   d.toLocaleTimeString(),
      status : 1
    }
  };

  try {
    await ddb.put(putParams).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to connect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Connected.' };
};
