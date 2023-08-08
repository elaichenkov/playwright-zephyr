import type { ZephyrOptions } from './convert-status';

export function validateOptions(options: ZephyrOptions) {
  if (!options.projectKey) throw new Error('"projectKey" option is missed in the config');
  if (!options.authorizationToken) throw new Error('"authorizationToken" option is missed in the config');

  return options;
}
