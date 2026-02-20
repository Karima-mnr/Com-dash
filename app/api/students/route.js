import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await connectDB();
    console.log('Connected to MongoDB, fetching students...');
    
    const students = await Student.find({}).sort({ registeredAt: -1 });
    console.log(`Found ${students.length} students`);
    
    return NextResponse.json({ 
      success: true, 
      data: students,
      count: students.length 
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}