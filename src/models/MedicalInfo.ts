/**
 * Medical Info Model
 * Stores user's medical information (blood group, allergies, etc.)
 */

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedicalInfo extends Document {
  userId: Types.ObjectId; // Reference to User
  bloodGroup: string;
  bloodGroupOther: string; // For "Other" option
  allergies: string; // Stored as string for emergency display
  allergiesOther: string; // For "Other" option
  medications: string; // Stored as string for emergency display
  medicationsOther: string; // For "Other" option
  emergencyContact: string; // Stored as string "Name - Phone"
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
      trim: true,
    },
    bloodGroupOther: {
      type: String,
      trim: true,
      default: '',
    },
    allergies: {
      type: String,
      trim: true,
      default: '',
    },
    allergiesOther: {
      type: String,
      trim: true,
      default: '',
    },
    medications: {
      type: String,
      trim: true,
      default: '',
    },
    medicationsOther: {
      type: String,
      trim: true,
      default: '',
    },
    emergencyContact: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick lookup by userId is handled by unique: true on the field
// medicalInfoSchema.index({ userId: 1 });

export default mongoose.models.MedicalInfo || mongoose.model<IMedicalInfo>('MedicalInfo', medicalInfoSchema);
