import { useCallback, useEffect, useState } from 'react';
import {
  InitializeProps,
  UseMergeLinkProps,
  UseMergeLinkResponse,
} from './types';
import useScript from './hooks/useScript';

// This map will be used to identify any API Base URL's that should map to their own CDN
const DEFAULT_CDN_URL = 'https://cdn.merge.dev/initialize.js';
const BASE_URL_TO_CDN_MAP: Record<string, string> = {
  'https://api.merge.dev': DEFAULT_CDN_URL,
  'https://api-oai-usw2.openaimerge.com':
    'https://cdn.openaimerge.com/initialize.js',
  'https://api-oai-euw1.openaimerge.com':
    'https://cdn.openaimerge.com/initialize.js',
  'https://api-oai-apne3.openaimerge.com':
    'https://cdn.openaimerge.com/initialize.js',
  'https://api-oai-apne2.openaimerge.com':
    'https://cdn.openaimerge.com/initialize.js',
  'https://api-oai-apse2.openaimerge.com':
    'https://cdn.openaimerge.com/initialize.js',
  'https://api-develop.merge.dev':
    'https://develop-cdn.merge.dev/initialize.js',
  'https://api-mu-develop.merge.dev':
    'https://mu-develop-cdn.merge.dev/initialize.js',
  'https://api-usw2.dropboxmerge.com':
    'https://cdn.dropboxmerge.com/initialize.js',
};

const isLinkTokenDefined = (
  config: UseMergeLinkProps
): config is InitializeProps => config?.linkToken !== undefined;

export const useMergeLink = ({
  shouldSendTokenOnSuccessfulLink = true,
  ...config
}: UseMergeLinkProps): UseMergeLinkResponse => {
  const scriptSrc =
    config?.tenantConfig?.apiBaseURL != null
      ? BASE_URL_TO_CDN_MAP[config.tenantConfig.apiBaseURL] || DEFAULT_CDN_URL
      : DEFAULT_CDN_URL;

  const [loading, error] = useScript({
    src: scriptSrc,
    checkForExisting: true,
  });
  const [isReady, setIsReady] = useState(false);
  const isServer = typeof window === 'undefined';
  const isReadyForInitialization =
    !isServer &&
    !!window.MergeLink &&
    !loading &&
    !error &&
    isLinkTokenDefined(config);

  useEffect(() => {
    if (
      isReadyForInitialization &&
      window.MergeLink &&
      isLinkTokenDefined(config)
    ) {
      window.MergeLink.initialize({
        ...config,
        shouldSendTokenOnSuccessfulLink,
        onReady: () => setIsReady(true),
      });
    }
  }, [isReadyForInitialization, config]);

  const open = useCallback(() => {
    if (window.MergeLink) {
      window.MergeLink.openLink(config);
    }
  }, [config]);

  return { open, isReady, error };
};
