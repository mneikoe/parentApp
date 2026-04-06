export const mockParent = {
  name: 'Vikram Sharma',
  email: 'vikram.sharma@example.com',
  mobile: '+91 98765 43210',
}

export const mockChild = {
  name: 'Aarav Sharma',
  className: 'Class 6',
  section: 'A',
  bus: 'Bus 3 (Route North)',
  attendancePct: 94,
}

export const mockDashboard = {
  greeting: 'Good Morning, Parent',
  sosActive: true,
  quickStats: {
    attendanceToday: 'Present',
    feesDue: '₹ 12,500',
    homeworkPending: '2 items',
  },
  notifications: [
    { id: 'n1', title: 'Homework submitted by 6-A', time: 'Today · 09:10 AM', tone: 'success' },
    { id: 'n2', title: 'Fees reminder: Due next week', time: 'Today · 08:20 AM', tone: 'warning' },
    { id: 'n3', title: 'PTM scheduled for Class 6', time: 'Yesterday · 05:45 PM', tone: 'default' },
  ],
}

export const mockAttendance = {
  calendar: {
    monthLabel: 'March 2026',
    days: [1, 2, 3, 4, 5, 6, 7],
  },
  items: [
    { id: 'a1', date: '2026-03-14', status: 'Present', detail: 'Checked in via RFID at 08:02' },
    { id: 'a2', date: '2026-03-13', status: 'Late', detail: 'Late arrival (08:18)' },
    { id: 'a3', date: '2026-03-12', status: 'Absent', detail: 'No RFID scan logged' },
  ],
}

export const mockFees = {
  totals: {
    totalDue: 12500,
    paid: 8000,
  },
  history: [
    { id: 'f1', date: '2026-02-10', label: 'Payment received', credit: 8000, debit: 0 },
    { id: 'f2', date: '2026-02-01', label: 'Tuition fee', credit: 0, debit: 12500 },
  ],
}

export const mockChat = {
  threads: [
    { id: 'c1', parent: 'Vikram Sharma', student: 'Aarav Sharma', lastMsg: 'Thank you for the update.', time: '10:30', unread: 0 },
    { id: 'c2', parent: 'Lakshmi Nair', student: 'Priya Nair', lastMsg: 'When are the PTM slots confirmed?', time: '09:15', unread: 2 },
  ],
  messages: {
    c1: [
      { id: 'm1', who: 'parent', text: 'Could you share the revision plan for next week?', time: '09:55' },
      { id: 'm2', who: 'teacher', text: 'Sure. I’ll share a short day-wise plan by today 5 PM.', time: '10:02' },
      { id: 'm3', who: 'parent', text: 'Thank you!', time: '10:08' },
    ],
    c2: [
      { id: 'm4', who: 'parent', text: 'PTM slot confirmation please.', time: '09:05' },
      { id: 'm5', who: 'teacher', text: 'Confirmation will be sent via message. Please check today.', time: '09:25' },
    ],
  },
}

export const mockSos = {
  status: 'Active — Safety verification in progress',
  instructions: [
    'Stay calm and move to a safe, well-lit area.',
    'Keep your phone available for updates.',
    'If needed, share the nearest landmark with the school.',
  ],
}

