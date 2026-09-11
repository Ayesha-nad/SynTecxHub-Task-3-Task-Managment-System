import User from '../models/User.js';
import Task from '../models/Task.js';

/**
 * Seed default demo account and sample sticky notes for instant exploration
 */
export const seedDemoData = async () => {
  try {
    const demoEmail = 'demo@corkboard.app';
    const existingDemo = await User.findOne({ email: demoEmail });

    let demoUser = existingDemo;
    if (!existingDemo) {
      console.log('🌱 Seeding demo user account (demo@corkboard.app)...');
      demoUser = await User.create({
        name: 'Alex Morgan',
        email: demoEmail,
        password: 'DemoPass123!',
        avatarColor: '#f5e07a',
      });
      console.log('✅ Demo user account created successfully!');
    }

    // Check if tasks already exist for this user
    const existingTasks = await Task.countDocuments({ userId: demoUser._id });
    if (existingTasks === 0) {
      console.log('📌 Seeding starter sticky notes for demo user...');

      const now = new Date();
      const pastDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago (overdue)
      const futureDate1 = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days ahead
      const futureDate2 = new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000); // 6 days ahead

      const sampleNotes = [
        {
          title: 'Review Q4 design roadmap',
          description: 'Finalize tactile corkboard components, drop shadows, and pushpin physics for production release.',
          dueDate: pastDate,
          priority: 'high',
          status: 'todo',
          tags: ['design', 'roadmap', 'urgent'],
          color: '#f39a8a', // Coral pink
          pinStyle: 'red-pin',
          rotation: -2.5,
          userId: demoUser._id,
        },
        {
          title: 'Draft weekly client summary',
          description: 'Summarize completed sprint tasks and send progress notes to the team.',
          dueDate: futureDate1,
          priority: 'normal',
          status: 'todo',
          tags: ['client', 'summary'],
          color: '#f5e07a', // Yellow
          pinStyle: 'brass-pin',
          rotation: 1.8,
          userId: demoUser._id,
        },
        {
          title: 'Implement JWT authentication & rate limiters',
          description: 'Attach Authorization: Bearer token to all task requests and handle 401 auto logout.',
          dueDate: futureDate2,
          priority: 'normal',
          status: 'in-progress',
          tags: ['backend', 'security', 'api'],
          color: '#a9cce8', // Sky blue
          pinStyle: 'washi-tape',
          rotation: -1.2,
          userId: demoUser._id,
        },
        {
          title: 'Build torn-paper confirmation modal',
          description: 'Style "Pull the pin?" popup with realistic jagged sawtooth edges and tactile buttons.',
          dueDate: null,
          priority: 'low',
          status: 'done',
          tags: ['ui', 'modal'],
          color: '#a8d8b9', // Mint green
          pinStyle: 'teal-pin',
          rotation: 2.1,
          userId: demoUser._id,
        },
        {
          title: 'Setup MongoDB schemas & Mongoose indexes',
          description: 'Configured User and Task models with compound indexes and validators.',
          dueDate: null,
          priority: 'normal',
          status: 'done',
          tags: ['database', 'mongoose'],
          color: '#a8d8b9', // Mint green
          pinStyle: 'wood-pin',
          rotation: -0.8,
          userId: demoUser._id,
        },
      ];

      await Task.insertMany(sampleNotes);
      console.log(`✅ Seeded ${sampleNotes.length} starter sticky notes!`);
    }
  } catch (err) {
    console.warn('⚠️ Demo seeding skipped or encountered error:', err.message);
  }
};
