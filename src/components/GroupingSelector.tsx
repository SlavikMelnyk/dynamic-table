import React, { useContext } from 'react';
import { PivotContext } from '../context/PivotContext';
import type { GroupField } from '../types';

export default function GroupingSelector() {
  const { rowGroup, setRowGroup, colGroups, setColGroups, GROUP_FIELDS } = useContext(PivotContext);

  const handleRowChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextRowGroup = event.target.value as GroupField;
    setRowGroup(nextRowGroup);
    if (colGroups.includes(nextRowGroup)) {
      setColGroups(colGroups.filter(columnGroup => columnGroup !== nextRowGroup));
    }
  };

  const toggleColumnField = (groupField: GroupField) => {
    setColGroups(previousColumnGroups =>
      previousColumnGroups.includes(groupField)
        ? previousColumnGroups.filter(existingGroupField => existingGroupField !== groupField)
        : [...previousColumnGroups, groupField]
    );
  };

  return (
    <div className="mb-4  mx-auto max-w-[500px]">
      <div className="flex w-full">
        <label htmlFor="row-group" className="mr-2 text-gray-700 font-extrabold">Row group:</label>
        <select
          id="row-group"
          value={rowGroup}
          onChange={handleRowChange}
          className="p-1 border border-gray-300 rounded w-[320px]"
        >
          {GROUP_FIELDS.map(groupField => (
            <option key={groupField} value={groupField}>{groupField}</option>
          ))}
        </select>
      </div>

      <div className="mt-3 w-full">
        <span className=" text-gray-700 mr-2 font-extrabold">Column groups:</span>
        {GROUP_FIELDS.map(groupField => {
          const isDisabled = groupField === rowGroup;
          return (
            <label key={groupField} className={`mr-4 ${isDisabled ? 'text-gray-400' : 'text-gray-800'}`}>
              <input
                type="checkbox"
                className="mr-1 align-middle"
                disabled={isDisabled}
                checked={colGroups.includes(groupField)}
                onChange={() => toggleColumnField(groupField)}
              />
              {groupField}
            </label>
          );
        })}
      </div>
    </div>
  );
}
