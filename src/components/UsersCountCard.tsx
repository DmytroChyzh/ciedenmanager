import GraphCard from './GraphCard';
import { UserGroupIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';

export default function UsersCountCard({ 
  value, 
  data, 
  percent, 
  onPeriodChange, 
  currentPeriod = 'week' 
}: { 
  value: number, 
  data: any[], 
  percent: number,
  onPeriodChange?: (period: 'week' | 'month' | 'year') => void,
  currentPeriod?: 'week' | 'month' | 'year'
}) {
  const { t } = useLanguage();
  return (
    <GraphCard
      title={t('usersCount')}
      value={value}
      data={data}
      type="bar"
      icon={<UserGroupIcon className="w-7 h-7 text-[#651FFF]" />}
      percent={percent}
      color="#651FFF"
      yDomain={[0, 20]}
      yTicks={[0, 5, 10, 15, 20]}
      onPeriodChange={onPeriodChange}
      currentPeriod={currentPeriod}
    />
  );
} 