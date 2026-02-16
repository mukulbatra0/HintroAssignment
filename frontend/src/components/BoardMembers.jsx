import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addBoardMember, removeBoardMember } from '../store/boardSlice';
import { addToast } from '../store/toastSlice';
import { UserPlus, X, Mail, Crown } from 'lucide-react';

const BoardMembers = ({ board }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [showAddModal, setShowAddModal] = useState(false);
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);

  const isOwner = board?.owner?._id === user?._id;

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setAdding(true);
    const result = await dispatch(addBoardMember({ boardId: board._id, email }));
    setAdding(false);

    if (!result.error) {
      dispatch(addToast({ message: 'Member added successfully!', type: 'success' }));
      setEmail('');
      setShowAddModal(false);
    } else {
      dispatch(addToast({ 
        message: result.error.message || 'Failed to add member', 
        type: 'error' 
      }));
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      const result = await dispatch(removeBoardMember({ boardId: board._id, userId: memberId }));
      
      if (!result.error) {
        dispatch(addToast({ message: 'Member removed successfully!', type: 'success' }));
      } else {
        dispatch(addToast({ message: 'Failed to remove member', type: 'error' }));
      }
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Member Avatars */}
        <div className="flex -space-x-2">
          {board?.members?.slice(0, 5).map((member) => (
            <div
              key={member._id}
              className="relative group"
              title={member.name}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium border-2 border-white">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                {member.name}
                {member._id === board.owner._id && (
                  <Crown className="inline w-3 h-3 ml-1 text-yellow-400" />
                )}
              </div>
            </div>
          ))}
          {board?.members?.length > 5 && (
            <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-medium border-2 border-white">
              +{board.members.length - 5}
            </div>
          )}
        </div>

        {/* Add Member Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 flex items-center justify-center transition-colors group"
          title="Add member"
        >
          <UserPlus className="w-4 h-4 text-gray-500 group-hover:text-blue-600" />
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-900">Add Member</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Member Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="member@example.com"
                    required
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Enter the email address of the user you want to add to this board.
                </p>
              </div>

              {/* Current Members List */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Members ({board?.members?.length})</h4>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {board?.members?.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 flex items-center">
                            {member.name}
                            {member._id === board.owner._id && (
                              <Crown className="w-3 h-3 ml-1 text-yellow-500" />
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      {isOwner && member._id !== board.owner._id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member._id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEmail('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                  disabled={adding || !email.trim()}
                >
                  {adding ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BoardMembers;
