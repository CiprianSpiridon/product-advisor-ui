'use client';

import React, { useState } from 'react';
import { UserData, ChildData } from './UserSetupBottomSheet';

interface UserDetailsSheetProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateUser: (updatedUser: UserData) => void;
}

const UserDetailsSheet: React.FC<UserDetailsSheetProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUpdateUser 
}) => {
  const [addingChild, setAddingChild] = useState(false);
  const [editingChildIdx, setEditingChildIdx] = useState<number | null>(null);

  const [currentChild, setCurrentChild] = useState<ChildData>({ 
    name: '', age: 0, gender: '', birthday: '' 
  });

  // Initialize editing for a child
  const startEditChild = (idx: number) => {
    if (!user) return;
    setCurrentChild({...user.children[idx]});
    setEditingChildIdx(idx);
    setAddingChild(false);
  };

  // Start adding a new child
  const startAddChild = () => {
    setCurrentChild({ name: '', age: 0, gender: '', birthday: '' });
    setAddingChild(true);
    setEditingChildIdx(null);
  };

  // Cancel editing/adding
  const cancelEdit = () => {
    setAddingChild(false);
    setEditingChildIdx(null);
  };

  // Handle child field changes
  const handleChildField = (field: keyof ChildData, value: string) => {
    setCurrentChild((prev: ChildData) => ({ ...prev, [field]: value }));
  };

  // Calculate age from birthday
  const getAgeFromBirthday = (birthday: string) => {
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Save the edited or new child
  const saveChildChanges = () => {
    if (!user) return;
    
    // Validate required fields
    if (!currentChild.name || !currentChild.gender || !currentChild.birthday) {
      return; // Don't save if missing required fields
    }
    
    // Calculate age from birthday
    const childWithAge = {
      ...currentChild,
      age: getAgeFromBirthday(currentChild.birthday)
    };
    
    const updatedChildren = [...user.children];
    
    if (editingChildIdx !== null) {
      // Update existing child
      updatedChildren[editingChildIdx] = childWithAge;
    } else {
      // Add new child
      updatedChildren.push(childWithAge);
    }
    
    // Update user data
    const updatedUser = {
      ...user,
      children: updatedChildren
    };
    
    onUpdateUser(updatedUser);
    cancelEdit();
  };

  // Remove a child
  const removeChild = (idx: number) => {
    if (!user) return;
    
    const updatedChildren = user.children.filter((_, index) => index !== idx);
    const updatedUser = {
      ...user,
      children: updatedChildren
    };
    
    onUpdateUser(updatedUser);
  };

  if (!user) return null;
  
  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${isOpen ? 'backdrop-blur-sm' : 'pointer-events-none'}`}
      style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-xl w-full max-w-screen-sm max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out p-6 pt-8"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">My Details</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4 text-gray-800">
          <div className="mb-2"><span className="font-medium">Name:</span> {user.name}</div>
          <div className="mb-2"><span className="font-medium">User ID:</span> {user.id}</div>
        </div>
        
        <div className="text-gray-800">
          <div className="flex justify-between items-center mb-3">
            <div className="font-medium">Children:</div>
            <button 
              onClick={startAddChild}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
              disabled={addingChild || editingChildIdx !== null}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Child
            </button>
          </div>
          
          {(addingChild || editingChildIdx !== null) && (
            <div className="border border-gray-200 rounded p-4 mb-4 mt-4">
              <h3 className="text-lg font-medium mb-3">{addingChild ? 'Add New Child' : 'Edit Child'}</h3>
              <form className="flex flex-col gap-3">
                <div>
                  <label className="text-sm text-gray-600 font-medium" htmlFor="edit-child-name">Name</label>
                  <input
                    id="edit-child-name"
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mt-1"
                    value={currentChild.name}
                    onChange={e => handleChildField('name', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium" htmlFor="edit-child-birthday">Date of Birth</label>
                  <input
                    id="edit-child-birthday"
                    type="date"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mt-1"
                    value={currentChild.birthday}
                    onChange={e => handleChildField('birthday', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 font-medium" htmlFor="edit-child-gender">Gender</label>
                  <select
                    id="edit-child-gender"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-gray-800 mt-1"
                    value={currentChild.gender}
                    onChange={e => handleChildField('gender', e.target.value)}
                    required
                  >
                    <option value="" disabled>Select gender...</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={saveChildChanges}
                    className="flex-1 bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 bg-gray-200 text-gray-700 rounded px-4 py-2 font-medium hover:bg-gray-300 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
          
          {user.children && user.children.length > 0 ? (
            <ul className="space-y-3">
              {user.children.map((child, idx) => (
                <li key={idx} className="border border-gray-200 rounded p-3 text-gray-800">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-lg">{child.name}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => startEditChild(idx)}
                        className="text-blue-600 p-1 rounded hover:bg-blue-50"
                        aria-label="Edit child"
                        disabled={addingChild || editingChildIdx !== null}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => removeChild(idx)}
                        className="text-red-600 p-1 rounded hover:bg-red-50"
                        aria-label="Remove child"
                        disabled={addingChild || editingChildIdx !== null}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div><span className="font-medium">Gender:</span> {child.gender}</div>
                  <div><span className="font-medium">DOB:</span> {child.birthday}</div>
                  <div><span className="font-medium">Age:</span> {child.age}</div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-800">No children added.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsSheet; 