declare interface Call {
  id: string;
  time: Date;
  label: string;
  isEnabled: boolean;
  repeatDays: number[]; // 0-6 for Sunday-Saturday
  sound?: string;
  notificationId?: string;
}
