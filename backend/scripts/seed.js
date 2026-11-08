import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../src/models/user.model.js';
import { Meeting } from '../src/models/meeting.model.js';

const seedData = async () => {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri || mongoUri.includes('<username>')) {
        console.log('[!] MONGO_URI is not set. Seed script requires a valid MongoDB connection string.');
        process.exit(0);
    }

    try {
        await mongoose.connect(mongoUri);
        console.log('[+] Connected to MongoDB for seeding...');

        // Clear existing demo records
        await User.deleteMany({ username: { $in: ['demo', 'sarah', 'alex'] } });
        await Meeting.deleteMany({ meetingCode: { $in: ['demo-team-sync', 'demo-standup'] } });

        const hashedPassword = await bcrypt.hash('password123', 10);

        const demoUser = await User.create({
            name: 'Demo Host',
            username: 'demo',
            email: 'demo@streamly.app',
            password: hashedPassword,
        });

        await Meeting.create({
            meetingCode: 'demo-team-sync',
            title: 'Q4 Product Roadmap Sync',
            description: 'Discussing low-bandwidth mode release and WebRTC reliability optimizations.',
            hostUsername: 'demo',
            hostName: 'Demo Host',
            date: new Date(),
            durationSeconds: 1800,
            transcript: [
                { speaker: 'Demo Host', text: 'Welcome team. Today we finalized our zero-friction guest join flow.' },
                { speaker: 'Sarah', text: 'We decided to ship the adaptive 360p low-bandwidth mode to production.' },
                { speaker: 'Alex', text: 'I will write the deployment documentation and Docker Compose setup by Friday.' },
            ],
            summary: {
                overview: 'The team reviewed the guest join workflow and finalized low-bandwidth deployment plans.',
                keyDecisions: ['Agreed to ship adaptive 360p low-bandwidth mode to production.'],
                actionItems: [{ task: 'Write deployment documentation and Docker Compose setup by Friday', owner: 'Alex' }],
            },
            notes: '# Product Roadmap Sync Notes\n\n- Low-bandwidth mode reduces dropped connections on cellular by 60%.\n- Zero-friction guest link works without registration.',
        });

        console.log('[+] Demo data successfully seeded! (Username: demo / Password: password123)');
        process.exit(0);
    } catch (err) {
        console.error('[-] Seeding error:', err.message);
        process.exit(1);
    }
};

seedData();

