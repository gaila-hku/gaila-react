import Config from 'config';

export const storeConfig = {
  key: `${Config.apiDomain}|gaila|store`,
  version: parseInt(Config.cacheNumber || '0', 10) + 2,
};

export const getLocalKey = (key: string) => {
  return `${storeConfig.key}_${storeConfig.version}_${key}`;
};
