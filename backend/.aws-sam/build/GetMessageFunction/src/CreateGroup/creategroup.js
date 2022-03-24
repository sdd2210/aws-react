const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) =>{
    const group_name = JSON.parse(event.body).group_name;
    const d = new Date();
    let response = {};
    let params = {
        Put : {
            Tablename : "Group",
            Item : {
                groupId = '#ORIGIN'+event.body.requestId,
                group_name = group_name,
                status = 1,
                createdAt = d
            }
        }
    }
    try{
        let data = await dynamoDB.transactWrite(params).promise();

        let responsedata = JSON.stringify({
                groupId = '#ORIGIN'+event.body.requestId,
                group_name = group_name,
                status = 1,
                createdAt = d
        });
        
         response = {
            statusCode : 200,
            headers: {
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,PUT,GET,PATCH",
           },
           body : responsedata
        } 
    } catch(e)
    {
        response = {statusCode : 403 , body : e}
    }

    return response;
   
}