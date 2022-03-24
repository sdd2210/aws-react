'use strict';
const AWS = require('aws-sdk');

exports.handler = async (event, context) => {
  const documentClient = new AWS.DynamoDB.DocumentClient();

  let responseBody = "";
  let statusCode = 0;

  const { id, productname } = JSON.parse(event.body);

  const params = {
    TransactItems :[
    {
      Put: { // Write an item to the table
        Item: { // Actual Item
         id : id,
         productname: productname
        
        },
        TableName: "Products",
      },
    }
    ]
  };

  try {
    const data = await documentClient.transactWrite(params).promise();
    responseBody = JSON.stringify({
      id : id ,
      productname: productname
    });
    statusCode = 201;
  } catch(err) {
    responseBody = `Unable to put product: ${err}`;
    statusCode = 403;
  }

  const response = {
    statusCode: statusCode,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,PATCH",
 },
    body: responseBody
  };

  return response;
};