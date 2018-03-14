import { Document, Model } from "mongoose";

interface Entry extends Document {
  title: string;
  value: String;
  previousHit: Date;
}

let entry: Model<Entry>;

export = entry;
