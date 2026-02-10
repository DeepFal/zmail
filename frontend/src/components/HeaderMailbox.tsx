import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { createRandomMailbox, createCustomMailbox, getMailbox } from '../utils/api';
import MailboxSwitcher from './MailboxSwitcher';
import { MailboxContext } from '../contexts/MailboxContext';

interface HeaderMailboxProps {
  mailbox: Mailbox | null;
  onMailboxChange: (mailbox: Mailbox) => void;
  domain: string;
  domains: string[];
  isLoading: boolean;
}

const DOMAIN_MAILBOX_CACHE_KEY = 'domainMailboxCache';

type DomainMailboxCache = Record<string, Mailbox>;

function getDomainFromAddress(address: string): string | null {
  const parts = address.split('@');
  if (parts.length !== 2 || !parts[1]) {
    return null;
  }
  return parts[1].trim().toLowerCase();
}

function readDomainMailboxCache(): DomainMailboxCache {
  try {
    const cachedData = localStorage.getItem(DOMAIN_MAILBOX_CACHE_KEY);
    if (!cachedData) {
      return {};
    }

    const parsed = JSON.parse(cachedData) as DomainMailboxCache;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeDomainMailboxCache(cache: DomainMailboxCache): void {
  try {
    localStorage.setItem(DOMAIN_MAILBOX_CACHE_KEY, JSON.stringify(cache));
  } catch {
    // ignore localStorage exceptions
  }
}

function rememberMailboxByDomain(mailbox: Mailbox): void {
  const domain = getDomainFromAddress(mailbox.address);
  if (!domain) {
    return;
  }

  const cache = readDomainMailboxCache();
  cache[domain] = mailbox;
  writeDomainMailboxCache(cache);
}

function getCachedMailboxByDomain(domain: string): Mailbox | null {
  const normalizedDomain = domain.trim().toLowerCase();
  if (!normalizedDomain) {
    return null;
  }

  const cache = readDomainMailboxCache();
  const cachedMailbox = cache[normalizedDomain];
  if (!cachedMailbox) {
    return null;
  }

  const now = Date.now() / 1000;
  if (!cachedMailbox.address || cachedMailbox.expiresAt <= now) {
    delete cache[normalizedDomain];
    writeDomainMailboxCache(cache);
    return null;
  }

  return cachedMailbox;
}

function removeCachedMailboxByDomain(domain: string): void {
  const normalizedDomain = domain.trim().toLowerCase();
  if (!normalizedDomain) {
    return;
  }

  const cache = readDomainMailboxCache();
  if (cache[normalizedDomain]) {
    delete cache[normalizedDomain];
    writeDomainMailboxCache(cache);
  }
}

// Internal Component: Modern Custom Domain Selector
interface DomainSelectorProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const DomainSelector: React.FC<DomainSelectorProps> = ({ value, options, onChange, disabled, className = "" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (option: string) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors outline-none select-none
          ${isOpen ? 'bg-muted/50 text-foreground' : 'text-muted-foreground hover:text-foreground'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <span className="font-mono text-sm font-medium">{value}</span>
        <i className={`fas fa-chevron-down text-[10px] opacity-50 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 z-50 origin-top-right">
          <div className="bg-popover/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-1 animate-in fade-in zoom-in-95 duration-200">
            <div className="max-h-[240px] overflow-y-auto py-1 custom-scrollbar">
              {options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full text-left px-3 py-2 text-sm rounded-lg transition-colors font-mono
                    ${option === value 
                      ? 'bg-primary/10 text-primary font-medium' 
                      : 'text-foreground/80 hover:bg-muted hover:text-foreground'
                    }
                  `}
                >
                  <div className="flex justify-between items-center">
                    <span>{option}</span>
                    {option === value && <i className="fas fa-check text-xs"></i>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const HeaderMailbox: React.FC<HeaderMailboxProps> = ({ 
  mailbox, 
  onMailboxChange,
  domain,
  domains,
  isLoading
}) => {
  const { t } = useTranslation();
  const { showSuccessMessage, showErrorMessage } = useContext(MailboxContext);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customAddress, setCustomAddress] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(domain);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [customAddressError, setCustomAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (mailbox?.address?.includes('@')) {
      setSelectedDomain(mailbox.address.split('@')[1]);
      return;
    }
    setSelectedDomain(domain);
  }, [domain, mailbox]);

  useEffect(() => {
    if (!mailbox) {
      return;
    }

    rememberMailboxByDomain(mailbox);
  }, [mailbox]);
  
  if (!mailbox || isLoading) return null;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(mailbox.address)
      .then(() => showSuccessMessage(t('mailbox.copySuccess')))
      .catch(() => showErrorMessage(t('mailbox.copyFailed')));
  };
  
  const handleRefreshMailbox = async () => {
    setIsActionLoading(true);
    const result = await createRandomMailbox(24, selectedDomain);
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      rememberMailboxByDomain(result.mailbox);
      showSuccessMessage(t('mailbox.refreshSuccess'));
    } else {
      showErrorMessage(t('mailbox.refreshFailed'));
    }
  };
  
  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomAddressError(null);
    
    if (!customAddress.trim()) {
      setCustomAddressError(t('mailbox.invalidAddress'));
      return;
    }
    
    setIsActionLoading(true);
    const result = await createCustomMailbox(customAddress, selectedDomain);
    setIsActionLoading(false);
    
    if (result.success && result.mailbox) {
      onMailboxChange(result.mailbox);
      rememberMailboxByDomain(result.mailbox);
      showSuccessMessage(t('mailbox.createSuccess'));
      setTimeout(() => {
        setIsCustomMode(false);
        setCustomAddress('');
      }, 500);
    } else {
      const isAddressExistsError = String(result.error).includes('已存在') || String(result.error).includes('Address already exists');
      if (isAddressExistsError) {
        setCustomAddressError(t('mailbox.addressExists'));
      } else {
        showErrorMessage(t('mailbox.createFailed'));
      }
    }
  };
  
  const handleCancelCustom = () => {
    setIsCustomMode(false);
    setCustomAddress('');
    setCustomAddressError(null);
  };
  
  const handleDomainChange = async (newDomain: string) => {
    const normalizedDomain = newDomain.trim().toLowerCase();
    setSelectedDomain(normalizedDomain);
    
    // 如果不在自定义模式下，切换域名自动刷新邮箱
    if (!isCustomMode) {
      const currentDomain = mailbox.address.includes('@') ? mailbox.address.split('@')[1].toLowerCase() : '';
      if (currentDomain === normalizedDomain) {
        return;
      }

      const cachedMailbox = getCachedMailboxByDomain(normalizedDomain);
      if (cachedMailbox) {
        setIsActionLoading(true);
        const validationResult = await getMailbox(cachedMailbox.address);
        setIsActionLoading(false);

        if (validationResult.success && validationResult.mailbox) {
          onMailboxChange(validationResult.mailbox);
          showSuccessMessage(t('mailbox.switchSuccess'));
          return;
        }

        removeCachedMailboxByDomain(normalizedDomain);
      }

      setIsActionLoading(true);
      const result = await createRandomMailbox(24, normalizedDomain);
      setIsActionLoading(false);

      if (result.success && result.mailbox) {
        onMailboxChange(result.mailbox);
        rememberMailboxByDomain(result.mailbox);
        showSuccessMessage(t('mailbox.refreshSuccess'));
      } else {
        showErrorMessage(t('mailbox.refreshFailed'));
      }
    }
  };

  // Common button styles
  const actionBtnClass = "w-8 h-8 flex items-center justify-center rounded-full text-muted-foreground hover:bg-background/80 hover:text-foreground hover:shadow-sm transition-all duration-200 active:scale-90 active:bg-background";

  return (
    <div className="flex w-full items-center perspective-1000">
      {isCustomMode ? (
        <form 
          onSubmit={handleCreateCustom} 
          className="flex w-full flex-wrap items-center gap-1 bg-muted/50 rounded-2xl border border-primary/20 ring-2 ring-primary/10 px-2 py-1.5 animate-in fade-in zoom-in-95 duration-200 origin-left sm:w-auto sm:flex-nowrap sm:rounded-full sm:px-1 sm:py-0.5"
        >
          <div className="flex min-w-0 flex-1 items-center pl-2 pr-1 sm:pl-3 max-[360px]:w-full">
            <input
              type="text"
              value={customAddress}
              onChange={(e) => {
                setCustomAddress(e.target.value);
                if (customAddressError) setCustomAddressError(null);
              }}
              className={`min-w-0 flex-1 bg-transparent text-sm font-medium focus:outline-none placeholder:text-muted-foreground/50 transition-colors sm:w-32 sm:flex-none ${
                customAddressError ? 'text-red-500 placeholder:text-red-300' : 'text-foreground'
              }`}
              placeholder={t('mailbox.customAddressPlaceholder')}
              disabled={isActionLoading}
              autoFocus
            />
            <span className="text-muted-foreground text-sm font-mono mx-0.5">@</span>
            
            {/* Custom Domain Selector */}
            <DomainSelector 
              value={selectedDomain}
              options={domains}
              onChange={setSelectedDomain} // 自定义模式下切换域名不刷新邮箱
              disabled={isActionLoading}
              className="min-w-[96px]"
            />
          </div>
          
          <div className="ml-auto flex items-center justify-end gap-1 rounded-full bg-background/50 p-0.5 max-[360px]:w-full sm:ml-1">
             <button
              type="button"
              onClick={handleCancelCustom}
              className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-all duration-200 active:scale-90"
              disabled={isActionLoading}
            >
              <i className="fas fa-times text-xs"></i>
            </button>
            <button
              type="submit"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all duration-200 active:scale-90"
              disabled={isActionLoading}
            >
              {isActionLoading ? <i className="fas fa-circle-notch fa-spin text-xs"></i> : <i className="fas fa-check text-xs"></i>}
            </button>
          </div>
        </form>
      ) : (
        <div className="flex w-full flex-wrap items-center bg-slate-100/80 dark:bg-neutral-800/60 rounded-2xl border border-border/50 shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5 hover:border-border/80 transition-all duration-300 ease-out backdrop-blur-sm sm:w-auto sm:flex-nowrap sm:items-center sm:rounded-full">
           {/* Address Display */}
           <div className="flex min-w-0 flex-1 items-center gap-1 px-3 py-1.5 max-[360px]:w-full max-[360px]:border-b max-[360px]:border-border/30 max-[360px]:py-2 sm:border-r sm:border-border/40 sm:pl-4 sm:pr-1.5">
              <span className="min-w-0 truncate font-mono text-sm font-medium tracking-tight text-foreground select-all cursor-text">
                {mailbox.address.split('@')[0]}
              </span>
              <span className="text-muted-foreground/60 text-sm">@</span>
              
              {/* Custom Domain Selector */}
              <DomainSelector 
                value={selectedDomain}
                options={domains}
                onChange={handleDomainChange}
                disabled={isActionLoading}
                className="min-w-[96px]"
              />
           </div>

           {/* Command Actions */}
           <div className="ml-auto flex items-center justify-end gap-0.5 px-1.5 py-0.5 max-[360px]:w-full max-[360px]:pt-1 sm:py-0">
              <button 
                onClick={copyToClipboard}
                className={actionBtnClass}
                title={t('common.copy')}
              >
                <i className="fas fa-copy text-xs transform group-hover:scale-110 transition-transform"></i>
              </button>

              <button
                onClick={handleRefreshMailbox}
                className={actionBtnClass}
                disabled={isActionLoading}
                title={t('mailbox.refresh')}
              >
                 <i className={`fas fa-sync-alt text-xs ${isActionLoading ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`}></i>
              </button>

              {/* Mailbox Switcher Integration - Wrapper to enforce style matching */}
              <div className="flex items-center justify-center">
                 <MailboxSwitcher 
                  currentMailbox={mailbox}
                  onSwitchMailbox={onMailboxChange}
                />
              </div>

              <button
                onClick={() => setIsCustomMode(true)}
                className={`${actionBtnClass} text-primary hover:bg-primary hover:text-primary-foreground`}
                disabled={isActionLoading}
                title={t('mailbox.customize')}
              >
                <i className="fas fa-pen text-xs"></i>
              </button>
           </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMailbox;
