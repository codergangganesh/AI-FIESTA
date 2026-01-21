/**
 * Utility functions for generating chart data
 */

// Generate mock accuracy data for the chart
export const generateAccuracyData = (metrics: string[], lineData: {period: string; [key: string]: string | number}[]) => {
  if (!lineData || lineData.length === 0) return [];
  
  return lineData.map((dataPoint, index) => {
    const point = { period: dataPoint.period } as { period: string; [key: string]: string | number };
    
    // Generate mock accuracy values between 75% and 95% that generally increase over time
    metrics.forEach(metric => {
      // Create a base value that increases over time
      const baseValue = 75 + (index / (lineData.length - 1)) * 20;
      // Add some random variation
      const variation = (Math.random() - 0.5) * 5;
      point[metric] = Math.min(100, Math.max(0, Math.round((baseValue + variation) * 10) / 10));
    });
    
    return point;
  });
};

// Generate mock loss data for the chart
export const generateLossData = (metrics: string[], lineData: {period: string; [key: string]: string | number}[]) => {
  if (!lineData || lineData.length === 0) return [];
  
  return lineData.map((dataPoint, index) => {
    const point = { period: dataPoint.period } as { period: string; [key: string]: string | number };
    
    // Generate mock loss values that generally decrease over time
    metrics.forEach(metric => {
      // Create a base value that decreases over time
      const baseValue = 2.5 - (index / (lineData.length - 1)) * 1.5;
      // Add some random variation
      const variation = (Math.random() - 0.5) * 0.3;
      point[metric] = Math.max(0.1, Math.min(3, Math.round((baseValue + variation) * 100) / 100));
    });
    
    return point;
  });
};

// Helper function to get color classes for metrics
export const getMetricColorClasses = (color: string) => {
  switch (color) {
    case 'blue':
      return 'from-blue-500 to-blue-600 text-white';
    case 'purple':
      return 'from-purple-500 to-purple-600 text-white';
    case 'green':
      return 'from-green-500 to-green-600 text-white';
    case 'orange':
      return 'from-orange-500 to-orange-600 text-white';
    default:
      return 'from-gray-500 to-gray-600 text-white';
  }
};
