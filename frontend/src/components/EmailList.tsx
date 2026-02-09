import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { MailboxContext } from '../contexts/MailboxContext';
import EmailDetail from './EmailDetail';
import ConfirmDialog from './ConfirmDialog';

interface EmailListProps {
  emails: Email[];
  selectedEmailId: string | null;
  onSelectEmail: (id: string | null) => void;
  isLoading: boolean;
}

const EmailList: React.FC<EmailListProps> = ({ 
  emails, 
  selectedEmailId, 
  onSelectEmail,
  isLoading 
}) => {
  const { t } = useTranslation();
  const { autoRefresh, setAutoRefresh, refreshEmails, mailbox, deleteMailbox } = useContext(MailboxContext);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    return new Intl.DateTimeFormat(undefined, {
      month: isToday ? undefined : 'short',
      day: isToday ? undefined : 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const calculateTimeLeft = (expiresAt: number) => {
    if (!expiresAt) return '';
    const now = Math.floor(Date.now() / 1000);
    const timeLeftSeconds = expiresAt - now;
    
    if (timeLeftSeconds <= 0) return t('mailbox.expired');
    
    const hours = Math.floor(timeLeftSeconds / 3600);
    const minutes = Math.floor((timeLeftSeconds % 3600) / 60);
    
    if (hours > 0) return t('mailbox.expiresInTime', { hours, minutes });
    return t('mailbox.expiresInMinutes', { minutes });
  };

  const getInitials = (name: string) => {
    return (name || '?').charAt(0).toUpperCase();
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
      'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
      'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
      'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };
  
  const handleRefresh = () => {
    refreshEmails(true);
  };
  
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };
  
  const handleDeleteMailbox = async () => {
    setIsDeleting(true);
    try {
      await deleteMailbox();
    } catch (error) {
      console.error('Error deleting mailbox:', error);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  if (isLoading || isDeleting) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 shadow-sm h-full flex flex-col p-6">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-border/40">
           <div className="h-6 w-24 bg-muted/50 rounded animate-pulse"></div>
           <div className="flex gap-2">
             <div className="h-8 w-8 bg-muted/50 rounded animate-pulse"></div>
             <div className="h-8 w-8 bg-muted/50 rounded animate-pulse"></div>
           </div>
        </div>
        <div className="space-y-4">
           {[1, 2, 3].map(i => (
             <div key={i} className="flex gap-4 items-center">
               <div className="h-10 w-10 rounded-full bg-muted/50 animate-pulse"></div>
               <div className="flex-1 space-y-2">
                 <div className="h-4 w-1/3 bg-muted/50 rounded animate-pulse"></div>
                 <div className="h-3 w-2/3 bg-muted/30 rounded animate-pulse"></div>
               </div>
             </div>
           ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-border/50 shadow-sm h-full flex flex-col overflow-hidden transition-all duration-300">
      {/* Toolbar Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-border/40 bg-gray-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-foreground tracking-tight">{t('email.inbox')}</h2>
          {emails.length > 0 && (
             <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
               {emails.length}
             </span>
          )}
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
           {/* Auto Refresh Toggle */}
           <button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                : 'bg-muted hover:bg-muted/80 text-muted-foreground'
            }`}
            title={autoRefresh ? t('email.autoRefreshOn') : t('email.autoRefreshOff')}
          >
            <i className={`fas fa-clock ${autoRefresh ? 'animate-pulse' : ''}`}></i>
            <span className="hidden sm:inline">{autoRefresh ? t('email.modeAuto') : t('email.modeManual')}</span>
          </button>

          <div className="h-4 w-px bg-border/60 mx-1"></div>

          <button
            onClick={handleRefresh}
            className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all active:scale-95"
            title={t('email.refresh')}
          >
            <i className="fas fa-sync-alt"></i>
          </button>
          
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-all active:scale-95"
            title={t('mailbox.delete')}
          >
            <i className="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
      
      {/* Mailbox Info Bar */}
      {mailbox && (
        <div className="px-5 py-2 bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100/50 dark:border-blue-900/20 text-xs flex justify-between items-center">
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
             <i className="fas fa-info-circle opacity-70"></i>
             <span className="truncate max-w-[200px] sm:max-w-none">
               {mailbox.address}
             </span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <span>{t('mailbox.expiresInLabel')}</span>
            <span className="font-mono font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-1.5 rounded">
              {calculateTimeLeft(mailbox.expiresAt)}
            </span>
          </div>
        </div>
      )}
      
      {/* Email List Content */}
      <div className="flex-1 overflow-y-auto">
        {emails.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center">
              <i className="fas fa-inbox text-3xl opacity-50"></i>
            </div>
            <div>
               <p className="font-medium text-foreground">{t('email.emptyInbox')}</p>
               <p className="text-sm mt-1 opacity-70">{t('email.waitingForEmails')}</p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-border/40 pb-4">
            {emails.map((email, index) => {
              const isSelected = selectedEmailId === email.id;
              const senderName = email.fromName || email.fromAddress;
              const avatarColor = getRandomColor(senderName);
              
              return (
                <React.Fragment key={email.id}>
                  <li 
                    className={`group transition-all duration-300 ease-out cursor-pointer relative overflow-hidden animate-in slide-in-from-bottom-3 fade-in fill-mode-backwards ${
                      isSelected 
                        ? 'bg-primary/5 dark:bg-primary/10' 
                        : 'hover:bg-muted/40 dark:hover:bg-muted/10 active:scale-[0.99] active:bg-muted/60'
                    } ${!email.isRead ? 'bg-slate-50/50 dark:bg-slate-900/10' : ''}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => onSelectEmail(isSelected ? null : email.id)}
                  >
                    {/* Hover Indicator Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out"></div>

                    <div className="px-5 py-4 flex gap-4 items-start group-hover:translate-x-1 transition-transform duration-300 ease-out">
                      {/* Avatar */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${avatarColor} transform group-hover:scale-110 transition-transform duration-500`}>
                        {getInitials(senderName)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-baseline mb-1">
                           <span className={`truncate text-sm transition-colors duration-300 ${
                             !email.isRead 
                               ? 'font-semibold text-foreground' 
                               : 'font-medium text-foreground/80 group-hover:text-foreground'
                           }`}>
                             {senderName}
                           </span>
                           <span className="text-xs text-muted-foreground whitespace-nowrap ml-2 font-mono opacity-70 group-hover:opacity-100 transition-opacity">
                             {formatDate(email.receivedAt)}
                           </span>
                         </div>
                         <h3 className={`text-sm truncate mb-0.5 transition-colors ${
                           !email.isRead 
                             ? 'font-medium text-foreground' 
                             : 'text-muted-foreground group-hover:text-foreground/80'
                         }`}>
                           {email.subject || t('email.noSubject')}
                         </h3>
                         <div className="text-xs text-muted-foreground/70 truncate group-hover:text-muted-foreground transition-colors">
                           {/* Preview text if available, or just from address */}
                           {email.fromAddress}
                         </div>
                      </div>
                    </div>
                  </li>
                  {/* Expanded Detail View */}
                  {isSelected && (
                    <li className="bg-background border-y border-border/60 animate-in slide-in-from-top-4 fade-in duration-300 ease-out origin-top">
                      <div className="p-2 sm:p-4 bg-muted/20">
                         <div className="rounded-xl border border-border/40 bg-card overflow-hidden shadow-lg ring-1 ring-black/5 dark:ring-white/5">
                            <EmailDetail 
                              emailId={email.id} 
                              onClose={() => onSelectEmail(null)}
                            />
                         </div>
                      </div>
                    </li>
                  )}
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title={t('mailbox.deleteDialogTitle')}
        description={t('mailbox.confirmDelete')}
        confirmText={t('common.delete')}
        cancelText={t('common.cancel')}
        onConfirm={handleDeleteMailbox}
        onCancel={() => setShowDeleteDialog(false)}
        isLoading={isDeleting}
        loadingText={t('ui.deleting')}
        variant="danger"
      />
    </div>
  );
};

export default EmailList; 
