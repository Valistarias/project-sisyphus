import { model, type Model, Schema, type ObjectId, type Date } from 'mongoose';

interface IMailToken {
  /** The mail of the user */
  userId: ObjectId
  /** The user password (encrypted) */
  token: string
  /** The name of the user */
  createdAt: Date
}

const mailTokenSchema = new Schema<IMailToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600
  }
});

const MailTokenModel = (): Model<IMailToken> => model('MailToken', mailTokenSchema);

export { type IMailToken, MailTokenModel };
