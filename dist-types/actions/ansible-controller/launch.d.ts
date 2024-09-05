import { DiscoveryApi } from '@backstage/core-plugin-api';
import { RootConfigService } from '@backstage/backend-plugin-api';
/**
 * Creates an `ansible-controller:job_template:launch` Scaffolder action.
 *
 * @remarks
 *
 * See {@link https://example.com} for more information.
 *
 * @public
 */
export declare function createAnsibleControllerJobTemplateLaunchAction(options: {
    discovery: DiscoveryApi;
    config: RootConfigService;
}): import("@backstage/plugin-scaffolder-node").TemplateAction<{
    controller: string;
    job_template: string;
    extra_vars: any;
}, import("@backstage/types").JsonObject>;
