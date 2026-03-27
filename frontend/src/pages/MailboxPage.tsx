import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EmailList from '../components/EmailList';
import EmailDetail from '../components/EmailDetail';
import MailboxInfo from '../components/MailboxInfo';
import { deleteMailbox as apiDeleteMailbox, getMailbox as apiGetMailbox } from '../utils/api';
import { MailboxContext } from '../contexts/MailboxContext';

const MailboxPage: React.FC = () => {
  const { address } = useParams<{ address: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    emails,
    autoRefresh,
    setAutoRefresh,
    setMailbox: setContextMailbox,
    // feat: 从 context 中获取全局通知函数
    showSuccessMessage,
    showErrorMessage
  } = useContext(MailboxContext);

  const [mailbox, setMailbox] = useState<Mailbox | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 获取邮箱信息
  useEffect(() => {
    if (!address) return;
    
    const fetchMailbox = async () => {
      try {
        setIsLoading(true);
        const result = await apiGetMailbox(address);

        if (result.success && result.mailbox) {
          setMailbox(result.mailbox);
          setContextMailbox(result.mailbox);
          return;
        }

        if (result.error === 'Mailbox not found') {
          showErrorMessage(t('mailbox.invalidAddress'));
          setTimeout(() => {
            navigate('/');
          }, 3000);
          return;
        }

        throw new Error(String(result.error || 'Failed to fetch mailbox'));
      } catch (error) {
        // fix: 使用全局通知函数
        showErrorMessage(String(error));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMailbox();
  }, [address, navigate, t, showErrorMessage, setContextMailbox]);
  
  // 处理删除邮箱
  const handleDeleteMailbox = async () => {
    if (!address) return;
    
    try {
      const result = await apiDeleteMailbox(address);

      if (result.success) {
        // fix: 使用全局通知函数
        showSuccessMessage(t('mailbox.deleteSuccess'));

        // 2秒后导航到首页
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(String(result.error || 'Unknown error'));
      }
    } catch (error) {
      // fix: 使用全局通知函数
      showErrorMessage(t('mailbox.deleteFailed'));
    }
  };
  
  return (
    <div className="flex flex-col space-y-6">
      {/* fix: 移除局部的错误和成功提示 */}
      
      {mailbox && (
        <MailboxInfo 
          mailbox={mailbox} 
          onDelete={handleDeleteMailbox}
          autoRefresh={autoRefresh}
          onToggleAutoRefresh={() => setAutoRefresh(!autoRefresh)}
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <EmailList 
            emails={emails} 
            selectedEmailId={selectedEmail}
            onSelectEmail={setSelectedEmail}
            isLoading={isLoading}
          />
        </div>
        <div className="md:col-span-2">
          {selectedEmail ? (
            <EmailDetail 
              emailId={selectedEmail} 
              onClose={() => setSelectedEmail(null)}
            />
          ) : (
            <div className="border rounded-lg p-6 h-full flex items-center justify-center">
              <p className="text-muted-foreground text-center">
                {emails.length > 0 
                  ? t('email.selectEmailPrompt') 
                  : t('email.emptyInbox')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MailboxPage; 