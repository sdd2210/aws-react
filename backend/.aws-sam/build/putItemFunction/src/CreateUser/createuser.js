const AWS = require('aws-sdk');

const ddb = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10', region: process.env.AWS_REGION });

exports.handler = async (event) => {
  let date = new Date()
  let responseCode = 500;
  let responseBody = {};
  if (event.request.userAttributes.sub) {
      let params = {
          Item: {
              'id': event.request.userAttributes.sub,
              '__typename': 'User',
              'username':  event.userName,
              'email': event.request.userAttributes.email,
              'createdAt':  date.toISOString(),
              'updatedAt':  date.toISOString(),
          },
          TableName: process.env.USERTABLE
      }

      try {
         let data =  await ddb.put(params).promise();
         responseBody = JSON.stringify(data);
          console.log("Success")
          responseCode = 200;
      } catch (err) {
          console.log("Error", err)
      }

      console.log("Success: Everything executed correctly")
      

  } else {
      console.log("Error: Nothing was written to DynamoDB")
      responseCode = 400;
  }
  const response = {
    statusCode: responseCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,PATCH",
    },
    body: responseBody
  };

  return response;
}