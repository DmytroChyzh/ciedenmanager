import GraphCard from './GraphCard';
import { ChatBubbleLeftRightIcon } from '@heroicons/react/24/solid';
import { useLanguage } from '@/contexts/LanguageContext';

export default function ChatsCountCard({ 
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
      title={t('chatsCount')}
      value={value}
      data={data}
      type="line"
      icon={<ChatBubbleLeftRightIcon className="w-6 h-6 text-primary dark:text-dark-primary" />}
      percent={percent}
      color="#651FFF"
      yDomain={[0, 20]}
      yTicks={[0, 5, 10, 15, 20]}
      onPeriodChange={onPeriodChange}
      currentPeriod={currentPeriod}
    />
  );
} 