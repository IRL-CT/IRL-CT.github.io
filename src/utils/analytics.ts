// Google Analytics utilities for tracking events
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views (automatically handled by gtag config)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', import.meta.env.PUBLIC_GOOGLE_ANALYTICS_ID, {
      page_location: url,
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Research lab specific tracking functions
export const trackProjectView = (projectId: string, projectTitle: string) => {
  trackEvent('view_project', 'projects', `${projectId}: ${projectTitle}`);
};

export const trackPublicationView = (publicationId: string, publicationTitle: string) => {
  trackEvent('view_publication', 'publications', `${publicationId}: ${publicationTitle}`);
};

export const trackTeamMemberView = (memberId: string, memberName: string) => {
  trackEvent('view_team_member', 'team', `${memberId}: ${memberName}`);
};

export const trackExternalLink = (url: string, linkText?: string) => {
  trackEvent('click_external_link', 'outbound', linkText || url);
};

export const trackFileDownload = (fileName: string, fileType: string) => {
  trackEvent('download', 'files', `${fileType}: ${fileName}`);
};

export const trackSearch = (searchTerm: string, resultCount?: number) => {
  trackEvent('search', 'site_search', searchTerm, resultCount);
}; 