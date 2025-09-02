// Standardized status colors for the entire system
// This ensures consistency and professionalism across all status indicators

export type StatusType = 
  // User statuses
  | 'active' 
  | 'inactive' 
  | 'suspended'
  | 'pending'
  | 'approved'
  | 'rejected'
  
  // Member statuses
  | 'pre_graduate'
  | 'graduate'
  | 'alumni'
  
  // Contribution statuses
  | 'completed'
  | 'failed'
  | 'processing'
  | 'cancelled'
  | 'refunded'
  
  // Training/Event statuses
  | 'upcoming'
  | 'ongoing'
  | 'completed'
  | 'cancelled'
  
  // Payment statuses
  | 'initiated'
  | 'processing'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

/**
 * Get the standardized color for any status across the system
 * @param status - The status string
 * @returns BadgeColor type for consistent styling
 */
export function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'info' | 'primary' {
  const statusLower = status.toLowerCase();
  
  // Active/Positive statuses - Light Green
  if (['active', 'approved', 'completed', 'graduate'].includes(statusLower)) {
    return 'success';
  }
  
  // Pending/Waiting statuses - Orange
  if (['pending', 'inactive', 'pre_graduate', 'processing', 'initiated'].includes(statusLower)) {
    return 'warning';
  }
  
  // Error/Problem statuses - Red
  if (['suspended', 'rejected', 'failed', 'cancelled', 'error'].includes(statusLower)) {
    return 'error';
  }
  
  // Informational statuses - Blue
  if (['alumni', 'info', 'upcoming'].includes(statusLower)) {
    return 'info';
  }
  
  // Default fallback - Primary color
  return 'primary';
}

/**
 * Get status display name with proper capitalization
 * @param status - The status string
 * @returns Properly formatted status name
 */
export function getStatusDisplayName(status: string): string {
  const statusLower = status.toLowerCase();
  
  // Handle special cases
  if (statusLower === 'pre_graduate') return 'Pre-Graduate';
  if (statusLower === 'upcoming') return 'Upcoming';
  if (statusLower === 'ongoing') return 'Ongoing';
  
  // Default: capitalize first letter
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

/**
 * Get status icon (if needed in the future)
 * @param status - The status string
 * @returns Icon component or null
 */
export function getStatusIcon(status: string): React.ReactNode | null {
  // This can be expanded later to include icons for different statuses
  return null;
}

// Status color mapping for reference
export const STATUS_COLORS: Record<StatusType, 'success' | 'warning' | 'error' | 'info' | 'primary'> = {
  // User Management
  active: 'success',
  inactive: 'warning',
  suspended: 'error',
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  
  // Member Management
  pre_graduate: 'warning',
  graduate: 'success',
  alumni: 'info',
  
  // Financial/Contributions
  completed: 'success',
  failed: 'error',
  processing: 'warning',
  cancelled: 'error',
  refunded: 'info',
  
  // Training/Events
  upcoming: 'info',
  ongoing: 'warning',
  
  // Payment Processing
  initiated: 'warning',
} as const; 