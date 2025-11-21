import { pathnames } from 'routes';

import { clearCache } from 'api/_requestor';
import history from 'utils/service/history';

const redirectToLoginPage = async (optional = false, apiPath?: string) => {
  try {
    if (optional) return;
    console.warn('401', apiPath);

    let url: string | undefined = history
      ? history.location.pathname +
        history.location.search +
        history.location.hash
      : undefined;

    if (url?.startsWith('/app')) {
      url = url.replace('/app', '');
    }

    url = url === '/' ? undefined : url;

    // Clear all auth related cache
    clearCache();

    const injectedLogout = window.gaila.injectedLogout;
    if (injectedLogout) {
      injectedLogout(pathnames.login(url));
    }
  } catch (e) {
    console.error(e);
    // @ts-expect-error assigning window.location
    window.location = `${window.location.origin}${pathnames.login(
      window.location.pathname,
    )}`;
  }
};

export default redirectToLoginPage;
