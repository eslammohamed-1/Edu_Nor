/** عناصر لوحة تحكم تجريبية من CSV المُولَّد */
import ad from '@/fixtures/demo-catalog/generated/adminDashboard.json';

export const adminDashboardQuickActions = ad.quickActions;
export const adminDashboardDemoRevenueStat = {
  ...ad.demoRevenueStat,
  trend: ad.demoRevenueStat.trend as 'neutral' | 'up' | 'down'
};
export const adminDashboardChartTitles = ad.chartTitles;
