import crypto from "crypto";

export interface INotification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  txHash?: string;
}

export class NotificationService {
  private static notifications: INotification[] = [];

  static addNotification(type: string, title: string, message: string, txHash?: string): INotification {
    const notif: INotification = {
      id: crypto.randomBytes(8).toString("hex"),
      type,
      title,
      message,
      timestamp: new Date(),
      read: false,
    };
    
    if (txHash) {
      notif.txHash = txHash;
    }

    this.notifications.unshift(notif);
    
    if (this.notifications.length > 100) {
      this.notifications.pop();
    }
    
    return notif;
  }

  static getNotifications(): INotification[] {
    return this.notifications;
  }

  static markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
  }

  static clearNotifications(): void {
    this.notifications = [];
  }
}
