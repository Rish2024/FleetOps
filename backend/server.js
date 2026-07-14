import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Mock Predefined Accounts
const USERS = [
  { email: 'admin@fleetops.com', password: 'admin123', role: 'Admin' },
  { email: 'manager@fleetops.com', password: 'manager123', role: 'FleetManager' },
  { email: 'driver@fleetops.com', password: 'driver123', role: 'Driver' }
];

// Mock Shift Logs and Maintenance Records
const MOCK_REPORT_DATA = [
  { date: new Date(), vehId: 'VAN-101', driver: 'Alex Rivera', status: 'En Route', shift: '08:00 UTC', hours: '4.5', note: 'Sector 4 delivery completed' },
  { date: new Date(), vehId: 'VAN-102', driver: 'Samantha Smith', status: 'En Route', shift: '08:15 UTC', hours: '4.2', note: 'North Hub route active' },
  { date: new Date(), vehId: 'VAN-104', driver: 'David Kim', status: 'Maintenance', shift: '07:15 UTC', hours: '2.0', note: 'Flat right tire' },
  { date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), vehId: 'VAN-103', driver: 'Marcus Chen', status: 'Idle', shift: 'Not Started', hours: '0.0', note: 'Base Depot' },
  { date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), vehId: 'VAN-101', driver: 'Alex Rivera', status: 'En Route', shift: '08:00 UTC', hours: '7.5', note: 'Route 66 delivery' },
  { date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), vehId: 'VAN-105', driver: 'Sarah Jenkins', status: 'Idle', shift: '10:00 UTC', hours: '6.0', note: 'Depot B' },
  { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), vehId: 'VAN-102', driver: 'Samantha Smith', status: 'Idle', shift: '08:15 UTC', hours: '8.0', note: 'Completed shift' },
  { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), vehId: 'VAN-104', driver: 'David Kim', status: 'Maintenance', shift: '07:00 UTC', hours: '4.0', note: 'Oil change service' }
];

// Mock Authorization Middleware
function verifyRole(allowedRoles) {
  return (req, res, next) => {
    // Read the mock role sent by the client
    const userRole = req.headers['x-user-role'];
    
    if (!userRole) {
      return res.status(401).json({ message: 'Unauthorized: No operational role provided.' });
    }
    
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Security Guardrail: Access Denied. Role strictly unauthorized for Export Hub operations.' 
      });
    }
    
    next();
  };
}

// Unified Login Route
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password.' });
  }
  
  const user = USERS.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials. Access Denied.' });
  }
  
  // Return the user and their role as a token
  res.json({
    email: user.email,
    role: user.role,
    token: user.role // Using role directly as the simple mock token
  });
});

// CSV Export Route with date range filter and role guardrails
app.get('/api/reports/export-csv', verifyRole(['Admin', 'FleetManager']), (req, res) => {
  const { range } = req.query;
  const now = new Date();
  let filteredData = [];
  
  if (range === 'today') {
    filteredData = MOCK_REPORT_DATA.filter(item => {
      return item.date.toDateString() === now.toDateString();
    });
  } else if (range === 'last_30_days') {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    filteredData = MOCK_REPORT_DATA.filter(item => item.date >= thirtyDaysAgo);
  } else {
    // Default to 'current_week' (last 7 days)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filteredData = MOCK_REPORT_DATA.filter(item => item.date >= oneWeekAgo);
  }
  
  // Build CSV content
  let csv = 'VEH ID,ASSIGNED DRIVER,STATUS,SHIFT (UTC),HOURS WORKED,NOTES,DATE\n';
  filteredData.forEach(item => {
    const formattedDate = item.date.toISOString().split('T')[0];
    csv += `"${item.vehId}","${item.driver}","${item.status}","${item.shift}","${item.hours}","${item.note.replace(/"/g, '""')}","${formattedDate}"\n`;
  });
  
  // Set headers for automatic browser download
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="fleet-report.csv"');
  res.status(200).send(csv);
});

// API Base Route
app.get('/', (req, res) => {
  res.json({ message: 'FleetOps REST API is running.' });
});

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    uptime: process.uptime()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

