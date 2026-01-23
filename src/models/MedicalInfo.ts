/**
 * Medical Info Model
 * Stores user's medical information (blood group, allergies, etc.)
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedicalInfo extends Document {
  userId: Types.ObjectId; // Reference to User
  bloodGroup: string;
  allergies: string[];
  chronicConditions: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  medications: string[]; // Current medications
  createdAt: Date;
  updatedAt: Date;
}

const medicalInfoSchema = new Schema<IMedicalInfo>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    bloodGroup: {
      type: String,
      enum: ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'Unknown'],
      default: 'Unknown',
    },
    allergies: [
      {
        type: String,
        trim: true,
      },
    ],
    chronicConditions: [
      {
        type: String,
        trim: true,
      },
    ],
    emergencyContact: {
      name: {
        type: String,
        trim: true,
      },
      phone: {
        type: String,
        trim: true,
      },
      relationship: {
        type: String,
        trim: true,
      },
    },
    medications: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup by userId
medicalInfoSchema.index({ userId: 1 });

export default mongoose.models.MedicalInfo || mongoose.model<IMedicalInfo>('MedicalInfo', medicalInfoSchema);
