import React, { useState, useEffect, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from '../config';
import { MailboxContext } from '../contexts/MailboxContext';

interface EmailDetailProps {
  emailId: string;
  onClose: () => void;
}

interface Attachment {
  id: string;
  emailId: string;
  filename: string;
  mimeType: string;
  size: number;
  createdAt: number;
  isLarge: boolean;
  chunksCount: number;
}

const EmailDetail: React.FC<EmailDetailProps> = ({ emailId, onClose }) => {
  const { t } = useTranslation();
  const { emailCache, addToEmailCache, handleMailboxNotFound, showErrorMessage, showSuccessMessage } = useContext(MailboxContext);
  const [email, setEmail] = useState<Email | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAttachments, setIsLoadingAttachments] = useState(false);
  
  useEffect(() => {
    const fetchEmail = async () => {
      try {
        if (emailCache[emailId]) {
          setEmail(emailCache[emailId].email);
          setAttachments(emailCache[emailId].attachments);
          setIsLoading(false);
          return;
        }
        
        setIsLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            await handleMailboxNotFound();
            onClose();
            return;
          }
          throw new Error('Failed to fetch email');
        }
        
        const data = await response.json();
        if (data.success) {
          setEmail(data.email);
          if (data.email.hasAttachments) {
            await fetchAttachments(emailId, data.email);
          } else {
            addToEmailCache(emailId, data.email, []);
          }
        } else {
          throw new Error(data.error || 'Unknown error');
        }
      } catch (error) {
        showErrorMessage(t('email.fetchFailed'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEmail();
  }, [emailId, t, emailCache, addToEmailCache, handleMailboxNotFound, onClose, showErrorMessage]);
  
  const fetchAttachments = async (emailId: string, emailData?: Email) => {
    try {
      setIsLoadingAttachments(true);
      const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}/attachments`);
      
      if (!response.ok) {
        if (response.status === 404) {
          await handleMailboxNotFound();
          onClose();
          return;
        }
        throw new Error('Failed to fetch attachments');
      }
      
      const data = await response.json();
      if (data.success) {
        setAttachments(data.attachments);
        if (emailData) {
          addToEmailCache(emailId, emailData, data.attachments);
        }
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setIsLoadingAttachments(false);
    }
  };
  
  const handleDelete = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/emails/${emailId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete email');
      }
      
      const data = await response.json();
      if (data.success) {
        showSuccessMessage(t('email.deleteSuccess'));
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error) {
      showErrorMessage(t('email.deleteFailed'));
    }
  };
  
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return new Intl.DateTimeFormat(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  const getFileType = (mimeType: string): string => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('text/')) return 'text';
    return 'file';
  };
  
  const getFileIcon = (mimeType: string): string => {
    const fileType = getFileType(mimeType);
    switch (fileType) {
      case 'image': return 'fa-file-image';
      case 'video': return 'fa-file-video';
      case 'audio': return 'fa-file-audio';
      case 'pdf': return 'fa-file-pdf';
      case 'text': return 'fa-file-alt';
      default: return 'fa-file';
    }
  };
  
  const getAttachmentUrl = (attachmentId: string, download: boolean = false): string => {
    return `${API_BASE_URL}/api/attachments/${attachmentId}${download ? '?download=true' : ''}`;
  };
  
  const renderAttachmentPreview = (attachment: Attachment) => {
    const fileType = getFileType(attachment.mimeType);
    const attachmentUrl = getAttachmentUrl(attachment.id, true);
    
    switch (fileType) {
      case 'image':
        return (
          <div className="mt-3 bg-muted/30 rounded-lg overflow-hidden border border-border/50">
            <img 
              src={attachmentUrl} 
              alt={attachment.filename} 
              className="max-w-full max-h-[400px] object-contain mx-auto"
            />
          </div>
        );
      case 'video':
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-border/50">
            <video 
              src={attachmentUrl} 
              controls 
              className="w-full max-h-[400px]"
            >
              {t('email.videoNotSupported')}
            </video>
          </div>
        );
      case 'audio':
        return (
          <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-border/50">
            <audio src={attachmentUrl} controls className="w-full" />
          </div>
        );
      case 'pdf':
        return (
          <div className="mt-3 rounded-lg overflow-hidden border border-border/50">
            <iframe 
              src={attachmentUrl} 
              className="w-full h-[500px]"
              title={attachment.filename}
            />
          </div>
        );
      default:
        return null;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="text-sm text-muted-foreground">Loading message content...</p>
      </div>
    );
  }

  if (!email) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">{t('email.notFound')}</p>
      </div>
    );
  }
  
  return (
    <div className="bg-card text-card-foreground">
      {/* Header */}
      <div className="p-6 border-b border-border/40">
        <div className="flex justify-between items-start gap-4">
           <div className="flex-1 min-w-0">
             <h2 className="text-xl sm:text-2xl font-bold leading-tight mb-3 text-foreground">
               {email.subject || t('email.noSubject')}
             </h2>
             <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                   <span className="font-medium text-foreground">{email.fromName || email.fromAddress}</span>
                   <span className="opacity-60">&lt;{email.fromAddress}&gt;</span>
                </div>
                <span className="hidden sm:inline opacity-40">|</span>
                <span className="opacity-80">{formatDate(email.receivedAt)}</span>
             </div>
             <div className="mt-1 text-xs text-muted-foreground/70">
                To: {email.toAddress}
             </div>
           </div>
           
           <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleDelete}
                className="p-2 rounded-lg text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 transition-colors"
                title={t('common.delete')}
              >
                <i className="fas fa-trash-alt"></i>
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                title={t('common.close')}
              >
                <i className="fas fa-times text-lg"></i>
              </button>
           </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 overflow-x-auto">
        {email.htmlContent ? (
          <div 
            className="prose prose-sm sm:prose max-w-none dark:prose-invert prose-a:text-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: email.htmlContent }}
          />
        ) : email.textContent ? (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
            {email.textContent}
          </pre>
        ) : (
          <p className="text-muted-foreground italic text-center py-8">
            {t('email.noContent')}
          </p>
        )}
      </div>
      
      {/* Attachments */}
      {email.hasAttachments && (
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center gap-2 mb-4">
            <i className="fas fa-paperclip text-muted-foreground"></i>
            <h3 className="font-medium text-sm text-foreground">
              {attachments.length} {t('email.attachments')} 
            </h3>
            {isLoadingAttachments && (
               <div className="animate-spin h-3 w-3 border-b-2 border-primary rounded-full"></div>
            )}
          </div>
          
          <div className="grid grid-cols-1 gap-4">
            {attachments.map(attachment => (
              <div key={attachment.id} className="bg-muted/20 border border-border/50 rounded-xl p-4 transition-all hover:bg-muted/40">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                       <i className={`fas ${getFileIcon(attachment.mimeType)} text-lg`}></i>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate pr-2" title={attachment.filename}>{attachment.filename}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{formatFileSize(attachment.size)}</p>
                    </div>
                  </div>
                  <a 
                    href={getAttachmentUrl(attachment.id, true)}
                    download={attachment.filename}
                    className="flex-shrink-0 px-3 py-1.5 bg-background border border-border hover:bg-muted hover:text-primary rounded-md text-xs font-medium transition-colors shadow-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="fas fa-download mr-1.5"></i>
                    {t('email.download')}
                  </a>
                </div>
                
                {/* Preview rendered below */}
                {renderAttachmentPreview(attachment)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailDetail; 