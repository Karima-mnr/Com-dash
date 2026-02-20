import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  matricule: {
    type: String,
    required: [true, 'Matricule is required'],
    unique: true,
    trim: true,
  },
  level: {
    type: String,
    required: [true, 'Level is required'],
    enum: ['L1', 'L2', 'L3', 'M1', 'M2'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['web', 'mobile', 'ai', 'iot', 'security', 'media'],
  },
  specialization: {
    type: String,
    required: function() {
      return this.category === 'web' || this.category === 'media';
    },
    enum: {
      values: ['frontend', 'backend', 'fullstack', 'photo', 'video', 'editing', 'social', 'content'],
      message: 'Invalid specialization for the selected category'
    }
  },
  github: {
    type: String,
    trim: true,
    match: [/^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9_-]+\/?$/, 'Please enter a valid GitHub URL'],
  },
  registeredAt: {
    type: Date,
    default: Date.now,
  }
}, {
  // Force the collection name to be exactly what's in your database
  collection: 'students', // Try different names: 'student', 'ClubCompetition', etc.
  timestamps: false // Since you have registeredAt instead of createdAt/updatedAt
});

// Check if the model already exists to prevent overwriting
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);

export default Student;