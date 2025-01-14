import {
  Schema, model, type HydratedDocument, type Model, type ObjectId
} from 'mongoose';

import type { IProgram } from '../../program/model';

interface IBodyProgram {
  /** When the body was created */
  createdAt: Date
  /** The body targeted */
  body: ObjectId
  /** The linked Program */
  program: ObjectId
  /** The bag that store this program */
  bag: ObjectId
  /** How many times the progam was used in the day */
  uses: number
}

type HydratedIBodyProgram = HydratedDocument<
  Omit<IBodyProgram, 'program'> & { program: HydratedDocument<IProgram> }
>;

const BodyProgramSchema = new Schema<IBodyProgram>({
  body: {
    type: Schema.Types.ObjectId,
    ref: 'Body'
  },
  program: {
    type: Schema.Types.ObjectId,
    ref: 'Program'
  },
  bag: {
    type: Schema.Types.ObjectId,
    ref: 'BodyBag'
  },
  uses: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const BodyProgramModel = (): Model<IBodyProgram> => model('BodyProgram', BodyProgramSchema);

export {
  BodyProgramModel, type HydratedIBodyProgram, type IBodyProgram
};
