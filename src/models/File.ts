import mongoose from 'mongoose';

// Ensure connection to the correct database
if (mongoose.connection.readyState === 0) {
  mongoose.connect(process.env.MONGODB_URI || '', {
    dbName: 'default'
  });
}

// Define the schema
const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  content: {
    type: Buffer,
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'Data' // Explicitly set collection name
});

// Check if the model exists before creating
export const File = mongoose.models.Data || mongoose.model('Data', fileSchema, 'Data');