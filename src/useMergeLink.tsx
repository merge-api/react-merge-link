import { useCallback, useEffect, useState } from 'react';
import {
  InitializeProps,
  UseMergeLinkProps,
  UseMergeLinkResponse,
} from './types';
import useScript from './hooks/useScript';

const isLinkTokenDefined = (
  config: UseMergeLinkProps
): config is InitializeProps => config?.linkToken !== undefined;

export const useMergeLink = ({
  shouldSendTokenOnSuccessfulLink = true,
  ...config
}: UseMergeLinkProps): UseMergeLinkResponse => {
  const [loading, error] = useScript({
    src: 'https://cdn.merge.dev/initialize.js',
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
