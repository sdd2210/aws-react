const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

exports.handler = async event => {
  console.log(event);
  let deleteParams = {
    TableName: "reactchat_connections", // Table Name
    Key: {
        connectionId:  event.requestContext.connectionId // connection ID
    }
  };

  try {
    await ddb.delete(deleteParams, function(err, data) {
      if (err) console.log(err);
      else console.log(data);
   }).promise();
  } catch (err) {
    return { statusCode: 500, body: 'Failed to disconnect: ' + JSON.stringify(err) };
  }

  return { statusCode: 200, body: 'Disconnected.' };
};