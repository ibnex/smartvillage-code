
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const connectDB = require('../config/db');
const User = require('../models/User');
const Village = require('../models/Village');
const VillageStatistics = require('../models/VillageStatistics');
const Project = require('../models/Project');
const Complaint = require('../models/Complaint');
const ImportLog = require('../models/ImportLog');

const now = new Date();
const daysAgo = (days, hour = 10, minute = 0) => {
  const date = new Date(now);
  date.setDate(date.getDate() - days);
  date.setHours(hour, minute, 0, 0);
  return date;
};

const year = new Date().getFullYear();

const villageSeeds = [
  {
    name: 'Kallur',
    district: 'Chikkaballapur',
    state: 'Karnataka',
    villageCode: 'KA-KLB-001',
    location: { lat: 13.4355, lng: 77.7283 },
    households: 712,
    areaSqKm: 12.6,
  },
  {
    name: 'Nandipura',
    district: 'Mysuru',
    state: 'Karnataka',
    villageCode: 'KA-MYS-014',
    location: { lat: 12.2958, lng: 76.6394 },
    households: 548,
    areaSqKm: 9.8,
  },
  {
    name: 'Harohalli',
    district: 'Ramanagara',
    state: 'Karnataka',
    villageCode: 'KA-RMN-007',
    location: { lat: 12.6807, lng: 77.4652 },
    households: 864,
    areaSqKm: 15.4,
  },
];

const statisticsSeeds = [
  {
    villageCode: 'KA-KLB-001',
    population: 2845,
    waterCoverage: 78,
    electricityCoverage: 92,
    roadConnectivity: 65,
    sectorMetrics: { agriculture: 65, education: 82, healthcare: 71, sanitation: 88, housing: 60 },
  },
  {
    villageCode: 'KA-MYS-014',
    population: 2210,
    waterCoverage: 71,
    electricityCoverage: 88,
    roadConnectivity: 74,
    sectorMetrics: { agriculture: 72, education: 76, healthcare: 68, sanitation: 80, housing: 65 },
  },
  {
    villageCode: 'KA-RMN-007',
    population: 3512,
    waterCoverage: 84,
    electricityCoverage: 95,
    roadConnectivity: 81,
    sectorMetrics: { agriculture: 78, education: 85, healthcare: 74, sanitation: 90, housing: 72 },
  },
];

const projectSeeds = [

  {
    villageCode: 'KA-KLB-001',
    name: 'Village Road Construction',
    category: 'Infrastructure',
    budget: 2500000,
    progress: 70,
    status: 'Ongoing',
    description: 'Widening and asphalting of the 2.4 km main village road.',
    createdAt: daysAgo(120),
    updatedAt: daysAgo(0, 9, 15),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Primary School Renovation',
    category: 'Education',
    budget: 1250000,
    progress: 45,
    status: 'Ongoing',
    description: 'Classroom repairs, new library shelving and accessible ramp.',
    createdAt: daysAgo(95),
    updatedAt: daysAgo(0, 8, 20),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Water Tank Construction',
    category: 'Water Supply',
    budget: 1800000,
    progress: 100,
    status: 'Completed',
    description: 'New 100 KL overhead tank serving 240 households.',
    createdAt: daysAgo(210),
    updatedAt: daysAgo(1),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Solar Street Lights',
    category: 'Energy',
    budget: 875000,
    progress: 30,
    status: 'Ongoing',
    description: 'Installation of 120 solar LED street lights across five wards.',
    createdAt: daysAgo(80),
    updatedAt: daysAgo(2),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Health Sub-Centre Building',
    category: 'Healthcare',
    budget: 1500000,
    progress: 15,
    status: 'Planned',
    description: 'Design and construction of a new primary health sub-centre.',
    createdAt: daysAgo(30),
    updatedAt: daysAgo(3),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Anganwadi Building',
    category: 'Education',
    budget: 950000,
    progress: 60,
    status: 'Ongoing',
    description: 'Child-friendly anganwadi centre with kitchen and play area.',
    createdAt: daysAgo(110),
    updatedAt: daysAgo(1, 11, 20),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Drainage & Sanitation Upgrade',
    category: 'Sanitation',
    budget: 2200000,
    progress: 85,
    status: 'Ongoing',
    description: 'Covered drainage and soak pits for Wards 2 and 4.',
    createdAt: daysAgo(160),
    updatedAt: daysAgo(4),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Borewell Recharge Project',
    category: 'Water Supply',
    budget: 780000,
    progress: 55,
    status: 'Ongoing',
    description: 'Rainwater harvesting and borewell recharge pits at six locations.',
    createdAt: daysAgo(75),
    updatedAt: daysAgo(6),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Solar Water Pump Installation',
    category: 'Energy',
    budget: 1200000,
    progress: 100,
    status: 'Completed',
    description: 'Solar-powered pumps for the community irrigation network.',
    createdAt: daysAgo(240),
    updatedAt: daysAgo(12),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Toilet Construction Drive',
    category: 'Sanitation',
    budget: 950000,
    progress: 100,
    status: 'Completed',
    description: 'Individual household toilets for 110 eligible families.',
    createdAt: daysAgo(260),
    updatedAt: daysAgo(21),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Panchayat Office Renovation',
    category: 'Infrastructure',
    budget: 2200000,
    progress: 100,
    status: 'Completed',
    description: 'Renovated gram panchayat office with a citizen service counter.',
    createdAt: daysAgo(300),
    updatedAt: daysAgo(40),
  },
  {
    villageCode: 'KA-KLB-001',
    name: 'Village Health Camp',
    category: 'Healthcare',
    budget: 650000,
    progress: 100,
    status: 'Completed',
    description: 'Monthly preventive health camps and screening equipment.',
    createdAt: daysAgo(320),
    updatedAt: daysAgo(75),
  },


  {
    villageCode: 'KA-MYS-014',
    name: 'Lake Restoration Project',
    category: 'Water Supply',
    budget: 1600000,
    progress: 65,
    status: 'Ongoing',
    description: 'Desilting, bund strengthening and catchment plantation.',
    createdAt: daysAgo(140),
    updatedAt: daysAgo(1),
  },
  {
    villageCode: 'KA-MYS-014',
    name: 'Smart Classroom Initiative',
    category: 'Education',
    budget: 800000,
    progress: 100,
    status: 'Completed',
    description: 'Digital boards and laptops for the government high school.',
    createdAt: daysAgo(200),
    updatedAt: daysAgo(16),
  },
  {
    villageCode: 'KA-MYS-014',
    name: 'Cattle Shed Development',
    category: 'Infrastructure',
    budget: 450000,
    progress: 40,
    status: 'Ongoing',
    description: 'Community cattle shed with biogas-linked waste management.',
    createdAt: daysAgo(70),
    updatedAt: daysAgo(5),
  },
  {
    villageCode: 'KA-MYS-014',
    name: 'Solar Pump for Drinking Water',
    category: 'Energy',
    budget: 1100000,
    progress: 100,
    status: 'Completed',
    description: 'Grid-independent solar pump for the north water tank.',
    createdAt: daysAgo(230),
    updatedAt: daysAgo(34),
  },
  {
    villageCode: 'KA-MYS-014',
    name: 'Primary Health Centre Upgrade',
    category: 'Healthcare',
    budget: 1300000,
    progress: 25,
    status: 'Planned',
    description: 'Additional consultation room and maternal care unit.',
    createdAt: daysAgo(24),
    updatedAt: daysAgo(7),
  },


  {
    villageCode: 'KA-RMN-007',
    name: 'Village Market Complex',
    category: 'Infrastructure',
    budget: 3200000,
    progress: 55,
    status: 'Ongoing',
    description: 'Covered market with 40 vendor stalls and waste segregation bays.',
    createdAt: daysAgo(150),
    updatedAt: daysAgo(2),
  },
  {
    villageCode: 'KA-RMN-007',
    name: 'Drinking Water Pipeline',
    category: 'Water Supply',
    budget: 2400000,
    progress: 85,
    status: 'Ongoing',
    description: '6.8 km distribution pipeline connecting three hamlets.',
    createdAt: daysAgo(180),
    updatedAt: daysAgo(3),
  },
  {
    villageCode: 'KA-RMN-007',
    name: 'Community Toilet Complex',
    category: 'Sanitation',
    budget: 1100000,
    progress: 100,
    status: 'Completed',
    description: 'Two community sanitation blocks with laundry facilities.',
    createdAt: daysAgo(260),
    updatedAt: daysAgo(23),
  },
  {
    villageCode: 'KA-RMN-007',
    name: 'Street LED Upgrade',
    category: 'Energy',
    budget: 900000,
    progress: 100,
    status: 'Completed',
    description: 'Retrofit of 180 street lights with energy-efficient LEDs.',
    createdAt: daysAgo(275),
    updatedAt: daysAgo(45),
  },
  {
    villageCode: 'KA-RMN-007',
    name: 'Anganwadi Renovation',
    category: 'Education',
    budget: 700000,
    progress: 0,
    status: 'On Hold',
    description: 'Awaiting revised estimates from the district engineering wing.',
    createdAt: daysAgo(60),
    updatedAt: daysAgo(10),
  },
];

const complaintSeeds = [

  {
    citizenEmail: 'citizen@smartvillage.gov.in',
    title: 'Irregular water supply in Ward 3',
    category: 'Water Supply',
    description: 'Water is supplied only twice a week instead of daily. Several households are affected.',
    status: 'Pending',
    createdAt: daysAgo(1, 10, 24),
    updatedAt: daysAgo(1, 10, 24),
  },
  {
    citizenEmail: 'citizen@smartvillage.gov.in',
    title: 'Potholes on the main market road',
    category: 'Roads',
    description: 'Deep potholes near the vegetable market are causing two-wheeler accidents.',
    status: 'Pending',
    createdAt: daysAgo(2, 9, 5),
    updatedAt: daysAgo(2, 9, 5),
  },
  {
    citizenEmail: 'priya.sharma@example.com',
    title: 'Garbage not collected near the school',
    category: 'Sanitation',
    description: 'Waste bins behind the primary school have not been cleared for four days.',
    status: 'Pending',
    createdAt: daysAgo(0, 8, 40),
    updatedAt: daysAgo(0, 8, 40),
  },
  {
    citizenEmail: 'priya.sharma@example.com',
    title: 'Streetlights not working near school',
    category: 'Electricity',
    description: 'Six streetlights between the school and bus stand are dark after 7 PM.',
    status: 'In Progress',
    createdAt: daysAgo(4, 18, 15),
    updatedAt: daysAgo(2, 11, 30),
    resolutionNote: 'Lineman has inspected the feeder line; replacement lamps are being arranged.',
  },
  {
    citizenEmail: 'arjun.rao@example.com',
    title: 'Low water pressure in Ward 5',
    category: 'Water Supply',
    description: 'Upper-floor households receive very little water during the morning slot.',
    status: 'In Progress',
    createdAt: daysAgo(6, 7, 45),
    updatedAt: daysAgo(3, 16, 10),
    resolutionNote: 'Pressure test completed. A new valve is scheduled for installation.',
  },
  {
    citizenEmail: 'lakshmi.devi@example.com',
    title: 'Drainage overflow during rain',
    category: 'Sanitation',
    description: 'The open drain on 4th cross overflows into the street every time it rains.',
    status: 'In Progress',
    createdAt: daysAgo(8, 12, 0),
    updatedAt: daysAgo(4, 9, 20),
    resolutionNote: 'Drainage upgrade work is underway under the sanitation project.',
  },
  {
    citizenEmail: 'citizen@smartvillage.gov.in',
    title: 'Broken culvert on village link road',
    category: 'Roads',
    description: 'The culvert near the canal has cracked and needs urgent repair.',
    status: 'In Progress',
    createdAt: daysAgo(10, 14, 20),
    updatedAt: daysAgo(5, 10, 0),
    resolutionNote: 'Temporary barricades placed. Engineering estimate requested.',
  },
  {
    citizenEmail: 'priya.sharma@example.com',
    title: 'Delay in ration card renewal',
    category: 'Other',
    description: 'Renewal application submitted three weeks ago has not been processed.',
    status: 'In Progress',
    createdAt: daysAgo(12, 11, 5),
    updatedAt: daysAgo(6, 15, 40),
    resolutionNote: 'Application forwarded to the taluk supply office for verification.',
  },
  {
    citizenEmail: 'arjun.rao@example.com',
    title: 'Transformer repair request',
    category: 'Electricity',
    description: 'Frequent voltage fluctuations are damaging appliances in Ward 1.',
    status: 'Resolved',
    createdAt: daysAgo(30, 9, 10),
    updatedAt: daysAgo(22, 16, 0),
    resolvedAt: daysAgo(22, 16, 0),
    resolutionNote: 'Transformer oil replaced and connections tightened by the KPTCL team.',
  },
  {
    citizenEmail: 'citizen@smartvillage.gov.in',
    title: 'Contaminated water from public tap',
    category: 'Water Supply',
    description: 'Water from the temple tap appears muddy and has an unusual odour.',
    status: 'Resolved',
    createdAt: daysAgo(40, 8, 30),
    updatedAt: daysAgo(35, 13, 15),
    resolvedAt: daysAgo(35, 13, 15),
    resolutionNote: 'Pipeline flushed and chlorine tablets added. Water sample tested safe.',
  },
  {
    citizenEmail: 'lakshmi.devi@example.com',
    title: 'Public toilet cleaning required',
    category: 'Sanitation',
    description: 'The community toilet near the bus stand has not been cleaned this week.',
    status: 'Resolved',
    createdAt: daysAgo(50, 10, 0),
    updatedAt: daysAgo(44, 9, 30),
    resolvedAt: daysAgo(44, 9, 30),
    resolutionNote: 'Sanitation worker roster revised; daily cleaning verified for one week.',
  },
  {
    citizenEmail: 'priya.sharma@example.com',
    title: 'Damaged road sign near temple',
    category: 'Roads',
    description: 'The speed-limit sign has fallen and is blocking the footpath.',
    status: 'Resolved',
    createdAt: daysAgo(60, 17, 25),
    updatedAt: daysAgo(55, 12, 45),
    resolvedAt: daysAgo(55, 12, 45),
    resolutionNote: 'Sign re-installed at a safer location by the road maintenance crew.',
  },
  {
    citizenEmail: 'arjun.rao@example.com',
    title: 'Stray cattle complaint',
    category: 'Other',
    description: 'Stray cattle are wandering near the school during morning hours.',
    status: 'Resolved',
    createdAt: daysAgo(75, 8, 10),
    updatedAt: daysAgo(70, 14, 20),
    resolvedAt: daysAgo(70, 14, 20),
    resolutionNote: 'Cattle shed upgraded and owners counselled by the panchayat.',
  },
  {
    citizenEmail: 'lakshmi.devi@example.com',
    title: 'Frequent power cuts in Ward 2',
    category: 'Electricity',
    description: 'Power supply is interrupted for 2-3 hours every evening.',
    status: 'Resolved',
    createdAt: daysAgo(90, 19, 5),
    updatedAt: daysAgo(84, 11, 0),
    resolvedAt: daysAgo(84, 11, 0),
    resolutionNote: 'Load balancing completed on the Ward 2 distribution line.',
  },
  {
    citizenEmail: 'citizen@smartvillage.gov.in',
    title: 'Broken pipeline near bus stand',
    category: 'Water Supply',
    description: 'A leaking main pipeline is wasting water and flooding the road.',
    status: 'Resolved',
    createdAt: daysAgo(105, 7, 35),
    updatedAt: daysAgo(99, 15, 10),
    resolvedAt: daysAgo(99, 15, 10),
    resolutionNote: 'Broken section replaced by the water works department.',
  },
  {
    citizenEmail: 'priya.sharma@example.com',
    title: 'Health camp information request',
    category: 'Other',
    description: 'Requesting the schedule for the next village health camp.',
    status: 'Resolved',
    createdAt: daysAgo(120, 10, 0),
    updatedAt: daysAgo(115, 9, 0),
    resolvedAt: daysAgo(115, 9, 0),
    resolutionNote: 'Health camp schedule shared with the citizen and displayed at the panchayat office.',
  },
  {
    citizenEmail: 'arjun.rao@example.com',
    title: 'Open drain near anganwadi',
    category: 'Sanitation',
    description: 'The open drain behind the anganwadi is a safety risk for children.',
    status: 'Resolved',
    createdAt: daysAgo(140, 12, 0),
    updatedAt: daysAgo(132, 16, 30),
    resolvedAt: daysAgo(132, 16, 30),
    resolutionNote: 'Drain covered with concrete slabs and safety fencing installed.',
  },
  {
    citizenEmail: 'lakshmi.devi@example.com',
    title: 'Meter reading discrepancy',
    category: 'Electricity',
    description: 'Electricity bill shows a much higher reading than the meter displays.',
    status: 'Resolved',
    createdAt: daysAgo(155, 9, 20),
    updatedAt: daysAgo(150, 10, 15),
    resolvedAt: daysAgo(150, 10, 15),
    resolutionNote: 'Meter reading corrected and revised bill issued by the electricity board.',
  },


  {
    citizenEmail: 'meera.nair@example.com',
    title: 'Lake embankment erosion',
    category: 'Water Supply',
    description: 'Soil erosion on the northern embankment is worsening after rains.',
    status: 'In Progress',
    createdAt: daysAgo(7, 10, 0),
    updatedAt: daysAgo(2, 9, 0),
    resolutionNote: 'Included in the lake restoration work scope.',
  },
  {
    citizenEmail: 'suresh.gowda@example.com',
    title: 'School bus stop needs shelter',
    category: 'Other',
    description: 'Children wait in the open sun for the school bus every morning.',
    status: 'Pending',
    createdAt: daysAgo(4, 8, 30),
    updatedAt: daysAgo(4, 8, 30),
  },
  {
    citizenEmail: 'meera.nair@example.com',
    title: 'Streetlight damaged by storm',
    category: 'Electricity',
    description: 'A tree branch brought down two streetlights near the temple.',
    status: 'Resolved',
    createdAt: daysAgo(35, 18, 0),
    updatedAt: daysAgo(28, 12, 0),
    resolvedAt: daysAgo(28, 12, 0),
    resolutionNote: 'Branches cleared and lights re-installed.',
  },
  {
    citizenEmail: 'suresh.gowda@example.com',
    title: 'Drinking water quality concern',
    category: 'Water Supply',
    description: 'Water has a metallic taste in the southern hamlet.',
    status: 'Resolved',
    createdAt: daysAgo(65, 9, 15),
    updatedAt: daysAgo(58, 11, 20),
    resolvedAt: daysAgo(58, 11, 20),
    resolutionNote: 'Old GI pipes identified and replaced; water sample certified.',
  },


  {
    citizenEmail: 'anita.patil@example.com',
    title: 'Market road needs street lighting',
    category: 'Electricity',
    description: 'The stretch near the new market has no working lights at night.',
    status: 'In Progress',
    createdAt: daysAgo(5, 19, 0),
    updatedAt: daysAgo(1, 10, 0),
    resolutionNote: 'Two additional poles sanctioned under the LED upgrade.',
  },
  {
    citizenEmail: 'vikram.shetty@example.com',
    title: 'Water tanker supply delay',
    category: 'Water Supply',
    description: 'The scheduled water tanker arrived three hours late this week.',
    status: 'Pending',
    createdAt: daysAgo(2, 7, 30),
    updatedAt: daysAgo(2, 7, 30),
  },
  {
    citizenEmail: 'anita.patil@example.com',
    title: 'Garbage segregation awareness',
    category: 'Sanitation',
    description: 'Requesting a ward-level awareness session on waste segregation.',
    status: 'Resolved',
    createdAt: daysAgo(45, 10, 0),
    updatedAt: daysAgo(38, 15, 0),
    resolvedAt: daysAgo(38, 15, 0),
    resolutionNote: 'Awareness session held at the market complex with 60 participants.',
  },
  {
    citizenEmail: 'vikram.shetty@example.com',
    title: 'Road hump near school',
    category: 'Roads',
    description: 'Vehicles speed past the school gate; a speed hump is needed.',
    status: 'Resolved',
    createdAt: daysAgo(80, 8, 0),
    updatedAt: daysAgo(72, 12, 30),
    resolvedAt: daysAgo(72, 12, 30),
    resolutionNote: 'Two speed humps installed and signage painted near the school.',
  },
];

const importLogSeeds = [
  {
    villageCode: 'KA-KLB-001',
    fileName: 'village_statistics_kallur.xlsx',
    recordsCount: 1,
    status: 'Success',
    importType: 'Statistics',
    timestamp: daysAgo(2, 16, 32),
    errorSummary: '',
  },
  {
    villageCode: 'KA-KLB-001',
    fileName: 'kallur_projects_q3.csv',
    recordsCount: 5,
    status: 'Success',
    importType: 'Projects',
    timestamp: daysAgo(18, 11, 5),
    errorSummary: '',
  },
  {
    villageCode: 'KA-KLB-001',
    fileName: 'ward_data_update.xlsx',
    recordsCount: 12,
    status: 'Success',
    importType: 'Statistics',
    timestamp: daysAgo(42, 9, 40),
    errorSummary: '',
  },
  {
    villageCode: 'KA-KLB-001',
    fileName: 'legacy_projects.csv',
    recordsCount: 0,
    status: 'Failed',
    importType: 'Projects',
    timestamp: daysAgo(65, 14, 10),
    errorSummary: 'Row 2: category must be one of Infrastructure, Education, Water Supply, Energy, Healthcare, Sanitation | Row 3: budget must be a non-negative number',
  },
  {
    villageCode: 'KA-MYS-014',
    fileName: 'nandipura_projects.csv',
    recordsCount: 4,
    status: 'Success',
    importType: 'Projects',
    timestamp: daysAgo(9, 10, 15),
    errorSummary: '',
  },
  {
    villageCode: 'KA-MYS-014',
    fileName: 'nandipura_statistics.xlsx',
    recordsCount: 1,
    status: 'Success',
    importType: 'Statistics',
    timestamp: daysAgo(27, 15, 0),
    errorSummary: '',
  },
  {
    villageCode: 'KA-RMN-007',
    fileName: 'harohalli_projects_q2.csv',
    recordsCount: 5,
    status: 'Success',
    importType: 'Projects',
    timestamp: daysAgo(14, 12, 20),
    errorSummary: '',
  },
  {
    villageCode: 'KA-RMN-007',
    fileName: 'harohalli_statistics.csv',
    recordsCount: 1,
    status: 'Success',
    importType: 'Statistics',
    timestamp: daysAgo(33, 9, 5),
    errorSummary: '',
  },
];

const seed = async () => {
  await connectDB();

  console.log('[seed] Clearing existing collections…');
  await Promise.all([
    User.deleteMany({}),
    Village.deleteMany({}),
    VillageStatistics.deleteMany({}),
    Project.deleteMany({}),
    Complaint.deleteMany({}),
    ImportLog.deleteMany({}),
  ]);

  const officerHash = await bcrypt.hash('Officer@123', 12);
  const citizenHash = await bcrypt.hash('Citizen@123', 12);

  const villages = await Village.insertMany(villageSeeds);
  const villageByCode = new Map(villages.map((village) => [village.villageCode, village]));
  const defaultVillage = villageByCode.get('KA-KLB-001');

  const statisticsDocs = statisticsSeeds.map((stat) => ({
    villageId: villageByCode.get(stat.villageCode)._id,
    population: stat.population,
    waterCoverage: stat.waterCoverage,
    electricityCoverage: stat.electricityCoverage,
    roadConnectivity: stat.roadConnectivity,
    sectorMetrics: stat.sectorMetrics,
  }));
  await VillageStatistics.insertMany(statisticsDocs);

  const officers = await User.insertMany([
    {
      name: 'Ananya Rao',
      email: 'officer@smartvillage.gov.in',
      passwordHash: officerHash,
      role: 'Village Officer',
      villageId: defaultVillage._id,
      phone: '+91 98801 23456',
    },
    {
      name: 'Mohan Gowda',
      email: 'officer.nandipura@smartvillage.gov.in',
      passwordHash: officerHash,
      role: 'Village Officer',
      villageId: villageByCode.get('KA-MYS-014')._id,
      phone: '+91 98802 11223',
    },
    {
      name: 'Kavya Shetty',
      email: 'officer.harohalli@smartvillage.gov.in',
      passwordHash: officerHash,
      role: 'Village Officer',
      villageId: villageByCode.get('KA-RMN-007')._id,
      phone: '+91 98803 44556',
    },
  ]);

  const citizenSeeds = [
    { name: 'Ravi Kumar', email: 'citizen@smartvillage.gov.in', villageCode: 'KA-KLB-001', phone: '+91 90080 12345' },
    { name: 'Priya Sharma', email: 'priya.sharma@example.com', villageCode: 'KA-KLB-001', phone: '+91 90080 23456' },
    { name: 'Arjun Rao', email: 'arjun.rao@example.com', villageCode: 'KA-KLB-001', phone: '' },
    { name: 'Lakshmi Devi', email: 'lakshmi.devi@example.com', villageCode: 'KA-KLB-001', phone: '+91 90080 34567' },
    { name: 'Meera Nair', email: 'meera.nair@example.com', villageCode: 'KA-MYS-014', phone: '' },
    { name: 'Suresh Gowda', email: 'suresh.gowda@example.com', villageCode: 'KA-MYS-014', phone: '' },
    { name: 'Anita Patil', email: 'anita.patil@example.com', villageCode: 'KA-RMN-007', phone: '' },
    { name: 'Vikram Shetty', email: 'vikram.shetty@example.com', villageCode: 'KA-RMN-007', phone: '' },
  ];
  const citizenDocs = citizenSeeds.map((citizen) => ({
    name: citizen.name,
    email: citizen.email,
    passwordHash: citizenHash,
    role: 'Citizen',
    villageId: villageByCode.get(citizen.villageCode)._id,
    phone: citizen.phone,
    createdAt: daysAgo(365),
    updatedAt: daysAgo(365),
  }));
  const citizens = await User.insertMany(citizenDocs);
  const officerByVillage = new Map(officers.map((officer) => [String(officer.villageId), officer]));
  const citizenByEmail = new Map(citizens.map((citizen) => [citizen.email, citizen]));

  const projectDocs = projectSeeds.map((project) => {
    const village = villageByCode.get(project.villageCode);
    const { villageCode, ...projectFields } = project;
    return {
      ...projectFields,
      _id: new mongoose.Types.ObjectId(),
      villageId: village._id,
      __v: 0,
    };
  });
  await Project.collection.insertMany(projectDocs);

  const complaintDocs = complaintSeeds.map((complaint, index) => {
    const citizen = citizenByEmail.get(complaint.citizenEmail);
    const village = villages.find((item) => String(item._id) === String(citizen.villageId));
    return {
      _id: new mongoose.Types.ObjectId(),
      villageId: village._id,
      citizenId: citizen._id,
      ticketCode: `SV-${year}-${String(1001 + index).padStart(4, '0')}`,
      title: complaint.title,
      category: complaint.category,
      description: complaint.description,
      status: complaint.status,
      resolutionNote: complaint.resolutionNote || '',
      resolvedAt: complaint.resolvedAt || null,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt,
      __v: 0,
    };
  });
  await Complaint.collection.insertMany(complaintDocs);

  const importDocs = importLogSeeds.map((log) => {
    const village = villageByCode.get(log.villageCode);
    const uploader = officerByVillage.get(String(village._id));
    return {
      _id: new mongoose.Types.ObjectId(),
      villageId: village._id,
      uploadedBy: uploader._id,
      fileName: log.fileName,
      recordsCount: log.recordsCount,
      status: log.status,
      importType: log.importType,
      errorSummary: log.errorSummary,
      timestamp: log.timestamp,
      createdAt: log.timestamp,
      updatedAt: log.timestamp,
      __v: 0,
    };
  });
  await ImportLog.collection.insertMany(importDocs);

  await Promise.all([
    User.syncIndexes(),
    Village.syncIndexes(),
    VillageStatistics.syncIndexes(),
    Project.syncIndexes(),
    Complaint.syncIndexes(),
    ImportLog.syncIndexes(),
  ]);

  console.log('\n[seed] Demo data ready');
  console.log(`  Villages:   ${villages.length}`);
  console.log(`  Users:      ${officers.length + citizens.length} (3 officers, ${citizens.length} citizens)`);
  console.log(`  Projects:   ${projectDocs.length}`);
  console.log(`  Complaints: ${complaintDocs.length}`);
  console.log(`  Imports:    ${importDocs.length}`);
  console.log('\n  Officer login  : officer@smartvillage.gov.in / Officer@123');
  console.log('  Citizen login  : citizen@smartvillage.gov.in / Citizen@123\n');

  await mongoose.disconnect();
};

seed()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('[seed] Failed:', error);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
