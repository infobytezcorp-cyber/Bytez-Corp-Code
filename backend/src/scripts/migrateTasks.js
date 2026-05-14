// migrateTasks.js - Migrate taskStatus to status in existing tasks

import mongoose from 'mongoose';
import Task from '../models/Task.js';
import { connectDB } from '../config/db.js';

const migrateTasks = async () => {
  try {
    await connectDB();
    console.log('Connected to DB');

    const tasks = await Task.find({ taskStatus: { $exists: true } });
    console.log(`Found ${tasks.length} tasks with taskStatus`);

    for (const task of tasks) {
      task.status = task.taskStatus;
      await task.save();
      console.log(`Migrated task ${task._id}: ${task.taskStatus} -> ${task.status}`);
    }

    console.log('Migration completed');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
};

migrateTasks();