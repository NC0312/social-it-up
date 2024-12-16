import React from 'react';
import { FaExclamationCircle, FaExclamationTriangle, FaFlag, FaRegFlag } from 'react-icons/fa';

const PriorityDisplay = ({ priority }) => {
  const getPriorityInfo = (priority) => {
    switch (priority) {
      case 'highest':
        return { icon: FaExclamationCircle, color: 'text-red-600', bgColor: 'bg-red-100' };
      case 'high':
        return { icon: FaExclamationTriangle, color: 'text-orange-600', bgColor: 'bg-orange-100' };
      case 'medium':
        return { icon: FaFlag, color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
      case 'low':
      default:
        return { icon: FaRegFlag, color: 'text-blue-600', bgColor: 'bg-blue-100' };
    }
  };

  const { icon: Icon, color, bgColor } = getPriorityInfo(priority);

  return (
    <div className={`flex items-center justify-center p-2 rounded-full ${bgColor}`}>
      <Icon className={`${color} mr-2`} />
      <span className={`${color} font-semibold capitalize`}>{priority}</span>
    </div>
  );
};

export default PriorityDisplay;

