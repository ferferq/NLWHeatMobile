import React, { useEffect, useState } from 'react';

import {
  ScrollView
} from 'react-native';
import { api } from '../../services/api';
import { Message, MessageProps } from '../Message';
import { io } from 'socket.io-client';

import { styles } from './styles';

const socket = io(String(api.defaults.baseURL));

let messagesQueue: MessageProps[] = [];

socket.on('new_message', (newMensagem) => {
  messagesQueue.push(newMensagem);
})

export function MessageList(){
  const [ currentMessages, setCurrentMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    async function fetchMessages(){
      const messagesResponse = await api.get<MessageProps[]>('/messages/last3');
      setCurrentMessages(messagesResponse.data);
    }
    fetchMessages();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      if (messagesQueue.length > 0) {
        setCurrentMessages(message => [
          messagesQueue[0],
          message[0],
          message[1]
        ].filter(Boolean))
        messagesQueue.shift();
      }
    });

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="never"
    >
      {
        currentMessages.map(message => {
          return (
            <Message data={message} key={`${message.id}+${message.text}`} />
          )
        })
      }
    </ScrollView>
  );
}