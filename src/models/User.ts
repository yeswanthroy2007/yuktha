/**
 * User Model
 * Stores user authentication and profile data
 */

import mongoose, { Schema, Document, Types } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  email: string;
  password: string;
  name: string; // Full name
  firstName: string;
  lastName: string;
  qrCode?: string; // Unique QR identifier
  emergencyDetailsCompleted: boolean; // Track if emergency details are filled
  createdAt: Date;
  updatedAt: Date;
  comparePassword: (plainPassword: string) => Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true, // Automatically trim whitespace
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
    },
    firstName: {
      type: String,
      required: [true, 'Please provide a first name'],
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name'],
      default: 'User', // Default value if not provided
    },
    qrCode: {
      type: String,
      unique: true,
      sparse: true, // Allow null values for multiple documents
    },
    emergencyDetailsCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', function (next) {
  const user = this as IUser;
  
  // Skip if password is not modified
  if (!user.isModified('password')) {
    return next();
  }

  // Hash password asynchronously
  bcrypt.genSalt(10, (err, salt) => {
    if (err) {
      console.error('❌ Password hashing error (genSalt):', err);
      return next(err);
    }

    bcrypt.hash(user.password, salt, (err, hash) => {
      if (err) {
        console.error('❌ Password hashing error (hash):', err);
        return next(err);
      }
      
      console.log('🔐 Password hashed successfully');
      user.password = hash;
      next();
    });
  });
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (plainPassword: string): Promise<boolean> {
  console.log('🔍 comparePassword method called');
  console.log('🔍 this.password exists:', !!this.password);
  console.log('🔍 this.password type:', typeof this.password);
  console.log('🔍 this.password length:', this.password?.length || 0);
  console.log('🔍 this.password starts with $2b$:', this.password?.startsWith('$2b$') || false);
  console.log('🔍 plainPassword exists:', !!plainPassword);
  console.log('🔍 plainPassword type:', typeof plainPassword);
  console.log('🔍 plainPassword length:', plainPassword?.length || 0);
  
  if (!this.password) {
    console.error('❌ comparePassword: User password is missing');
    return false;
  }
  
  if (!plainPassword) {
    console.error('❌ comparePassword: Plain password is missing');
    return false;
  }

  // Check if password is already hashed (should start with $2b$)
  if (!this.password.startsWith('$2b$') && !this.password.startsWith('$2a$') && !this.password.startsWith('$2y$')) {
    console.error('❌ comparePassword: Stored password does not appear to be a bcrypt hash');
    console.error('❌ Password format:', this.password.substring(0, 10));
    return false;
  }

  try {
    console.log('🔍 Calling bcrypt.compare...');
    const result = await bcrypt.compare(plainPassword, this.password);
    console.log('🔍 bcrypt.compare result:', result);
    
    if (!result) {
      console.log('❌ Password comparison failed');
      console.log('❌ Plain password:', plainPassword);
      console.log('❌ Stored hash preview:', this.password.substring(0, 30) + '...');
    }
    
    return result;
  } catch (error) {
    console.error('❌ bcrypt.compare error:', error);
    return false;
  }
};

export default mongoose.models.User || mongoose.model<IUser>('User', userSchema);
