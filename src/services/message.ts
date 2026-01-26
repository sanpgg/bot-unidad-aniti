import { MessageRecord } from './message.types';
import fs from 'fs';
import path from 'path';

export class MessageService {
  private messagesFile: string;

  constructor() {
    this.messagesFile = path.join(process.cwd(), 'data', 'messages.json');
    this.ensureDataDirectory();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.messagesFile);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(this.messagesFile)) {
      fs.writeFileSync(this.messagesFile, JSON.stringify([], null, 2));
    }
  }

  private readMessages(): MessageRecord[] {
    try {
      const data = fs.readFileSync(this.messagesFile, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading messages:', error);
      return [];
    }
  }

  private writeMessages(messages: MessageRecord[]): void {
    try {
      fs.writeFileSync(this.messagesFile, JSON.stringify(messages, null, 2));
    } catch (error) {
      console.error('Error writing messages:', error);
    }
  }

  async saveMessage(message: Omit<MessageRecord, 'id'>): Promise<void> {
    try {
      const messages = this.readMessages();
      const newMessage: MessageRecord = {
        ...message,
        timestamp: new Date(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      };
      messages.push(newMessage);
      this.writeMessages(messages);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }

  async getMessagesByPhone(phoneNumber: string, limit = 50): Promise<MessageRecord[]> {
    try {
      const messages = this.readMessages();
      return messages
        .filter(msg => msg.phoneNumber === phoneNumber)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  async getAllMessages(limit = 100): Promise<MessageRecord[]> {
    try {
      const messages = this.readMessages();
      return messages
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting all messages:', error);
      return [];
    }
  }
}