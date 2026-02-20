import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

// Use named export for GET method
export async function GET() {
  try {
    await connectDB();
    
    // Force using the club-competition database
    const db = mongoose.connection.useDb('club-competition');
    
    console.log('Connected to database:', db.databaseName);
    
    // Get the students collection
    const collection = db.collection('students');
    
    // Get all students
    const students = await collection.find({}).sort({ registeredAt: -1 }).toArray();
    
    console.log(`Found ${students.length} students`);
    
    return NextResponse.json({
      success: true,
      data: students,
      count: students.length,
      database: db.databaseName,
      collection: 'students'
    });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}