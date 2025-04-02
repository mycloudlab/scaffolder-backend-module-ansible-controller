/***/
/**
 * The ansible-controller module for @backstage/plugin-scaffolder-backend.
 *
 * @packageDocumentation
 */

export * from './actions';
import { createBackendModule,coreServices } from '@backstage/backend-plugin-api';
import { scaffolderActionsExtensionPoint  } from '@backstage/plugin-scaffolder-node/alpha';
import { createAnsibleControllerJobTemplateLaunchAction } from "./actions/ansible-controller/launch";

/**
 * A backend module that registers the action into the scaffolder
 */
export const scaffolderModule = createBackendModule({
  moduleId: 'ansible-controller',
  pluginId: 'scaffolder',
  register({ registerInit }) {
    registerInit({
      deps: {
        scaffolderActions: scaffolderActionsExtensionPoint,
        discovery: coreServices.discovery,
        config: coreServices.rootConfig
      },
      async init({ scaffolderActions,discovery,config}) {
        scaffolderActions.addActions(createAnsibleControllerJobTemplateLaunchAction( {discovery, config}));
      }
    });
  },
})

export default scaffolderModule;