import { model, type Model, Schema, type ObjectId, type Date } from 'mongoose';

interface IMailToken {
  /** The user ID linked to this forgot password request */
  userId: ObjectId;
  /** The security token */
  token: string;
  /** When the security token was created */
  createdAt: Date;
}

const mailTokenSchema = new Schema<IMailToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  token: String,
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
  },
});

const MailTokenModel = (): Model<IMailToken> => model('MailToken', mailTokenSchema);

export { type IMailToken, MailTokenModel };
