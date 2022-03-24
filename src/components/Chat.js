import React, { Component } from 'react'
import ChatInput from './ChatInput'
import ChatMessage from './ChatMessage'
import {Auth} from 'aws-amplify'
import axios from "axios";
const config = require('../config.json');

const URL = `wss://8ku028i8e8.execute-api.us-west-2.amazonaws.com/Prod`

class Chat extends Component {
  state = {
    name: (this.props.auth.isAuthenticated === true)?(this.props.auth.user.username):'unknown',
    messages: [],
  }
  ws = new WebSocket(`${URL}?Auth=${this.props.auth.Token}`)
 
  Getmess = async (sender,reciever) => {
    // add call to AWS API Gateway to fetch products here
    // then set them in state
    try {
      const session = await Auth.currentSession();
      const param = 
      { headers: {"Authorization" : `Bearer ${session.idToken.jwtToken}`} }
      const res = await axios.get(`${config.api.invokeUrl}/chat?sender=${sender}&reciever=${reciever}`,param);
      console.log(res);
      let message = {};
      let data = res.data.Items;
      data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt); // descending
      })
      
      for(var i in data)
      {
        message.data = data[i].content;
        message.name =data[i].sender;
        this.addMessage(message);
        message = {};
      }
    } catch (err) {
      console.log(`An error has occurred: ${err}`);
    }
  }
  componentDidMount() {
    this.ws.onopen = (event) => {
      // on connecting, do nothing but log it to the console
      console.log(event)
      console.log(this.ws);
      console.log(this.props)
      this.props.history.push('/chat?sub='+this.props.auth.user.attributes.sub)
      console.log('connected')
      this.Getmess(this.props.auth.user.attributes.sub,'GLOBAL')
    }
    
   
    this.ws.onmessage = (event) => {
      let message = {};
      
      message.data = JSON.parse(event.data).message;
      message.name = JSON.parse(event.data).user_id;
      console.log(message);
      this.addMessage(message);
    }
    
    this.ws.onclose = () => {
      console.log('disconnected')
      // automatically try to reconnect on connection loss
      this.setState({
        ws: new WebSocket(`${URL}?Auth=${this.props.auth.Token}`),
      })

    }
  }

  addMessage = message =>
    this.setState(state => ({ messages: [message, ...state.messages] }))

  submitMessage = async messageString => {
      const session = await Auth.currentSession();
      const param = 
      { headers: {"Authorization" : `Bearer ${session.idToken.jwtToken}`} }
      const params = {
        "user_id": this.props.auth.user.attributes.sub,
        "message": messageString,
        "reciever":"GLOBAL"
      };
    await axios.post(`${config.api.invokeUrl}/chat`, params,param);
    //this.addMessage(message)
    // await this.ws.send(JSON.stringify(
    //   {
    //     "action": "message",
    //     "data" : JSON.stringify(params)
    //   }
    // ));
  }

  render() {
    return (
      <div>
        
        <ChatInput
          ws={this.ws}
          onSubmitMessage={messageString => this.submitMessage(messageString)}
        />
        {this.state.messages.map((message, index) =>
          <ChatMessage
            key={index}
            message={message.data}
            name={message.name}
          />,
        )}
      </div>
    )
  }
}

export default Chat