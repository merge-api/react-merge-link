import { useCallback, useEffect, useState, useMemo } from 'react';
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
  'https://api-develop.merge.dev':
    'https://develop-cdn.merge.dev/initialize.js',
};

const isLinkTokenDefined = (
  config: UseMergeLinkProps
): config is InitializeProps => config?.linkToken !== undefined;

export const useMergeLink = ({
  shouldSendTokenOnSuccessfulLink = true,
  ...config
}: UseMergeLinkProps): UseMergeLinkResponse => {
  const scriptSrc = useMemo(() => 
    config?.tenantConfig?.apiBaseURL != null
      ? BASE_URL_TO_CDN_MAP[config.tenantConfig.apiBaseURL] || DEFAULT_CDN_URL
      : DEFAULT_CDN_URL,
    [config?.tenantConfig?.apiBaseURL]
  );

  const [loading, error] = useScript({
    src: scriptSrc,
    checkForExisting: true,
  });
  const [isReady, setIsReady] = useState(false);
  const isServer = typeof window === 'undefined';
  
  const isReadyForInitialization = useMemo(() =>
    !isServer &&
    !!window.MergeLink &&
    !loading &&
    !error &&
    isLinkTokenDefined(config),
    [isServer, loading, error, config?.linkToken]
  );

  const memoizedConfig = useMemo(() => {
    if (!isLinkTokenDefined(config)) {
      return null;
    }
    return {
      ...config,
      shouldSendTokenOnSuccessfulLink,
      onReady: () => setIsReady(true),
    };
  }, [
    config?.linkToken,
    config?.tenantConfig?.apiBaseURL,
    config?.onValidationError,
    config?.onSuccess,
    config?.onExit,
    config?.filePickerConfig,
    config?.parentContainerID,
    shouldSendTokenOnSuccessfulLink
  ]);

  useEffect(() => {
    if (
      isReadyForInitialization &&
      window.MergeLink &&
      memoizedConfig
    ) {
      window.MergeLink.initialize(memoizedConfig);
    }
  }, [isReadyForInitialization, memoizedConfig]);

  const open = useCallback(() => {
    if (window.MergeLink) {
      window.MergeLink.openLink(config);
    }
  }, [
    config?.linkToken,
    config?.tenantConfig?.apiBaseURL,
    config?.onValidationError,
    config?.onSuccess,
    config?.onExit,
    config?.filePickerConfig,
    config?.parentContainerID
  ]);

  return { open, isReady, error };
};
