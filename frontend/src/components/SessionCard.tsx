import React from 'react';
import { type Session, type Department, DEPT_LIMITS, TOTAL_CAPACITY_PER_SESSION } from '../Pages/Dashboard';

interface SessionCardProps {
  session: Session;
  adminDept: Department;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, adminDept }) => {
  const totalAllocated = Object.values(session.allocated).reduce((a, b) => a + b, 0);
  const remaining = TOTAL_CAPACITY_PER_SESSION - totalAllocated;
  const isFull = remaining === 0;

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col">
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
        <span className="text-sm font-medium text-gray-700">
          {remaining} seats remaining
        </span>
      </div>

      {/* Enrolled Participants List */}
      <div className="bg-gray-50 p-4 border-t border-gray-200">
        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Assigned Participants</h4>
        <div className="max-h-32 overflow-y-auto space-y-1 pr-2">
          {session.participants.length > 0 ? (
            session.participants.map((p, idx) => (
              <div key={idx} className="text-sm text-gray-700 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm truncate">
                {p}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-400 italic">No participants yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SessionCard;