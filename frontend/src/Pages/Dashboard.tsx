import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

type Department = 'Division A' | 'Division B' | 'Division C';
type SessionId = 'Morning' | 'Midday' | 'Afternoon';

const DEPT_LIMITS: Record<Department, number> = {
  'Division A': 8,
  'Division B': 6,
  'Division C': 6,
};

const TOTAL_CAPACITY_PER_SESSION = 20;

interface Session {
  id: SessionId;
  time: string;
  allocated: Record<Department, number>;
}

const initialSessions: Session[] = [
  { id: 'Morning', time: '09:00 - 10:30', allocated: { 'Division A': 0, 'Division B': 0, 'Division C': 0 } },
  { id: 'Midday', time: '11:00 - 12:30', allocated: { 'Division A': 0, 'Division B': 0, 'Division C': 0 } },
  { id: 'Afternoon', time: '13:00 - 14:30', allocated: { 'Division A': 0, 'Division B': 0, 'Division C': 0 } },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>(initialSessions);
  const [adminDept, setAdminDept] = useState<Department>('Division A');
  const [selectedSession, setSelectedSession] = useState<SessionId>('Morning');
  const [participantName, setParticipantName] = useState('');
  const [feedback, setFeedback] = useState<{ message: string; type: 'error' | 'success' | null }>({ message: '', type: null });

  // Mock assigned participants to prevent duplicate assignments
  const [assignedParticipants, setAssignedParticipants] = useState<Set<string>>(new Set());

  const handleAllocate = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback({ message: '', type: null });

    if (!participantName.trim()) {
      setFeedback({ message: 'Please enter a participant name.', type: 'error' });
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
          <div className="flex items-center gap-2">
            <label className="text-sm text-green-200">Admin Role:</label>
            <select 
              value={adminDept}
              onChange={(e) => setAdminDept(e.target.value as Department)}
              className="bg-green-800 text-white border border-green-700 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="Division A">Division A</option>
              <option value="Division B">Division B</option>
              <option value="Division C">Division C</option>
            </select>
          </div>
          <button 
            onClick={() => navigate('/')}
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
            {sessions.map((session) => {
              const totalAllocated = Object.values(session.allocated).reduce((a, b) => a + b, 0);
              const remaining = TOTAL_CAPACITY_PER_SESSION - totalAllocated;
              const isFull = remaining === 0;

              return (
                <div key={session.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
                  <div className={`p-4 text-white ${isFull ? 'bg-red-800' : 'bg-green-800'}`}>
                    <h3 className="font-bold text-lg">{session.id} Session</h3>
                    <p className="text-sm opacity-90">{session.time}</p>
                  </div>
                  
                  <div className="p-4 flex-grow">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm font-semibold text-gray-600">Total Capacity</span>
                      <span className={`font-bold ${isFull ? 'text-red-600' : 'text-green-700'}`}>
                        {totalAllocated} / {TOTAL_CAPACITY_PER_SESSION}
                      </span>
                    </div>
                    
                    {/* Department Breakdown */}
                    <div className="space-y-3">
                      {[adminDept].map(dept => {
                        const count = session.allocated[dept];
                        const limit = DEPT_LIMITS[dept];
                        const percent = (count / limit) * 100;
                        const isDeptFull = count >= limit;

                        return (
                          <div key={dept}>
                            <div className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                              <span>{dept}</span>
                              <span className={isDeptFull ? 'text-red-500' : ''}>{count} / {limit} max</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${isDeptFull ? 'bg-red-500' : 'bg-green-500'}`} 
                                style={{ width: `${percent}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  
                  <div className="bg-gray-100 p-3 text-center border-t border-gray-200">
                    {/* Rule 4: System should show remaining available seats */}
                    <span className="text-sm font-medium text-gray-700">
                      {remaining} seats remaining
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Allocation Controls */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Assign Participant</h2>
            
            <form onSubmit={handleAllocate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Participant Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. John Doe"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
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
