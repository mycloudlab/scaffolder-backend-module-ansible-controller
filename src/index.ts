/***/
/**
 * The ansible-controller module for @backstage/plugin-scaffolder-backend.
 *
 * @packageDocumentation
 */

export * from './actions';

import { BackendDynamicPluginInstaller } from '@backstage/backend-dynamic-feature-service';
import {
  coreServices,
  createBackendModule,
} from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint } from '@backstage/plugin-scaffolder-node/alpha';
import { createAnsibleControllerJobTemplateLaunchAction } from './actions';


export const dynamicPluginInstaller: BackendDynamicPluginInstaller = {
  kind: 'new',
  install: createBackendModule({
    moduleId: 'ansible-controller',
    pluginId: 'scaffolder',
    register(env) {
      env.registerInit({
        deps: {
          scaffolder: scaffolderActionsExtensionPoint,
          discovery: coreServices.discovery,
          config: coreServices.rootConfig
        },
        async init({ scaffolder, discovery,config }) {
          scaffolder.addActions(createAnsibleControllerJobTemplateLaunchAction({ discovery ,config}));
        },
      });
    },
  }),
};

