import { MessageService } from '../services/message';
import { MessageRecord } from '../services/message.types';

let messageService: MessageService;

export const initializeMessageLogger = () => {
  messageService = new MessageService();
};

export const logIncomingMessage = async (ctx: any, flowName?: string) => {
  if (!messageService) return;
  
  try {
    await messageService.saveMessage({
      phoneNumber: ctx.from,
      message: ctx.body || ctx.message,
      direction: 'incoming',
      timestamp: new Date(),
      flowName
    });
  } catch (error) {
    console.error('Error logging incoming message:', error);
  }
};

export const logOutgoingMessage = async (phoneNumber: string, message: string, flowName?: string, mediaUrl?: string) => {
  if (!messageService) return;
  
  try {
    await messageService.saveMessage({
      phoneNumber,
      message,
      direction: 'outgoing',
      timestamp: new Date(),
      flowName,
      mediaUrl
    });
  } catch (error) {
    console.error('Error logging outgoing message:', error);
  }
};

export const getMessageService = () => messageService;