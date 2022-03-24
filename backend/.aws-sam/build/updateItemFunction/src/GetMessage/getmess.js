const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB();
const ddb = new AWS.DynamoDB.DocumentClient();

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
exports.handler = async (event) => {
    const reciever= event.queryStringParameters.reciever;
    console.log(event)
    let messStatement = `SELECT * from "Messages"."messId-createdAt-index" where "reciever"='${reciever}' `;
    
    let messageinfo = await dynamoDB.executeStatement({Statement: messStatement}).promise();

    let userStatement = `SELECT * from "user_register"."id-index" `;
    
    let userinfo = await dynamoDB.executeStatement({Statement: userStatement}).promise();

   
    let listmessage = flatten(messageinfo);
    let listuser = flatten(userinfo);
    console.log(listuser.Items[0].id);
    for(var i in listmessage.Items)
    {
        for( var j in listuser.Items)
        {
            if(listmessage.Items[i].sender == listuser.Items[j].id)
            {
                listmessage.Items[i].sender = listuser.Items[j].username;
            }
        }
    }
    console.log(listmessage)

    try {
        responseBody = JSON.stringify(listmessage);
        statusCode = 200;
      } catch(err) {
        responseBody = `Unable to get products: ${err}`;
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