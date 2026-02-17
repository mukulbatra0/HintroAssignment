import { useState, useRef, useEffect } from 'react';
import { UserPlus, X } from 'lucide-react';
import { createPortal } from 'react-dom';

const UserAssignmentDropdown = ({ task, boardMembers, onAssign, onUnassign }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.right + window.scrollX - 256 // 256px = w-64
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const assignedUserIds = task.assignedTo?.map(user => 
    typeof user === 'object' ? user._id : user
  ) || [];

  const handleAssignUser = (userId) => {
    console.log('🎯 handleAssignUser called with userId:', userId);
    console.log('Current assignedUserIds:', assignedUserIds);
    
    if (assignedUserIds.includes(userId)) {
      console.log('User already assigned, calling onUnassign');
      onUnassign(userId);
    } else {
      console.log('User not assigned, calling onAssign');
      onAssign(userId);
    }
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Get assigned user objects
  const assignedUsers = boardMembers.filter(member => 
    assignedUserIds.includes(member._id)
  );

  return (
    <>
      <div className="flex items-center gap-1">
        {assignedUsers.slice(0, 3).map((user, index) => (
          <div
            key={user._id}
            className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm border border-white"
            title={user.name}
            style={{ marginLeft: index > 0 ? '-8px' : '0', zIndex: 10 - index }}
          >
            {getUserInitials(user.name)}
          </div>
        ))}
        {assignedUsers.length > 3 && (
          <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-white text-xs font-bold shadow-sm">
            +{assignedUsers.length - 3}
          </div>
        )}
        
        {/* Add/Manage Users Button */}
        <button
          ref={buttonRef}
          onClick={(e) => {
            e.stopPropagation();
            console.log('🔍 Assignment button clicked');
            console.log('Current isOpen:', isOpen);
            console.log('Board members:', boardMembers);
            console.log('Assigned users:', assignedUsers);
            setIsOpen(!isOpen);
          }}
          className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
          title="Assign users"
        >
          <UserPlus className="w-3 h-3 text-gray-600" />
        </button>
      </div>

      {/* Dropdown Menu - Rendered via Portal */}
      {isOpen && createPortal(
        <div 
          ref={dropdownRef}
          className="fixed w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-[9999] overflow-hidden"
          style={{ 
            top: `${dropdownPosition.top}px`, 
            left: `${dropdownPosition.left}px` 
          }}
        >
          <div className="p-3 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-teal-50">
            <h3 className="font-semibold text-sm text-gray-800">Assign Members</h3>
            <p className="text-xs text-gray-500 mt-1">Members: {boardMembers.length}</p>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {boardMembers.length === 0 ? (
              <div className="p-4 text-center text-gray-500 text-sm">
                No members available
              </div>
            ) : (
              boardMembers.map((member) => {
                const isAssigned = assignedUserIds.includes(member._id);
                return (
                  <button
                    key={member._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignUser(member._id);
                    }}
                    className="w-full px-3 py-2 hover:bg-gray-50 flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                        {getUserInitials(member.name)}
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-medium text-gray-800">
                          {member.name}
                        </div>
                        <div className="text-xs text-gray-500">{member.email}</div>
                      </div>
                    </div>
                    {isAssigned && (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <X className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default UserAssignmentDropdown;
