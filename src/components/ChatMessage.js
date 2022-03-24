import React from 'react'

const Message = ({ name, message }) =>
  <p>
    <strong>{name}</strong> <em>{message}</em>
  </p>;

export default Message;