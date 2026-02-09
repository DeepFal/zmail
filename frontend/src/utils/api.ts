import { API_BASE_URL } from "../config";

// ============================================================================
// MOCK DATA CONFIGURATION (仅在开发环境生效)
// ============================================================================
const IS_DEV = import.meta.env.DEV;
const FORCE_MOCK = false; // 设置为 true 强制开启模拟数据
const USE_MOCK_DATA = IS_DEV && FORCE_MOCK;

// 模拟数据对象
const MOCK_MAILBOX: Mailbox = {
  id: 'mock-id-123',
  address: 'demo@example.com',
  createdAt: Date.now() / 1000,
  expiresAt: (Date.now() / 1000) + 86400, // 24小时后过期
  lastAccessed: Date.now() / 1000,
  ipAddress: '127.0.0.1'
};

const MOCK_EMAILS: Email[] = [
  {
    id: 'email-1',
    mailboxId: 'mock-id-123',
    fromAddress: 'notifications@github.com',
    fromName: 'GitHub',
    toAddress: 'demo@example.com',
    subject: '[GitHub] A new security alert was found in your repository',
    receivedAt: (Date.now() / 1000) - 120, // 2分钟前
    isRead: false,
    hasAttachments: false,
  },
  {
    id: 'email-2',
    mailboxId: 'mock-id-123',
    fromAddress: 'billing@stripe.com',
    fromName: 'Stripe',
    toAddress: 'demo@example.com',
    subject: 'Invoice #30F921-0001 for $10.00',
    receivedAt: (Date.now() / 1000) - 3600, // 1小时前
    isRead: true,
    hasAttachments: true // 模拟有附件
  },
  {
    id: 'email-3',
    mailboxId: 'mock-id-123',
    fromAddress: 'newsletter@design.io',
    fromName: 'Design Daily',
    toAddress: 'demo@example.com',
    subject: 'Top 10 UI Trends for 2026',
    receivedAt: (Date.now() / 1000) - 86400, // 1天前
    isRead: true,
    hasAttachments: false
  }
];

const MOCK_DETAILS: Record<string, { email: Email, attachments: any[] }> = {
  'email-1': {
    email: {
      ...MOCK_EMAILS[0],
      htmlContent: `
        <div style="font-family: sans-serif; color: #333;">
          <h2 style="color: #24292f;">Security Alert</h2>
          <p>We found a potential security vulnerability in one of your dependencies.</p>
          <div style="background: #f6f8fa; padding: 16px; border-radius: 6px; border: 1px solid #d0d7de;">
            <strong>Package:</strong> lodash<br/>
            <strong>Severity:</strong> High
          </div>
          <p>Please update your dependencies as soon as possible.</p>
          <button style="background: #2da44e; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">View Alert</button>
        </div>
      `,
      textContent: "Security Alert: We found a potential security vulnerability..."
    },
    attachments: []
  },
  'email-2': {
    email: {
      ...MOCK_EMAILS[1],
      htmlContent: `
        <div style="font-family: sans-serif;">
          <h1>Invoice</h1>
          <p>Thanks for your business. Here is your invoice for the recent period.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <table style="width: 100%; text-align: left;">
            <tr><th>Item</th><th style="text-align: right;">Amount</th></tr>
            <tr><td>Pro Plan (Monthly)</td><td style="text-align: right;">$10.00</td></tr>
            <tr><td><strong>Total</strong></td><td style="text-align: right;"><strong>$10.00</strong></td></tr>
          </table>
        </div>
      `,
      textContent: "Invoice for $10.00"
    },
    attachments: [
      {
        id: 'att-1',
        emailId: 'email-2',
        filename: 'invoice_feb_2026.pdf',
        mimeType: 'application/pdf',
        size: 1024 * 500, // 500KB
        createdAt: Date.now() / 1000
      }
    ]
  },
  'email-3': {
    email: {
      ...MOCK_EMAILS[2],
      htmlContent: `<p>Here are the top design trends...</p>`,
      textContent: "Here are the top design trends..."
    },
    attachments: []
  }
};

// ============================================================================
// API IMPLEMENTATION
// ============================================================================

// API请求基础URL
const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

// 创建随机邮箱
export const createRandomMailbox = async (expiresInHours = 24, domain?: string) => {
  // MOCK INTERCEPTION
  if (USE_MOCK_DATA) {
    console.log('📦 [MOCK] Creating Random Mailbox');
    const localPart = `demo${Math.floor(Math.random() * 9999)}`;
    const selectedDomain = (domain || 'example.com').trim().toLowerCase();
    return {
      success: true,
      mailbox: {
        ...MOCK_MAILBOX,
        address: `${localPart}@${selectedDomain}`,
        createdAt: Date.now() / 1000,
        expiresAt: (Date.now() / 1000) + 86400,
        lastAccessed: Date.now() / 1000,
      }
    };
  }

  try {
    const requestBody = JSON.stringify({
      expiresInHours,
      domain,
    });
    
    const response = await fetch(apiUrl('/api/mailboxes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });
    
    if (!response.ok) {
      throw new Error('Failed to create mailbox');
    }
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, mailbox: data.mailbox };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    return { success: false, error };
  }
};

// 创建自定义邮箱
export const createCustomMailbox = async (address: string, domain: string, expiresInHours = 24) => {
  // MOCK INTERCEPTION
  if (USE_MOCK_DATA) {
    console.log('📦 [MOCK] Creating Custom Mailbox:', address);
    const normalizedAddress = address.includes('@') ? address : `${address}@${domain}`;
    return { 
      success: true, 
      mailbox: { ...MOCK_MAILBOX, address: normalizedAddress } 
    };
  }

  try {
    if (!address.trim()) {
      return { success: false, error: 'Invalid address' };
    }
    
    const normalizedAddress = address.trim();

    const response = await fetch(apiUrl('/api/mailboxes'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        address: normalizedAddress,
        domain,
        expiresInHours,
      }),
    });
    
    // 尝试解析响应内容
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 400) {
        // 使用后端返回的错误信息
        return { success: false, error: data.error || 'Address already exists' };
      }
      throw new Error(data.error || 'Failed to create mailbox');
    }
    
    if (data.success) {
      return { success: true, mailbox: data.mailbox };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error creating custom mailbox:', error);
    return { success: false, error };
  }
};

// 获取邮箱信息
export const getMailbox = async (address: string) => {
  // MOCK INTERCEPTION
  if (USE_MOCK_DATA) {
    return { success: true, mailbox: { ...MOCK_MAILBOX, address } };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(apiUrl(`/api/mailboxes/${encodedAddress}`));
    
    if (!response.ok) {
      if (response.status === 404) {
        return { success: false, error: 'Mailbox not found' };
      }
      throw new Error('Failed to fetch mailbox');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true, mailbox: data.mailbox };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error fetching mailbox:', error);
    return { success: false, error };
  }
};

// 获取邮件列表
export const getEmails = async (address: string) => {
  // MOCK INTERCEPTION
  if (USE_MOCK_DATA) {
    console.log('📨 [MOCK] Fetching Emails');
    return { success: true, emails: MOCK_EMAILS };
  }

  try {
    // 检查地址是否为空
    if (!address) {
      return { success: false, error: 'Address is empty', emails: [] };
    }
    
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(apiUrl(`/api/mailboxes/${encodedAddress}/emails`));
    
    // 直接处理404状态码
    if (response.status === 404) {
      return { success: false, error: 'Mailbox not found', notFound: true };
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.success) {
      return { success: true, emails: data.emails };
    } else {
      // 检查错误信息是否包含"邮箱不存在"
      if (data.error && (data.error.includes('邮箱不存在') || data.error.includes('Mailbox not found'))) {
        return { success: false, error: data.error, notFound: true };
      }
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    return { success: false, error, emails: [] };
  }
};

// 获取邮件详情 (模拟，因为原文件没有导出 getEmail，这里我们需要处理 EmailDetail 组件可能直接调用的 API)
// 注意：原 api.ts 中没有导出 getEmail，而是 EmailDetail 组件直接 fetch。
// 为了支持 Mock，我们需要拦截全局 fetch 或者修改 EmailDetail。
// 鉴于目前修改的是 api.ts，我们只能拦截通过 api.ts 导出的方法。
// 
// [Wait] 上一步看了 EmailDetail.tsx，它是直接调用 fetch 的。
// 为了让 EmailDetail 也能用 Mock 数据，我需要在这里添加一个 getEmail Helper，
// 并在 EmailDetail 中使用它，或者我们简单一点：
// **我将修改 EmailDetail.tsx 让它也支持 Mock 模式**，或者在这里劫持全局 fetch（太暴力）。
// 
// 更好的方案：既然我已经修改了 Layout/EmailList，用户主要是看列表效果。
// 如果用户点击详情，EmailDetail 里的 fetch 会失败。
// 
// 为了完美体验，我建议把 EmailDetail 里的 fetch 逻辑也抽取到 api.ts 中。
// 让我先完成 api.ts 的基础部分，然后再为了 Mock 完善一下 EmailDetail 的调用。

export const deleteMailbox = async (address: string) => {
  if (USE_MOCK_DATA) {
    return { success: true };
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(apiUrl(`/api/mailboxes/${encodedAddress}`), {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete mailbox');
    }
    
    const data = await response.json();
    if (data.success) {
      return { success: true };
    } else {
      throw new Error(data.error || 'Unknown error');
    }
  } catch (error) {
    console.error('Error deleting mailbox:', error);
    return { success: false, error };
  }
};

// ============================================================================
// NEW HELPER FUNCTIONS FOR EMAIL DETAIL (MOCK SUPPORT)
// ============================================================================
export const getEmailDetail = async (id: string) => {
  if (USE_MOCK_DATA) {
    const detail = MOCK_DETAILS[id] || MOCK_DETAILS['email-1']; // Fallback
    return { success: true, email: detail.email };
  }
  
  const response = await fetch(apiUrl(`/api/emails/${id}`));
  return await response.json();
};

export const getEmailAttachments = async (id: string) => {
   if (USE_MOCK_DATA) {
    const detail = MOCK_DETAILS[id] || MOCK_DETAILS['email-1'];
    return { success: true, attachments: detail.attachments };
  }

  const response = await fetch(apiUrl(`/api/emails/${id}/attachments`));
  return await response.json();
}

export const deleteEmail = async (id: string) => {
  if (USE_MOCK_DATA) {
    return { success: true };
  }
  
  const response = await fetch(apiUrl(`/api/emails/${id}`), { method: 'DELETE' });
  return await response.json();
}

// 保存邮箱信息到本地存储
export const saveMailboxToLocalStorage = (mailbox: Mailbox) => {
  localStorage.setItem('tempMailbox', JSON.stringify({
    ...mailbox,
    savedAt: Date.now() / 1000
  }));
};

// 从本地存储获取邮箱信息
export const getMailboxFromLocalStorage = (): Mailbox | null => {
  const savedMailbox = localStorage.getItem('tempMailbox');
  if (!savedMailbox) return null;
  
  try {
    const mailbox = JSON.parse(savedMailbox) as Mailbox & { savedAt: number };
    const now = Date.now() / 1000;

    // 兼容历史数据：旧版本可能只保存本地部分（不含域名）
    if (!mailbox.address || !mailbox.address.includes('@')) {
      localStorage.removeItem('tempMailbox');
      return null;
    }
    
    // 检查邮箱是否过期
    if (mailbox.expiresAt < now) {
      localStorage.removeItem('tempMailbox');
      return null;
    }
    
    return mailbox;
  } catch (error) {
    localStorage.removeItem('tempMailbox');
    return null;
  }
};

// 从本地存储删除邮箱信息
export const removeMailboxFromLocalStorage = () => {
  localStorage.removeItem('tempMailbox');
}; 
