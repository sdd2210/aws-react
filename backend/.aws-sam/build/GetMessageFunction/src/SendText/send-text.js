const AWS = require('aws-sdk');
var dynamoDB = new AWS.DynamoDB.DocumentClient();

AWS.config.update({region: 'us-west-2'});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});


exports.handler = async event => {
  const { message, reciever} = JSON.parse(event.body);

    const data = 
    {
      sender: event.requestContext.authorizer.claims.sub,
      message: message,
      reciever: reciever
    }
    console.log(event);
    let params = 
      {
        MessageBody: JSON.stringify(data),
        QueueUrl: process.env.QUEUE_URL
      }

  try { 
     await sqs.sendMessage(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      }).promise();
      let date = new Date()
      let Putparams = {
        TransactItems :[
        {
          Put: { // Write an item to the table
            Item: { // Actual Item
              messId : event.requestContext.requestId,
              content: message,
              sender: event.requestContext.authorizer.claims.sub,
              reciever: reciever,
              createdAt: date.toString()
            },
            TableName: "Messages",
          },
        }
        ]
      };
      await dynamoDB.transactWrite(Putparams).promise();
    let response = {
      statusCode: 200,
      headers: {
          "Access-Control-Allow-Headers" : "Content-Type",
          "Access-Control-Allow-Origin" : "*",
          "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
          "Access-Control-Allow-Credentials": true,			
      },
      body: JSON.stringify(data)
      };

  console.log("response: " + JSON.stringify(response))
  return response;
  } catch (error) {
    return {statusCode: 200,body: error.stack }
  }
    
}
