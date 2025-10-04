import { Capacitor } from '@capacitor/core';
// @ts-ignore
import { LocalNotifications } from '@capacitor/local-notifications';

import React, { useState, useEffect } from 'react';

interface StudySession {
  id: string;
  subject: string;
  startDate: string;
  startTime: string;
  endTime: string;
}

const LOCAL_KEY = 'vacationStudySessions';

const VacationStudyPlanner: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const saved = localStorage.getItem('vacationStudyNotifications');
    return saved === 'true';
  });
  // Request notification permission on enable
  useEffect(() => {
    if (notificationsEnabled && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [notificationsEnabled]);

  function handleNotificationToggle() {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    localStorage.setItem('vacationStudyNotifications', newValue.toString());
  }
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [form, setForm] = useState({
    subject: '',
    startDate: '',
    startTime: '',
    endTime: '',
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (saved) setSessions(JSON.parse(saved));
  }, []);

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addSession(e: React.FormEvent) {
    // Unified notification logic for web and Capacitor
    const start = new Date(form.startDate + 'T' + form.startTime);
    const now = new Date();
    const delay = start.getTime() - now.getTime();
    if (delay > 0) {
      if (Capacitor.isNativePlatform()) {
        // Capacitor Local Notification
        LocalNotifications.requestPermissions().then(() => {
          LocalNotifications.schedule({
            notifications: [
              {
                title: 'Study Reminder',
                body: `Time to study: ${form.subject} (${form.startTime} - ${form.endTime})`,
                id: Date.now(),
                schedule: { at: start },
                sound: undefined,
                attachments: undefined,
                actionTypeId: '',
                extra: null
              }
            ]
          });
        });
      } else if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification('Study Reminder', {
            body: `Time to study: ${form.subject} (${form.startTime} - ${form.endTime})`,
            icon: '/logo.png',
          });
        }, delay);
      }
    }
    e.preventDefault();
    if (!form.subject || !form.startDate || !form.startTime || !form.endTime) return;
    const newSession: StudySession = {
      id: Date.now().toString(),
      ...form,
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
    setForm({ subject: '', startDate: '', startTime: '', endTime: '' });
    setShowModal(false);
  }

  function deleteSession(id: string) {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(updated));
  }

  return (
    <div className="max-w-xl mx-auto mt-8 p-4 bg-white dark:bg-gray-900 rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-4 text-blue-700 dark:text-blue-200 text-center">Vacation Study Planner</h1>

      <p className="mb-2 text-gray-600 dark:text-gray-300">Add your study sessions for the vacation.</p>

      {/* Add Session Modal Trigger */}
      <button
        className="w-full py-2 rounded bg-blue-600 text-white font-bold mb-4"
        onClick={() => setShowModal(true)}
      >
        Add Study Session
      </button>

      {/* Modal Popup for Add Session */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 max-w-md w-full relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-3 right-4 text-2xl text-gray-500 hover:text-gray-900 dark:hover:text-white font-bold"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700 dark:text-blue-200">Add Study Session</h2>
            <form className="grid gap-3" onSubmit={addSession}>
              <input
                name="subject"
                type="text"
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                value={form.subject}
                onChange={handleFormChange}
                placeholder="Subject name to study"
                required
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs mb-1">Start Date</label>
                  <input name="startDate" type="date" className="w-full p-2 rounded border" value={form.startDate} onChange={handleFormChange} required />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block text-xs mb-1">Start Time</label>
                  <input name="startTime" type="time" className="w-full p-2 rounded border" value={form.startTime} onChange={handleFormChange} required />
                </div>
                <div className="flex-1">
                  <label className="block text-xs mb-1">End Time</label>
                  <input name="endTime" type="time" className="w-full p-2 rounded border" value={form.endTime} onChange={handleFormChange} required />
                </div>
              </div>
              <button type="submit" className="w-full py-2 rounded bg-blue-600 text-white font-bold mt-2">Save Session</button>
            </form>
          </div>
        </div>
      )}

      {/* Calendar-style List */}
  <div className="mb-2 text-lg font-semibold text-blue-700 dark:text-blue-200 text-center">Your Study Sessions</div>
      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10">
          <div className="text-6xl mb-2">😭</div>
          <div className="text-base font-semibold text-gray-500 dark:text-gray-400 mb-1">No study sessions yet!</div>
          <div className="text-xs text-gray-400">Tap "Add Study Session" to start planning your vacation studies.</div>
        </div>
      ) : (
        <div className="grid gap-3">
          {sessions.map(session => (
            <div key={session.id} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <div className="font-bold text-blue-900 dark:text-blue-100">{session.subject}</div>
                <div className="text-xs text-gray-500">
                  {(() => {
                    const d = new Date(session.startDate + 'T' + session.startTime);
                    const dayStr = d.toLocaleDateString(undefined, { weekday: 'short' });
                    const dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                    const today = new Date();
                    const isToday = d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
                    return (
                      <>
                        {dayStr}, {dateStr}
                        {isToday && <span className="text-green-600 font-bold"> TODAY </span>} 
                        {(() => {
                          const start = new Date(session.startDate + 'T' + session.startTime);
                          const end = new Date(session.startDate + 'T' + session.endTime);
                          const startStr = start.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
                          const endStr = end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
                          return `${startStr} - ${endStr}`;
                        })()}
                      </>
                    );
                  })()}
                </div>
              </div>
              <button
                className="mt-2 md:mt-0 px-3 py-1 rounded bg-red-500 text-white text-xs font-semibold"
                onClick={() => deleteSession(session.id)}
              >Delete</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VacationStudyPlanner;
