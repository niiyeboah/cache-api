import mongoose, { Schema } from "mongoose";
import loremIpsum from "lorem-ipsum";

var EntrySchema = new Schema({
  key: { type: String, unique: true, required: true },
  value: { type: String, default: loremIpsum },
  previousHit: { type: Date, default: Date.now }
});

export default mongoose.model("Entry", EntrySchema);
