export interface MessageRecord {
  id?: string;
  phoneNumber: string;
  message: string;
  direction: 'incoming' | 'outgoing';
  timestamp: Date;
  flowName?: string;
  mediaUrl?: string;
}