import React, { useState } from 'react';
import {
  Bell,
  Briefcase,
  CheckCircle2,
  Calendar,
  AlertCircle,
  FileCheck,
  ChevronRight,
  Filter
} from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onNotificationClick: (notif: NotificationItem) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onNotificationClick,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredNotifs = notifications.filter(
    (n) => filterType === 'all' || n.type === filterType
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
              <Bell className="w-5 h-5 text-sky-600" />
              <span>Official Exam Notifications & Live Updates</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time notices on advertisement releases, CBT hall tickets, answer keys, and syllabus changes.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              aria-label="Filter notifications by type"
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-700 font-medium"
            >
              <option value="all">All Notification Types</option>
              <option value="recruitment">Recruitments</option>
              <option value="test_series">Test Series</option>
              <option value="system">Announcements</option>
            </select>

            <button
              onClick={onMarkAllAsRead}
              className="px-3 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
            >
              Mark All Read
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifs.map((notif) => (
          <div
            key={notif.id}
            onClick={() => onNotificationClick(notif)}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-4 ${
              !notif.read
                ? 'bg-sky-50/40 border-sky-300'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  notif.type === 'recruitment'
                    ? 'bg-emerald-50 text-emerald-600'
                    : notif.type === 'test_series'
                    ? 'bg-sky-50 text-sky-600'
                    : 'bg-amber-50 text-amber-600'
                }`}
              >
                {notif.type === 'recruitment' ? (
                  <Briefcase className="w-5 h-5" />
                ) : notif.type === 'test_series' ? (
                  <FileCheck className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-bold text-slate-900 text-sm">{notif.title}</h3>
                  {!notif.read && (
                    <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>
                <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono pt-1">
                  <span>{notif.date}</span>
                  <span>•</span>
                  <span className="capitalize">{notif.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0 self-center" />
          </div>
        ))}
      </div>
    </div>
  );
};
