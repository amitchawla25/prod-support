
import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '../ui/tabs';

interface FilterTabsProps {
  onFilterChange: (value: string) => void;
}

const FilterTabs = ({ onFilterChange }: FilterTabsProps) => {
  const [activeTab, setActiveTab] = useState('all');

  const handleValueChange = (value: string) => {
    setActiveTab(value);
    onFilterChange(value);
  };

  return (
    <Tabs value={activeTab} onValueChange={handleValueChange} className="w-full sm:w-auto">
      <TabsList className="grid w-full sm:w-auto sm:inline-flex grid-cols-2 sm:grid-cols-none gap-1">
        <TabsTrigger value="all">
          All
        </TabsTrigger>
        <TabsTrigger value="pending">
          Pending
        </TabsTrigger>
        <TabsTrigger value="approved">
          Approved
        </TabsTrigger>
        <TabsTrigger value="rejected">
          Rejected
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
};

export default FilterTabs;
