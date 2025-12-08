'use client';

import React, { useState, useEffect } from 'react';

interface InventorySettings {
  total_inventory_value: string;
  use_manual_total_value: string;
}

interface InventoryValueEditorProps {
  calculatedTotalValue: number;
  onValueUpdate?: () => void;
}

export default function InventoryValueEditor({
  calculatedTotalValue,
  onValueUpdate
}: InventoryValueEditorProps) {
  const [settings, setSettings] = useState<InventorySettings>({
    total_inventory_value: '0',
    use_manual_total_value: 'false'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tempValue, setTempValue] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/inventory-settings');
      const data = await response.json();

      if (data.settings) {
        setSettings(data.settings);
        setTempValue(data.settings.total_inventory_value);
      }
    } catch (error) {
      console.error('Failed to fetch inventory settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = async (settingName: string, settingValue: string) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/inventory-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settingName,
          settingValue
        }),
      });

      if (response.ok) {
        setSettings(prev => ({
          ...prev,
          [settingName]: settingValue
        }));
        onValueUpdate?.();
      } else {
        alert('更新设置失败');
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      alert('更新设置失败');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleManualMode = () => {
    const newValue = settings.use_manual_total_value === 'true' ? 'false' : 'true';
    updateSetting('use_manual_total_value', newValue);
  };

  const handleSaveValue = () => {
    const numValue = parseInt(tempValue);
    if (isNaN(numValue) || numValue < 0) {
      alert('请输入有效的数值（大于等于0的整数）');
      return;
    }
    updateSetting('total_inventory_value', numValue.toString());
    setEditMode(false);
  };

  const handleCancelEdit = () => {
    setTempValue(settings.total_inventory_value);
    setEditMode(false);
  };

  const displayValue = settings.use_manual_total_value === 'true'
    ? parseInt(settings.total_inventory_value) || 0
    : calculatedTotalValue;

  const isManualMode = settings.use_manual_total_value === 'true';

  if (isLoading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">库存价值管理</h3>
        <div className="text-center text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">库存价值管理</h3>

      {/* 当前总价值显示 */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">当前总价值：</span>
          <span className="text-2xl font-bold text-yellow-400">
            ${(displayValue / 100).toFixed(2)}
          </span>
        </div>

        {/* 模式指示器 */}
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">计算模式：</span>
          <span className={`px-2 py-1 rounded text-xs ${
            isManualMode
              ? 'bg-blue-600 text-white'
              : 'bg-green-600 text-white'
          }`}>
            {isManualMode ? '手动设置' : '自动计算'}
          </span>
        </div>
      </div>

      {/* 自动计算价值信息 */}
      {!isManualMode && (
        <div className="bg-gray-700 rounded p-3 mb-4">
          <div className="text-sm text-gray-400 mb-1">
            自动计算基于所有有库存商品的总和：
          </div>
          <div className="text-lg font-semibold text-green-400">
            ${(calculatedTotalValue / 100).toFixed(2)}
          </div>
        </div>
      )}

      {/* 手动模式切换按钮 */}
      <div className="mb-4">
        <button
          onClick={handleToggleManualMode}
          disabled={isUpdating}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded transition-colors duration-200 text-sm"
        >
          {isUpdating ? '切换中...' : `切换到${isManualMode ? '自动' : '手动'}模式`}
        </button>
      </div>

      {/* 手动价值编辑 */}
      {isManualMode && (
        <div className="bg-gray-700 rounded p-4">
          <h4 className="font-medium text-gray-300 mb-3">手动设置总价值</h4>

          {!editMode ? (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-400">当前设置：</span>
                <span className="text-lg font-semibold text-blue-400">
                  ${((parseInt(settings.total_inventory_value) || 0) / 100).toFixed(2)}
                </span>
              </div>
              <button
                onClick={() => setEditMode(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
              >
                编辑价值
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  总价值（分为单位）
                </label>
                <input
                  type="number"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  placeholder="输入总价值（分为单位）"
                  className="w-full bg-gray-600 border border-gray-500 rounded px-3 py-2 text-white"
                  min="0"
                />
                <div className="text-xs text-gray-400 mt-1">
                  等于 ${((parseInt(tempValue) || 0) / 100).toFixed(2)}
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSaveValue}
                  disabled={isUpdating}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
                >
                  {isUpdating ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded text-sm transition-colors duration-200"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 使用说明 */}
      <div className="mt-4 text-xs text-gray-500">
        <p>• 自动计算：基于所有有库存商品价格总和</p>
        <p>• 手动设置：用于覆盖自动计算的值，适用于特殊情况</p>
        <p>• 价值单位：分为单位（100分 = 1美元）</p>
      </div>
    </div>
  );
}