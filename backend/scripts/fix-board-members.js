import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Define Board schema inline (same as in models/Board.js)
const boardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    backgroundColor: {
      type: String,
      default: '#0284c7',
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const fixBoards = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Register the Board model
    const Board = mongoose.model('Board', boardSchema);
    
    // Find all boards
    const boards = await Board.find({});
    console.log(`Found ${boards.length} board(s) to check\n`);
    
    let fixedCount = 0;
    
    for (const board of boards) {
      const ownerIdStr = board.owner.toString();
      const isOwnerInMembers = board.members.some(
        (memberId) => memberId.toString() === ownerIdStr
      );
      
      if (!isOwnerInMembers) {
        console.log(`  📝 Fixing board "${board.title}" - adding owner to members`);
        board.members.push(board.owner);
        await board.save();
        fixedCount++;
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} board(s)`);
    console.log(`✅ ${boards.length - fixedCount} board(s) were already correct`);
    
    await mongoose.disconnect();
    console.log('\n✅ Done! You can now access all boards.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixBoards();
