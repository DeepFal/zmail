import React, { useState, useRef, useEffect, useContext } from 'react'; // feat: 导入 useContext
import { useTranslation } from 'react-i18next';
import { deleteMailbox as apiDeleteMailbox } from '../utils/api';
import { MailboxContext } from '../contexts/MailboxContext'; // feat: 导入 MailboxContext
import ConfirmDialog from './ConfirmDialog';

interface MailboxSwitcherProps {
  currentMailbox: Mailbox;
  onSwitchMailbox: (mailbox: Mailbox) => void;
}

const MailboxSwitcher: React.FC<MailboxSwitcherProps> = ({
  currentMailbox,
  onSwitchMailbox
}) => {
  const { t } = useTranslation();
  // feat: 从 context 中获取全局通知函数
  const { showSuccessMessage, showErrorMessage } = useContext(MailboxContext);
  const [savedMailboxes, setSavedMailboxes] = useState<Mailbox[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDeletingMailbox, setIsDeletingMailbox] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);
  const [mailboxToDelete, setMailboxToDelete] = useState<string | null>(null);
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 组件挂载时加载保存的邮箱
  useEffect(() => {
    loadSavedMailboxes();
  }, []);

  // 当前邮箱变化时，更新保存的邮箱列表
  useEffect(() => {
    if (currentMailbox) {
      updateSavedMailboxes(currentMailbox);
    }
  }, [currentMailbox]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 加载保存的邮箱列表
  const loadSavedMailboxes = () => {
    try {
      const savedData = localStorage.getItem('savedMailboxes');
      if (savedData) {
        const mailboxes = JSON.parse(savedData) as Mailbox[];
        // 过滤掉已过期的邮箱
        const now = Date.now() / 1000;
        const validMailboxes = mailboxes.filter(m => m.expiresAt > now);
        setSavedMailboxes(validMailboxes);
      }
    } catch (error) {
      console.error('Error loading saved mailboxes:', error);
    }
  };

  // 更新保存的邮箱列表
  const updateSavedMailboxes = (mailbox: Mailbox) => {
    try {
      const now = Date.now() / 1000;
      
      // 获取当前保存的邮箱
      let mailboxes: Mailbox[] = [];
      try {
        const savedData = localStorage.getItem('savedMailboxes');
        if (savedData) {
          mailboxes = JSON.parse(savedData) as Mailbox[];
        }
      } catch (error) {
        console.error('Error parsing saved mailboxes:', error);
      }
      
      // 过滤掉已过期的邮箱
      mailboxes = mailboxes.filter(m => m.expiresAt > now);
      
      // 检查当前邮箱是否已在列表中
      const mailboxIndex = mailboxes.findIndex(m => m.address === mailbox.address);
      
      if (mailboxIndex >= 0) {
        // 更新现有邮箱
        mailboxes[mailboxIndex] = mailbox;
      } else {
        // 添加新邮箱
        mailboxes.push(mailbox);
      }
      
      // 更新状态和本地存储
      setSavedMailboxes(mailboxes);
      localStorage.setItem('savedMailboxes', JSON.stringify(mailboxes));
    } catch (error) {
      console.error('Error updating saved mailboxes:', error);
    }
  };

  // 切换到选择的邮箱
  const handleSwitchMailbox = (mailbox: Mailbox) => {
    onSwitchMailbox(mailbox);
    setShowDropdown(false);
    // feat: 切换邮箱也给出提示
    showSuccessMessage(t('mailbox.switchSuccess'));
  };

  // 删除单个已保存的邮箱
  const handleDeleteMailbox = async () => {
    if (!mailboxToDelete) {
      return;
    }

    setIsDeletingMailbox(true);
    const result = await apiDeleteMailbox(mailboxToDelete);
    setIsDeletingMailbox(false);

    if (result.success) {
      const updatedMailboxes = savedMailboxes.filter(m => m.address !== mailboxToDelete);
      setSavedMailboxes(updatedMailboxes);
      localStorage.setItem('savedMailboxes', JSON.stringify(updatedMailboxes));
      showSuccessMessage(t('mailbox.deleteSavedSuccess'));
    } else {
      showErrorMessage(t('mailbox.deleteFailed'));
    }

    setMailboxToDelete(null);
  };

  // 清空所有已保存的邮箱
  const handleClearAllMailboxes = async () => {
    const mailboxesToDelete = savedMailboxes.filter(m => m.address !== currentMailbox.address);

    if (mailboxesToDelete.length === 0) {
      setShowDropdown(false);
      setShowClearAllDialog(false);
      return;
    }

    setIsClearingAll(true);

    const deletePromises = mailboxesToDelete.map(m => apiDeleteMailbox(m.address));
    const results = await Promise.allSettled(deletePromises);

    const currentMailboxToKeep = savedMailboxes.find(m => m.address === currentMailbox.address);
    const mailboxesToKeep = currentMailboxToKeep ? [currentMailboxToKeep] : [];

    setSavedMailboxes(mailboxesToKeep);
    localStorage.setItem('savedMailboxes', JSON.stringify(mailboxesToKeep));
    setShowDropdown(false);
    setShowClearAllDialog(false);
    setIsClearingAll(false);

    const failedCount = results.filter(r => r.status === 'rejected').length;
    if (failedCount > 0) {
      showErrorMessage(t('mailbox.clearAllFailed', { count: failedCount }));
    } else {
      showSuccessMessage(t('mailbox.clearAllSuccess'));
    }
  };


  // 如果没有保存的邮箱或者只有当前邮箱，不显示切换按钮
  if (savedMailboxes.length <= 1) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="w-8 h-8 flex items-center justify-center rounded-md transition-all duration-200 hover:bg-primary/20 hover:text-primary hover:scale-110 mr-1"
        aria-label={t('mailbox.switch') || "切换邮箱"}
        title={t('mailbox.switch') || "切换邮箱"}
      >
        <i className="fas fa-exchange-alt text-sm"></i>
      </button>

      {showDropdown && (
        // [fix]: 将 bg-white 替换为 bg-popover 和 text-popover-foreground 以支持黑暗模式
        <div className="absolute top-9 left-0 bg-popover text-popover-foreground border rounded-md shadow-lg p-1 z-20 min-w-[250px]">
          <div className="text-xs font-medium px-2 py-1 text-muted-foreground flex justify-between items-center">
            {t('mailbox.savedMailboxes') || "已保存的邮箱"}
            <button
              onClick={() => setShowClearAllDialog(true)}
              className="text-red-500 hover:text-red-700 text-xs"
              title={t('mailbox.clearAll') || "全部清除"}
            >
              <i className="fas fa-trash-alt mr-1"></i>
              {t('mailbox.clearAll') || "全部清除"}
            </button>
          </div>
          <div className="max-h-[400px] overflow-y-auto">
            {savedMailboxes.map((m) => (
              <div key={m.address} className="flex items-center justify-between hover:bg-muted rounded-sm">
                <button
                  onClick={() => handleSwitchMailbox(m)}
                  className={`w-full text-left text-sm px-2 py-1.5 transition-colors truncate ${
                    m.address === currentMailbox.address ? 'bg-primary/10 text-primary font-medium' : ''
                  }`}
                >
                  {m.address}
                </button>
                {m.address !== currentMailbox.address && (
                  <button
                    onClick={() => setMailboxToDelete(m.address)}
                    className="p-2 text-red-500 hover:text-red-700"
                    title={t('common.delete') || "删除"}
                  >
                    <i className="fas fa-trash-alt text-xs"></i>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={Boolean(mailboxToDelete)}
        title={t('mailbox.deleteDialogTitle')}
        description={t('mailbox.confirmDeleteMailbox')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteMailbox}
        onCancel={() => setMailboxToDelete(null)}
        isLoading={isDeletingMailbox}
        loadingText={t('ui.deleting')}
        variant="danger"
      />

      <ConfirmDialog
        isOpen={showClearAllDialog}
        title={t('mailbox.clearAllDialogTitle')}
        description={t('mailbox.confirmClearAllMailboxes')}
        confirmText={t('mailbox.clearAll')}
        cancelText={t('common.cancel')}
        onConfirm={handleClearAllMailboxes}
        onCancel={() => setShowClearAllDialog(false)}
        isLoading={isClearingAll}
        variant="danger"
      />
    </div>
  );
};

export default MailboxSwitcher;
