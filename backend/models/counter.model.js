import mongoose from 'mongoose';

const counterSchema = new mongoose.Schema({
  entity: { type: String, required: true, unique: true }, // Entity name (Task etc....)
  count: { type: Number, default: 0 },
});

const Counter = mongoose.model('counter', counterSchema);

export default Counter;
