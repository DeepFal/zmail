import React, { useContext, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Header from './Header';
import SEO from './SEO';
import { MailboxContext } from '../contexts/MailboxContext';
import InfoModal from './InfoModal';

const Layout: React.FC = () => {
  const { mailbox, setMailbox, isLoading } = useContext(MailboxContext);
  const location = useLocation();
  
  // 添加状态来管理弹窗的显示和内容
  const [infoModal, setInfoModal] = useState<{
    isOpen: boolean;
    type: 'privacy' | 'terms' | 'about' | null;
  }>({ isOpen: false, type: null });

  // 打开弹窗的函数
  const handleShowInfo = (type: 'privacy' | 'terms' | 'about') => {
    setInfoModal({ isOpen: true, type });
  };

  // 关闭弹窗的函数
  const handleCloseInfo = () => {
    setInfoModal({ isOpen: false, type: null });
  };
  
  // 根据当前路径设置不同的SEO信息
  const getSEOProps = () => {
    // 默认SEO属性
    const defaultProps = {
      title: 'ZMAIL-24小时匿名邮箱',
      description: '创建临时邮箱地址，接收邮件，无需注册，保护您的隐私安全',
      keywords: '临时邮箱,匿名邮箱,一次性邮箱,隐私保护,电子邮件,ZMAIL',
    };
    
    // 如果有邮箱信息，添加到标题中
    if (mailbox) {
      return {
        ...defaultProps,
        title: `ZMAIL-24小时匿名邮箱`,
        description: `查看 ${mailbox.address} 的临时邮箱收件箱，接收邮件，无需注册，保护您的隐私安全`,
      };
    }
    
    return defaultProps;
  };
  
  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-neutral-950 transition-colors duration-300 overflow-x-hidden">
      <SEO {...getSEOProps()} />
      <div className="flex-none z-10 shadow-sm relative w-full">
        <Header 
          mailbox={mailbox} 
          onMailboxChange={setMailbox} 
          isLoading={isLoading}
          onShowInfo={handleShowInfo}
        />
      </div>
      <main className="flex-1 overflow-y-auto overflow-x-hidden scroll-smooth w-full">
        <div className="h-full w-full max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
      
      {/* 渲染弹窗组件 */}
      <InfoModal 
        isOpen={infoModal.isOpen} 
        onClose={handleCloseInfo} 
        type={infoModal.type} 
      />
    </div>
  );
};

export default Layout; 