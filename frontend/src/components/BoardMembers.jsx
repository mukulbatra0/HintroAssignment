import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addBoardMember, removeBoardMember } from '../store/boardSlice';
import { addToast } from '../store/toastSlice';
import { UserPlus, X, Mail, Crown, Trash2 } from 'lucide-react';

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
      <div className="flex items-center space-x-3">
        {/* Member Avatars */}
        <div className="flex -space-x-3">
          {board?.members?.slice(0, 5).map((member) => (
            <div
              key={member._id}
              className="relative group"
              title={member.name}
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold border-3 border-white shadow-lg ring-2 ring-white transition-transform hover:scale-110 hover:z-10 cursor-pointer">
                {member.name?.charAt(0).toUpperCase()}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-gray-900/90 backdrop-blur-sm text-white text-xs rounded-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap pointer-events-none shadow-xl">
                <div className="flex items-center gap-1">
                  {member.name}
                  {member._id === board.owner._id && (
                    <Crown className="w-3 h-3 text-yellow-400" />
                  )}
                </div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                  <div className="w-2 h-2 bg-gray-900/90 rotate-45"></div>
                </div>
              </div>
            </div>
          ))}
          {board?.members?.length > 5 && (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center text-white text-xs font-semibold border-3 border-white shadow-lg ring-2 ring-white">
              +{board.members.length - 5}
            </div>
          )}
        </div>

        {/* Add Member Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border-2 border-dashed border-blue-300 hover:border-blue-500 hover:bg-gradient-to-br hover:from-blue-50 hover:to-teal-50 flex items-center justify-center transition-all shadow-md hover:shadow-lg group"
          title="Add member"
        >
          <UserPlus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
        </button>
      </div>

      {/* Add Member Modal */}
      {showAddModal && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-fade-in">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-lg w-full p-8 animate-scale-in border border-white/50">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-blue-600" />
                Add Member
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 flex items-center justify-center transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMember}>
              {/* Email Input */}
              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  Member Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                    placeholder="member@example.com"
                    required
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500 ml-1">
                  Enter the email address of the user you want to add to this board.
                </p>
              </div>

              {/* Current Members List */}
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center justify-between">
                  <span>Current Members</span>
                  <span className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-teal-100 text-blue-700 text-xs font-bold rounded-full">
                    {board?.members?.length}
                  </span>
                </h4>
                <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-50/50 rounded-2xl p-3">
                  {board?.members?.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                          {member.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 flex items-center gap-1.5">
                            {member.name}
                            {member._id === board.owner._id && (
                              <Crown className="w-3.5 h-3.5 text-yellow-500" />
                            )}
                          </p>
                          <p className="text-xs text-gray-500">{member.email}</p>
                        </div>
                      </div>
                      {isOwner && member._id !== board.owner._id && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(member._id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEmail('');
                  }}
                  className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-full transition-all"
                  disabled={adding}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-teal-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-teal-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={adding || !email.trim()}
                >
                  {adding ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default BoardMembers;
