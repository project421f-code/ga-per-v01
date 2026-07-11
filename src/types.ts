export enum Team {
  MAINTENANCE = "Maintenance",
  HOUSEKEEPING = "Housekeeping",
  SECURITY = "Security",
  CLEANING_SERVICE = "Cleaning Service",
  ASSET_INVENTORY = "Asset Inventory",
}

export enum TaskStatus {
  PENDING = "Pending",
  IN_PROGRESS = "In-Progress",
  COMPLETED = "Completed",
  VERIFIED = "Verified",
}

export enum Priority {
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
}

export interface Task {
  id: string;
  title: string;
  description: string;
  team: Team;
  reporter: string;
  location: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  slaMinutes: number; // SLA standard target
  actualMinutes?: number; // Actual completion time (if completed)
  feedbackRating?: number; // Rating out of 5 from user
}

export interface ActivityLog {
  id: string;
  taskId?: string;
  team?: Team;
  actor: string;
  action: string;
  timestamp: string;
  details?: string;
}

export interface KPIStats {
  csat: number;
  avgResponseTime: number; // in minutes
  completionRate: number; // percentage
  slaCompliance: number; // percentage of tasks completed within SLA target
  totalTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  verifiedTasks: number;
  stakeholderSatisfactionScore: number; // monthly survey average out of 5.0
  totalSurveysCount: number;
}

export interface StakeholderSurvey {
  id: string;
  month: string; // e.g., "Juli 2026"
  stakeholderName: string;
  department: string;
  ratings: Record<Team, number>; // 1-5 score per team
  feedback: Record<Team, string>; // written comments per team
  submittedAt: string;
}

export interface AssetItem {
  id: string;
  name: string;
  category: string;
  systemQty: number;
  physicalQty: number;
  location: string;
  lastOpnameDate: string;
  status: "In-Use" | "Damaged" | "Stored" | "Lost";
}

export interface OpnameSchedule {
  id: string;
  title: string;
  month: string;
  scheduledDate: string;
  status: "Scheduled" | "In-Progress" | "Completed" | "Overdue";
  totalItems: number;
  countedItems: number;
  completedDate?: string;
}

export interface OpnameLog {
  id: string;
  scheduleId: string;
  assetId: string;
  assetName: string;
  systemQty: number;
  physicalQty: number;
  discrepancy: number; // physicalQty - systemQty
  discrepancyReason?: string;
  adjusted: boolean;
  adjustmentNote?: string;
  adjustedAt?: string;
}

export interface PRDSection {
  id: string;
  title: string;
  icon: string;
  content: string;
}

export type KosRoomType = "Standar" | "Superior" | "AC";
export type KosRoomStatus = "Available" | "Occupied" | "Maintenance";

export interface KosHouse {
  id: string;
  name: string;
  address: string;
  phone: string;
}

export interface KosRoom {
  id: string;
  houseId: string;
  roomNumber: string;
  type: KosRoomType;
  price: number;
  status: KosRoomStatus;
  occupantName?: string;
  occupantPhone?: string;
  checkInDate?: string;
  checkOutDate?: string;
}

export interface KosPayment {
  id: string;
  roomId: string;
  roomNumber: string;
  houseName: string;
  tenantName: string;
  amount: number;
  month: string; // e.g., "Juli 2026"
  paidAt: string;
  status: "Paid" | "Unpaid";
}

