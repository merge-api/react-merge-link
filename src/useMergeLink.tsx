import { useCallback, useEffect, useState } from 'react';
import useScript from 'react-script-hook';
import { UseMergeLinkProps, UseMergeLinkResponse } from './types';

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
    !isServer && !!window.MergeLink && !loading && !error;

  useEffect(() => {
    if (isReadyForInitialization && window.MergeLink && config.linkToken) {
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
