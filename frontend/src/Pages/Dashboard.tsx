import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import mockData from '../mock-data.json';
import allocationsData from '../allocations.json';
import adminData from '../admin-data.json';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import SessionCard from '../components/SessionCard';

export type Department = 'Division A' | 'Division B' | 'Division C';
export type SessionId = 'Morning' | 'Midday' | 'Afternoon';

export const DEPT_LIMITS: Record<Department, number> = {
  'Division A': 8,
  'Division B': 6,
  'Division C': 6,
};

export const TOTAL_CAPACITY_PER_SESSION = 20;

export interface Session {
  id: SessionId;
  time: string;
  allocated: Record<Department, number>;
  participants: string[];
}

// 1. IMPORT MOCK USERS
interface User {
  id: string;
  name: string;
  division: Department;
}

const MOCK_USERS: User[] = mockData as User[];

// 2. IMPORT PRE-ASSIGNED SESSIONS
const initialSessions: Session[] = allocationsData as Session[];

// 3. TRACK WHICH USERS ARE ALREADY ASSIGNED
const initialAssigned = new Set<string>();
initialSessions.forEach(session => {
  session.participants.forEach(p => initialAssigned.add(p.toLowerCase()));
});

const Dashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [adminDept, setAdminDept] = useState<Department>('Division A');
  const [adminName, setAdminName] = useState<string>('Loading...');
  const [selectedSession, setSelectedSession] = useState<SessionId>('Afternoon'); // Default to Afternoon since Morning is full
  const [participantName, setParticipantName] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' | null }>({ message: '', type: null });

  // Mock assigned participants to prevent duplicate assignments
  const [assignedParticipants, setAssignedParticipants] = useState<Set<string>>(initialAssigned);

  // Track logged in user and assign their division
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        const currentAdmin = adminData.find(a => a.email.toLowerCase() === user.email?.toLowerCase());
        if (currentAdmin) {
          setAdminDept(currentAdmin.division as Department);
          setAdminName(currentAdmin.name);
        } else {
          setAdminDept('Division A'); // Fallback for unknown emails
          setAdminName(user.email);
        }
      } else {
        navigate('/'); // Redirect to login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Clear selections when switching admin roles
  useEffect(() => {
    setParticipantName('');
    setFeedback({ message: '', type: null });
  }, [adminDept]);

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ message: '', type: null });

    if (!participantName.trim()) {
      setFeedback({ message: 'Please select a participant.', type: 'error' });
      return;
    }

    const nameKey = participantName.trim().toLowerCase();

    // Rule 2: A participant can only be assigned to one session
    if (assignedParticipants.has(nameKey)) {
      setFeedback({ message: `Participant "${participantName}" is already assigned to a session.`, type: 'error' });
      return;
    }

    const sessionIndex = sessions.findIndex((s) => s.id === selectedSession);
    const session = sessions[sessionIndex];

    const currentTotalInSession = Object.values(session.allocated).reduce((a, b) => a + b, 0);
    const currentDeptCount = session.allocated[adminDept];

    // Rule 1: Maximum 20 participants per session
    if (currentTotalInSession >= TOTAL_CAPACITY_PER_SESSION) {
      setFeedback({ message: `The ${selectedSession} session is completely full!`, type: 'error' });
      return;
    }

    // Rule 3: Departments cannot exceed their per-session allocation
    if (currentDeptCount >= DEPT_LIMITS[adminDept]) {
      setFeedback({ message: `${adminDept} has reached its limit of ${DEPT_LIMITS[adminDept]} for the ${selectedSession} session.`, type: 'error' });
      return;
    }

    // If valid, apply allocation
    const updatedSessions = [...sessions];
    updatedSessions[sessionIndex].allocated[adminDept] += 1;
    updatedSessions[sessionIndex].participants.push(participantName);
    
    setSessions(updatedSessions);
    setAssignedParticipants(new Set(assignedParticipants).add(nameKey));
    setFeedback({ message: `Successfully assigned ${participantName} to ${selectedSession}.`, type: 'success' });
    setParticipantName('');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-green-900 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-wider">SMART SEAT ALLOCATOR</h1>
          <p className="text-sm text-green-300">Training Session Management</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 mr-2 text-right">
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white">{adminName}</span>
              <span className="text-xs text-green-300">{adminDept} Admin</span>
            </div>
          </div>
          <button 
            onClick={() => signOut(auth).then(() => navigate('/'))}
            className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded-lg text-sm font-semibold transition"
          >
            Log Out
          </button>
        </div>
      </header>

      <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Session Overviews */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-gray-800 border-b border-gray-300 pb-2">Session Capacity Overview</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} adminDept={adminDept} />
            ))}
          </div>
        </div>

        {/* Right Side: Allocation Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Assign Participant</h2>
            
            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Select Participant</label>
                <select 
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white cursor-pointer"
                >
                  <option value="">-- Choose Employee --</option>
                  {MOCK_USERS.filter(u => u.division === adminDept).map((u) => {
                    const isAssigned = assignedParticipants.has(u.name.toLowerCase());
                    return (
                      <option key={u.id} value={u.name} disabled={isAssigned}>
                        {u.name} {isAssigned ? '(Assigned)' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed">
                  {adminDept} (Max {DEPT_LIMITS[adminDept]}/session)
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Session</label>
                <select 
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value as SessionId)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                >
                  <option value="Morning">Morning (09:00 - 10:30)</option>
                  <option value="Midday">Midday (11:00 - 12:30)</option>
                  <option value="Afternoon">Afternoon (13:00 - 14:30)</option>
                </select>
              </div>

              <button 
                type="submit"
                className="w-full bg-green-700 hover:bg-green-800 text-white font-bold py-2.5 rounded-lg shadow transition mt-2"
              >
                Assign Seat
              </button>
            </form>

            {/* Feedback / Validation Messages */}
            {feedback.message && (
              <div className={`mt-4 p-3 rounded-lg text-sm font-medium flex items-start gap-2 ${feedback.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                {feedback.type === 'error' ? (
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                ) : (
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                )}
                {feedback.message}
              </div>
            )}
          </div>

          {/* Your Employees Roster List */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 flex flex-col" style={{ maxHeight: '400px' }}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-800">Your Employees</h2>
              <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full">
                {MOCK_USERS.filter(u => u.division === adminDept).length} Total
              </span>
            </div>
            <div className="overflow-y-auto space-y-2 pr-2">
              {MOCK_USERS.filter(u => u.division === adminDept).map(u => {
                const isAssigned = assignedParticipants.has(u.name.toLowerCase());
                return (
                  <div key={u.id} className="flex justify-between items-center p-2 bg-gray-50 rounded border border-gray-100 text-sm">
                    <span className="font-medium text-gray-700">{u.name}</span>
                    {isAssigned ? (
                      <span className="text-xs text-green-700 font-semibold px-2 py-0.5 bg-green-100 rounded-full">Assigned</span>
                    ) : (
                      <span className="text-xs text-gray-500 font-medium px-2 py-0.5 bg-gray-200 rounded-full">Unassigned</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm text-sm text-blue-900">
            <h3 className="font-bold flex items-center gap-2 mb-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" /></svg>
              System Rules Enforced
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Max 20 participants per session.</li>
              <li>Participants cannot be assigned twice.</li>
              <li>Divisions cannot exceed allocation limits.</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
