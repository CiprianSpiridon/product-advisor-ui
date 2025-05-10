import React, { useState } from 'react';

export interface ChildData {
  name: string;
  age: number;
  gender: 'male' | 'female' | '';
  birthday: string;
}

export interface UserData {
  id: string;
  name: string;
  children: ChildData[];
}

interface UserSetupBottomSheetProps {
  isOpen: boolean;
  onComplete: (user: UserData) => void;
}

const generateUserId = (name: string) => {
  const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${slug}-${rand}`;
};

const UserSetupBottomSheet: React.FC<UserSetupBottomSheetProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [hasChildren, setHasChildren] = useState<'yes' | 'no' | ''>('');
  const [children, setChildren] = useState<ChildData[]>([]);
  const [currentChild, setCurrentChild] = useState<ChildData>({ name: '', age: 0, gender: '', birthday: '' });

  // Step 0: Ask for name
  // Step 1: Ask if has children
  // Step 2: Add children (repeatable)
  // Step 3: Confirm

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setStep(1);
  };

  const handleHasChildren = (answer: 'yes' | 'no') => {
    setHasChildren(answer);
    if (answer === 'yes') {
      setStep(2);
    } else {
      setStep(3);
    }
  };

  const handleChildField = (field: keyof ChildData, value: string) => {
    setCurrentChild((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChild.name || !currentChild.gender || !currentChild.birthday) return;
    const age = getAgeFromBirthday(currentChild.birthday);
    setChildren((prev) => [...prev, { ...currentChild, age }]);
    setCurrentChild({ name: '', age: 0, gender: '', birthday: '' });
  };

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

  const handleFinish = () => {
    const user: UserData = {
      id: generateUserId(name),
      name,
      children,
    };
    onComplete(user);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center transition-opacity duration-300 ${
        isOpen ? 'backdrop-blur-sm' : 'pointer-events-none'
      }`}
      style={{ backgroundColor: isOpen ? 'rgba(0,0,0,0.08)' : 'rgba(0,0,0,0)' }}
    >
      <div
        className="bg-white rounded-t-xl w-full max-w-screen-sm max-h-[90vh] overflow-y-auto shadow-xl transform transition-transform duration-300 ease-in-out p-6"
        style={{ transform: isOpen ? 'translateY(0)' : 'translateY(100%)' }}
      >
        {step === 0 && (
          <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-gray-800">Welcome! What&apos;s your name?</h2>
            <input
              type="text"
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition">Continue</button>
          </form>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-gray-800">Do you have children?</h2>
            <div className="flex gap-4">
              <button
                className={`flex-1 rounded px-4 py-2 font-medium border ${hasChildren === 'yes' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                onClick={() => handleHasChildren('yes')}
              >
                Yes
              </button>
              <button
                className={`flex-1 rounded px-4 py-2 font-medium border ${hasChildren === 'no' ? 'bg-blue-600 text-white' : 'bg-white text-blue-600 border-blue-600'}`}
                onClick={() => handleHasChildren('no')}
              >
                No
              </button>
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-gray-800">Add your child&apos;s details</h2>
            <form onSubmit={handleAddChild} className="flex flex-col gap-3">
              <label className="text-sm text-gray-600 font-medium" htmlFor="child-name">Name</label>
              <input
                id="child-name"
                type="text"
                className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                value={currentChild.name}
                onChange={e => handleChildField('name', e.target.value)}
                required
              />
              <label className="text-sm text-gray-600 font-medium" htmlFor="child-birthday">Date of Birth</label>
              <input
                id="child-birthday"
                type="date"
                className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                value={currentChild.birthday}
                onChange={e => handleChildField('birthday', e.target.value)}
                required
              />
              <label className="text-sm text-gray-600 font-medium" htmlFor="child-gender">Gender</label>
              <select
                id="child-gender"
                className="border border-gray-300 rounded px-3 py-2 text-gray-800"
                value={currentChild.gender}
                onChange={e => handleChildField('gender', e.target.value)}
                required
              >
                <option value="" disabled className="text-gray-400">Select gender...</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition">Add Child</button>
            </form>
            {children.length > 0 && (
              <div>
                <h3 className="font-medium text-gray-700 mb-2">Children:</h3>
                <ul className="space-y-1">
                  {children.map((child, idx) => (
                    <li key={idx} className="text-gray-700 text-sm">{child.name} ({child.gender}, {child.age} yrs, {child.birthday})</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button
                className="bg-gray-200 text-gray-700 rounded px-4 py-2 font-medium hover:bg-gray-300 transition flex-1"
                onClick={() => setStep(3)}
                disabled={children.length === 0}
              >
                Done Adding
              </button>
              <button
                className="bg-gray-100 text-gray-500 rounded px-4 py-2 font-medium hover:bg-gray-200 transition flex-1"
                onClick={() => setStep(1)}
              >
                Back
              </button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-xl font-semibold text-gray-800">Confirm your details</h2>
            <div className="bg-gray-50 rounded p-4">
              <div className="mb-2 text-gray-800"><span className="font-medium">Name:</span> {name}</div>
              <div className="mb-2 text-gray-800"><span className="font-medium">Children:</span> {children.length > 0 ? (
                <ul className="list-disc pl-5">
                  {children.map((child, idx) => (
                    <li key={idx} className="text-gray-700">{child.name} ({child.gender}, {child.age} yrs, {child.birthday})</li>
                  ))}
                </ul>
              ) : <span className="text-gray-700">None</span>}
              </div>
            </div>
            <button
              className="bg-blue-600 text-white rounded px-4 py-2 font-medium hover:bg-blue-700 transition"
              onClick={handleFinish}
            >
              Start Chat
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSetupBottomSheet; 