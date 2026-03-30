
import type { UserRole, CustomerTier, ContractStatus, WasteType, PickupStatus } from '@/types';
import type { TranslationKey } from './translations'; // Import TranslationKey
import { LayoutDashboard, FileText, Users, Truck, Settings, BarChart3, FilePlus2, Edit3, Recycle, Building, FlaskConical, Biohazard, Syringe, Factory } from 'lucide-react';

// APP_NAME is now handled by translations, remove it from here
// export const APP_NAME = "TaherBioSafe"; 

export const USER_ROLES: { value: UserRole; label: string }[] = [
  { value: 'customer', label: 'Customer' },
  { value: 'driver', label: 'Driver' },
  { value: 'admin', label: 'Admin' },
  { value: 'owner', label: 'Owner' },
];

export const CUSTOMER_TIERS: { value: CustomerTier; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'recommended', label: 'Recommended' },
  { value: 'partner', label: 'Partner' },
];

export const CONTRACT_STATUSES: { value: ContractStatus; labelKey: TranslationKey; color: string }[] = [
  { value: 'requested', labelKey: 'contractTableTabPending', color: 'bg-yellow-500' },
  { value: 'approving', labelKey: 'approvingStatus', color: 'bg-yellow-500' },
  { value: 'failed', labelKey: 'failed', color: 'bg-red-600' },
  { value: 'awaiting_signatures', labelKey: 'contractTableTabAwaitingSignatures', color: 'bg-blue-500' },
  { value: 'active', labelKey: 'contractTableTabActive', color: 'bg-green-500' },
  { value: 'completed', labelKey: 'completedStatus', color: 'bg-green-600' },
  { value: 'expired', labelKey: 'contractTableTabExpired', color: 'bg-red-500' },
  { value: 'archived', labelKey: 'contractTableTabArchived', color: 'bg-gray-500' },
];

export const WASTE_TYPES: { value: WasteType; label: string, icon: React.ElementType }[] = [
  { value: 'chemical', label: 'Chemical Waste', icon: FlaskConical },
  { value: 'biohazard', label: 'Biohazard Waste', icon: Biohazard },
  { value: 'medical', label: 'Medical Sharps', icon: Syringe },
  { value: 'industrial', label: 'Industrial Waste', icon: Factory },
  { value: 'general', label: 'General Waste', icon: Recycle },
];

export const PICKUP_STATUSES: { value: PickupStatus; labelKey: TranslationKey, color: string }[] = [
  { value: 'requested', labelKey: 'pickupStatusRequested', color: 'bg-blue-500' },
  { value: 'scheduled', labelKey: 'pickupStatusScheduled', color: 'bg-yellow-500' },
  { value: 'completed', labelKey: 'completedStatus', color: 'bg-green-500' },
  { value: 'cancelled', labelKey: 'pickupStatusCancelled', color: 'bg-red-500' },
];


export interface NavLink {
  href: string;
  labelKey: TranslationKey; // Changed from label: string
  icon: React.ElementType;
  allowedRoles: UserRole[];
  subLinks?: NavLink[];
  groupKey?: TranslationKey; // Changed from group?: string
}

export const SIDEBAR_LINKS: NavLink[] = [
  {
    href: '/dashboard',
    labelKey: 'dashboardNavLabel',
    icon: LayoutDashboard,
    allowedRoles: ['owner', 'admin', 'customer', 'driver'],
    groupKey: 'overviewGroupLabel'
  },
  // Customer Specific
  {
    href: '/dashboard/customer/contracts',
    labelKey: 'myContractsNavLabel',
    icon: FileText,
    allowedRoles: ['customer'],
    groupKey: 'customerPortalGroupLabel',
    subLinks: [
        { href: '/dashboard/customer/contracts/request', labelKey: 'requestNewContractNavLabel', icon: FilePlus2, allowedRoles: ['customer'] },
    ]
  },
  {
    href: '/dashboard/customer/pickups',
    labelKey: 'orderPickupNavLabel',
    icon: Truck,
    allowedRoles: ['customer'],
    groupKey: 'customerPortalGroupLabel'
  },
  // Admin & Owner Specific
  {
    href: '/dashboard/admin/user-management',
    labelKey: 'userManagementNavLabel',
    icon: Users,
    allowedRoles: ['owner', 'admin'],
    groupKey: 'administrationGroupLabel'
  },
  {
    href: '/dashboard/admin/contracts',
    labelKey: 'contractManagementNavLabel',
    icon: Edit3,
    allowedRoles: ['owner', 'admin'],
    groupKey: 'administrationGroupLabel'
  },
  {
    href: '/dashboard/admin/pickups',
    labelKey: 'pickupLogisticsNavLabel',
    icon: Truck, 
    allowedRoles: ['owner', 'admin'],
    groupKey: 'operationsGroupLabel'
  },
  {
    href: '/dashboard/admin/reports',
    labelKey: 'incinerationReportsNavLabel',
    icon: Recycle, 
    allowedRoles: ['owner', 'admin'],
    groupKey: 'operationsGroupLabel'
  },
  {
    href: '/dashboard/admin/statistics',
    labelKey: 'statisticsNavLabel',
    icon: BarChart3,
    allowedRoles: ['owner', 'admin'],
    groupKey: 'analyticsGroupLabel'
  },
  // Driver Specific
  {
    href: '/dashboard/driver/schedule',
    labelKey: 'myScheduleNavLabel',
    icon: Truck,
    allowedRoles: ['driver'],
    groupKey: 'driverPortalGroupLabel'
  },
  // General
  {
    href: '/dashboard/settings',
    labelKey: 'settingsNavLabel',
    icon: Settings,
    allowedRoles: ['owner', 'admin', 'customer', 'driver'],
    groupKey: 'generalGroupLabel'
  },
];
