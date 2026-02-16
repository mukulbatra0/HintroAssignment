import { Board, List, Activity, User } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { ACTIVITY_TYPES } from '../config/constants.js';

/**
 * Board Service
 * Contains business logic for board operations
 */
class BoardService {
  /**
   * Get all boards for a user (owned or member)
   */
  async getUserBoards(userId) {
    const boards = await Board.find({
      $or: [{ owner: userId }, { members: userId }],
      isArchived: false,
    })
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar')
      .sort({ updatedAt: -1 });

    return boards;
  }

  /**
   * Get single board by ID with lists
   */
  async getBoardById(boardId, userId) {
    const board = await Board.findById(boardId)
      .populate('owner', 'name email avatar')
      .populate('members', 'name email avatar');

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    // Debug logging
    console.log('=== Board Access Debug ===');
    console.log('User ID:', userId.toString());
    console.log('Board Owner ID:', board.owner._id.toString());
    console.log('Board Members:', board.members.map(m => m._id.toString()));
    console.log('Has Access Result:', board.hasAccess(userId));
    console.log('========================');

    // Check if user has access
    if (!board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Get lists with tasks
    const lists = await List.find({ board: boardId })
      .sort({ position: 1 })
      .populate({
        path: 'tasks',
        options: { sort: { position: 1 } },
        populate: { path: 'assignedTo', select: 'name email avatar' },
      });

    return { board, lists };
  }

  /**
   * Create a new board
   */
  async createBoard(userId, boardData) {
    const { title, description, backgroundColor } = boardData;

    const board = await Board.create({
      title,
      description,
      backgroundColor,
      owner: userId,
      members: [userId], // Owner is automatically a member
    });

    await board.populate('owner', 'name email avatar');
    await board.populate('members', 'name email avatar');

    // Log activity
    await Activity.createActivity(
      board._id,
      userId,
      ACTIVITY_TYPES.BOARD_CREATED,
      'board',
      board._id,
      { boardTitle: title }
    );

    return board;
  }

  /**
   * Update board
   */
  async updateBoard(boardId, userId, updateData) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    // Only owner can update board details
    if (!board.isOwner(userId)) {
      throw ApiError.forbidden('Only the board owner can update board details');
    }

    const { title, description, backgroundColor } = updateData;

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (backgroundColor !== undefined) board.backgroundColor = backgroundColor;

    await board.save();
    await board.populate('owner', 'name email avatar');
    await board.populate('members', 'name email avatar');

    // Log activity
    await Activity.createActivity(
      board._id,
      userId,
      ACTIVITY_TYPES.BOARD_UPDATED,
      'board',
      board._id,
      { boardTitle: board.title }
    );

    return board;
  }

  /**
   * Delete board (archive)
   */
  async deleteBoard(boardId, userId) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    // Only owner can delete board
    if (!board.isOwner(userId)) {
      throw ApiError.forbidden('Only the board owner can delete the board');
    }

    // Soft delete (archive)
    board.isArchived = true;
    await board.save();

    return board;
  }

  /**
   * Add member to board
   */
  async addMember(boardId, userId, memberEmail) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    // Only owner or existing members can add members
    if (!board.hasAccess(userId)) {
      throw ApiError.forbidden('You do not have access to this board');
    }

    // Find user by email
    const memberToAdd = await User.findOne({ email: memberEmail });

    if (!memberToAdd) {
      throw ApiError.notFound('User with this email not found');
    }

    // Check if already a member
    if (board.members.includes(memberToAdd._id)) {
      throw ApiError.conflict('User is already a member of this board');
    }

    // Add member
    board.members.push(memberToAdd._id);
    await board.save();
    await board.populate('members', 'name email avatar');

    // Log activity
    await Activity.createActivity(
      board._id,
      userId,
      ACTIVITY_TYPES.MEMBER_ADDED,
      'member',
      memberToAdd._id,
      { memberName: memberToAdd.name }
    );

    return board;
  }

  /**
   * Remove member from board
   */
  async removeMember(boardId, userId, memberIdToRemove) {
    const board = await Board.findById(boardId);

    if (!board) {
      throw ApiError.notFound('Board not found');
    }

    // Only owner can remove members
    if (!board.isOwner(userId)) {
      throw ApiError.forbidden('Only the board owner can remove members');
    }

    // Cannot remove owner
    if (board.owner.toString() === memberIdToRemove) {
      throw ApiError.badRequest('Cannot remove the board owner');
    }

    // Check if user is a member
    if (!board.members.includes(memberIdToRemove)) {
      throw ApiError.notFound('User is not a member of this board');
    }

    // Get member info before removing
    const memberToRemove = await User.findById(memberIdToRemove);

    // Remove member
    board.members = board.members.filter(
      (memberId) => memberId.toString() !== memberIdToRemove
    );
    await board.save();
    await board.populate('members', 'name email avatar');

    // Log activity
    if (memberToRemove) {
      await Activity.createActivity(
        board._id,
        userId,
        ACTIVITY_TYPES.MEMBER_REMOVED,
        'member',
        memberIdToRemove,
        { memberName: memberToRemove.name }
      );
    }

    return board;
  }
}

export default new BoardService();
