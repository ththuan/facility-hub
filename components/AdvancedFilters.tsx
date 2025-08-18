'use client';

import { useState, useEffect } from 'react';

export interface FilterOption {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'range' | 'multi-select' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface Filter {
  key: string;
  value: any;
  operator?: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'greater' | 'less' | 'between' | 'in' | 'not';
}

interface AdvancedFiltersProps {
  filters: FilterOption[];
  onFiltersChange: (activeFilters: Filter[]) => void;
  onSaveFilter?: (name: string, filters: Filter[]) => void;
  savedFilters?: { name: string; filters: Filter[] }[];
  className?: string;
}

export default function AdvancedFilters({
  filters,
  onFiltersChange,
  onSaveFilter,
  savedFilters = [],
  className = ''
}: AdvancedFiltersProps) {
  const [activeFilters, setActiveFilters] = useState<Filter[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [tempFilters, setTempFilters] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    onFiltersChange(activeFilters);
  }, [activeFilters, onFiltersChange]);

  const addFilter = (filterOption: FilterOption) => {
    const existingFilter = activeFilters.find(f => f.key === filterOption.key);
    if (existingFilter) return;

    const newFilter: Filter = {
      key: filterOption.key,
      value: filterOption.type === 'boolean' ? false : '',
      operator: getDefaultOperator(filterOption.type)
    };

    setActiveFilters([...activeFilters, newFilter]);
  };

  const updateFilter = (key: string, updates: Partial<Filter>) => {
    setActiveFilters(activeFilters.map(filter => 
      filter.key === key ? { ...filter, ...updates } : filter
    ));
  };

  const removeFilter = (key: string) => {
    setActiveFilters(activeFilters.filter(filter => filter.key !== key));
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setTempFilters({});
  };

  const getDefaultOperator = (type: string) => {
    switch (type) {
      case 'text': return 'contains';
      case 'select': return 'equals';
      case 'date': return 'equals';
      case 'range': return 'between';
      case 'multi-select': return 'in';
      case 'boolean': return 'equals';
      default: return 'equals';
    }
  };

  const getOperatorOptions = (type: string) => {
    switch (type) {
      case 'text':
        return [
          { value: 'contains', label: 'Chứa' },
          { value: 'equals', label: 'Bằng' },
          { value: 'startsWith', label: 'Bắt đầu bằng' },
          { value: 'endsWith', label: 'Kết thúc bằng' },
          { value: 'not', label: 'Không chứa' }
        ];
      case 'date':
        return [
          { value: 'equals', label: 'Bằng' },
          { value: 'greater', label: 'Sau' },
          { value: 'less', label: 'Trước' },
          { value: 'between', label: 'Trong khoảng' }
        ];
      case 'range':
        return [
          { value: 'between', label: 'Trong khoảng' },
          { value: 'greater', label: 'Lớn hơn' },
          { value: 'less', label: 'Nhỏ hơn' }
        ];
      default:
        return [
          { value: 'equals', label: 'Bằng' },
          { value: 'not', label: 'Không bằng' }
        ];
    }
  };

  const renderFilterValue = (filter: Filter, filterOption: FilterOption) => {
    switch (filterOption.type) {
      case 'text':
        return (
          <input
            type="text"
            value={filter.value}
            onChange={(e) => updateFilter(filter.key, { value: e.target.value })}
            placeholder={filterOption.placeholder || `Nhập ${filterOption.label.toLowerCase()}`}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'select':
        return (
          <select
            value={filter.value}
            onChange={(e) => updateFilter(filter.key, { value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          >
            <option value="">Chọn {filterOption.label.toLowerCase()}</option>
            {filterOption.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(filter.value) ? filter.value : [];
        return (
          <div className="flex-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  const dropdown = document.getElementById(`dropdown-${filter.key}`);
                  if (dropdown) {
                    dropdown.classList.toggle('hidden');
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 text-left"
              >
                {selectedValues.length > 0 
                  ? `Đã chọn ${selectedValues.length} mục` 
                  : `Chọn ${filterOption.label.toLowerCase()}`}
              </button>
              <div
                id={`dropdown-${filter.key}`}
                className="hidden absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto"
              >
                {filterOption.options?.map(option => (
                  <label
                    key={option.value}
                    className="flex items-center px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option.value)}
                      onChange={(e) => {
                        const newValues = e.target.checked
                          ? [...selectedValues, option.value]
                          : selectedValues.filter(v => v !== option.value);
                        updateFilter(filter.key, { value: newValues });
                      }}
                      className="mr-2"
                    />
                    <span className="text-gray-900 dark:text-gray-100">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'date':
        if (filter.operator === 'between') {
          const dates = Array.isArray(filter.value) ? filter.value : ['', ''];
          return (
            <div className="flex-1 flex space-x-2">
              <input
                type="date"
                value={dates[0]}
                onChange={(e) => updateFilter(filter.key, { value: [e.target.value, dates[1]] })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <span className="self-center text-gray-500 dark:text-gray-400">đến</span>
              <input
                type="date"
                value={dates[1]}
                onChange={(e) => updateFilter(filter.key, { value: [dates[0], e.target.value] })}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          );
        }
        return (
          <input
            type="date"
            value={filter.value}
            onChange={(e) => updateFilter(filter.key, { value: e.target.value })}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'range':
        if (filter.operator === 'between') {
          const values = Array.isArray(filter.value) ? filter.value : ['', ''];
          return (
            <div className="flex-1 flex space-x-2">
              <input
                type="number"
                value={values[0]}
                onChange={(e) => updateFilter(filter.key, { value: [e.target.value, values[1]] })}
                placeholder="Từ"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
              <span className="self-center text-gray-500 dark:text-gray-400">-</span>
              <input
                type="number"
                value={values[1]}
                onChange={(e) => updateFilter(filter.key, { value: [values[0], e.target.value] })}
                placeholder="Đến"
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>
          );
        }
        return (
          <input
            type="number"
            value={filter.value}
            onChange={(e) => updateFilter(filter.key, { value: e.target.value })}
            placeholder={filterOption.placeholder || 'Nhập số'}
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center flex-1">
            <input
              type="checkbox"
              checked={filter.value}
              onChange={(e) => updateFilter(filter.key, { value: e.target.checked })}
              className="mr-2"
            />
            <span className="text-gray-900 dark:text-gray-100">Có</span>
          </label>
        );

      default:
        return null;
    }
  };

  const saveFilter = () => {
    if (!filterName.trim()) {
      alert('Vui lòng nhập tên bộ lọc');
      return;
    }
    
    if (onSaveFilter) {
      onSaveFilter(filterName, activeFilters);
      setFilterName('');
      setShowSaveDialog(false);
      alert('✅ Đã lưu bộ lọc');
    }
  };

  const loadSavedFilter = (savedFilter: { name: string; filters: Filter[] }) => {
    setActiveFilters(savedFilter.filters);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 shadow rounded-lg p-6 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Bộ lọc nâng cao</h3>
        <div className="flex space-x-2">
          {activeFilters.length > 0 && (
            <>
              <button
                onClick={() => setShowSaveDialog(true)}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-100 rounded hover:bg-green-200 dark:hover:bg-green-700"
              >
                💾 Lưu bộ lọc
              </button>
              <button
                onClick={clearAllFilters}
                className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-100 rounded hover:bg-red-200 dark:hover:bg-red-700"
              >
                🗑️ Xóa tất cả
              </button>
            </>
          )}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-3 py-1 text-sm rounded ${
              showAdvanced 
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-800 dark:text-blue-100' 
                : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100'
            }`}
          >
            {showAdvanced ? '🔼 Thu gọn' : '🔽 Mở rộng'}
          </button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {filters.slice(0, 4).map(filterOption => (
            <button
              key={filterOption.key}
              onClick={() => addFilter(filterOption)}
              disabled={activeFilters.some(f => f.key === filterOption.key)}
              className={`px-3 py-1 text-sm rounded border ${
                activeFilters.some(f => f.key === filterOption.key)
                  ? 'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-800 dark:text-blue-100 dark:border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600 dark:hover:bg-gray-600'
              }`}
            >
              + {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Saved Filters */}
      {savedFilters.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bộ lọc đã lưu:
          </label>
          <div className="flex flex-wrap gap-2">
            {savedFilters.map((savedFilter, index) => (
              <button
                key={index}
                onClick={() => loadSavedFilter(savedFilter)}
                className="px-3 py-1 text-sm bg-purple-100 text-purple-700 dark:bg-purple-800 dark:text-purple-100 rounded hover:bg-purple-200 dark:hover:bg-purple-700"
              >
                📁 {savedFilter.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="space-y-3 mb-4">
          {activeFilters.map(filter => {
            const filterOption = filters.find(f => f.key === filter.key);
            if (!filterOption) return null;

            return (
              <div key={filter.key} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="min-w-0 flex-1 flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-0">
                    {filterOption.label}:
                  </span>
                  
                  {getOperatorOptions(filterOption.type).length > 1 && (
                    <select
                      value={filter.operator}
                      onChange={(e) => updateFilter(filter.key, { 
                        operator: e.target.value as any,
                        value: e.target.value === 'between' ? ['', ''] : ''
                      })}
                      className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-gray-100"
                    >
                      {getOperatorOptions(filterOption.type).map(operator => (
                        <option key={operator.value} value={operator.value}>
                          {operator.label}
                        </option>
                      ))}
                    </select>
                  )}

                  {renderFilterValue(filter, filterOption)}
                </div>
                
                <button
                  onClick={() => removeFilter(filter.key)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  ✕
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Advanced Filter Options */}
      {showAdvanced && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Thêm bộ lọc:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {filters.filter(f => !activeFilters.some(af => af.key === f.key)).map(filterOption => (
              <button
                key={filterOption.key}
                onClick={() => addFilter(filterOption)}
                className="px-3 py-2 text-sm text-left bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-100"
              >
                + {filterOption.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Lưu bộ lọc</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên bộ lọc:
              </label>
              <input
                type="text"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Nhập tên bộ lọc"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100"
              />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
              >
                Hủy
              </button>
              <button
                onClick={saveFilter}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
