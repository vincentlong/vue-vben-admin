import {
  VBEN_DOC_URL,
  VBEN_ELE_PREVIEW_URL,
  VBEN_GITHUB_URL,
} from '@vben/constants';

const env = import.meta.env;

export const appConfig = {
  defaultHomePath: '/dashboard/workspace',
  features: {
    showDocumentEntry: true,
    showGithubEntry: true,
    showNotificationEntry: true,
  },
  externalLinks: {
    doc: env.VITE_APP_DOC_URL || VBEN_DOC_URL,
    github: env.VITE_APP_GITHUB_URL || VBEN_GITHUB_URL,
    preview: env.VITE_APP_PREVIEW_URL || VBEN_ELE_PREVIEW_URL,
  },
};
