const { DocDB } = require('aws-sdk');
const AWS = require('aws-sdk');
var dynDB = new AWS.DynamoDB();
var dynamoDB = new AWS.DynamoDB.DocumentClient();

AWS.config.update({region: 'us-west-2'});

var sqs = new AWS.SQS({apiVersion: '2012-11-05'});

var descriptors = ['L', 'M', 'N', 'S'];

function flatten(o) {

  // flattens single property objects that have descriptors  
  for (let d of descriptors) {
    if (o.hasOwnProperty(d)) {
      return o[d];
    }
  }

  Object.keys(o).forEach((k) => {

    for (let d of descriptors) {
      if (o[k].hasOwnProperty(d)) {
        o[k] = o[k][d];
      }
    }
    if (Array.isArray(o[k])) {
      o[k] = o[k].map(e => flatten(e))
    } else if (typeof o[k] === 'object') {
      o[k] = flatten(o[k])
    }
  });

  return o;
}

let send = undefined;

let init = (event) =>
{
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: '2018-11-29',
        endpoint: "8ku028i8e8.execute-api.us-west-2.amazonaws.com/Prod",
      });
      send = async (connectionId, data) => {
        await apigwManagementApi.postToConnection({ ConnectionId: connectionId, Data: `${data}` }).promise();
      }
}

exports.handler = async (event) =>{
  console.log(event);
    init(event);
    var user_id, message, reciever;  
    if (event.Records) {
          try {
              let body = JSON.parse(event.Records[0].body)
              user_id = body.sender;
              message = body.message;
              reciever = body.reciever;
              let statement = `SELECT * FROM "reactchat_connections"."connectionId-index" WHERE "userid"  = '${user_id}' `
              let data = await dynDB.executeStatement({Statement: statement}).promise();
              let listconnect = flatten(data);
              let input = 
              {
                user_id : listconnect.Items[0].usename ,
                message : body.message,
                reciever : body.reciever
              }
              input = JSON.stringify(input);
              await send(listconnect.Items[0].connectionId,input);
              
              return {
                statusCode: 200
            };
          }
          catch (err) {
              console.error(err);
          }
      
  }
  return {
      statusCode: 200
  };
}