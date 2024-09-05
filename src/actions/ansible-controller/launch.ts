import { createTemplateAction } from '@backstage/plugin-scaffolder-node';
import { DiscoveryApi } from '@backstage/core-plugin-api';
import { fetch } from 'cross-fetch';
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
export function createAnsibleControllerJobTemplateLaunchAction(options: {
  discovery: DiscoveryApi;
  config: RootConfigService
}) {
  // For more information on how to define custom actions, see
  //   https://backstage.io/docs/features/software-templates/writing-custom-actions
  return createTemplateAction<{
    controller: string;
    job_template: string;
    extra_vars: any;
  }>({
    id: 'ansible-controller:job_template:launch',
    description: 'execute job template in ansible controller',
    schema: {
      input: {
        type: 'object',
        required: ['controller','job_template'],
        properties: {
          controller: {
            title: 'controller',
            description: 'especify controller usage to be run',
            type: 'string',
          },
          job_template: {
            title: 'job_template name',
            description: 'job_template to be run',
            type: 'string',
          },
          extra_vars: {
            title: 'extra_vars',
            description: 'extra_vars pass to job_template',
            type: 'object'
          }
        },
      },
    },
    async handler(ctx) {

      let configData = options.config.getConfigArray('integrations.ansible-controller');
      let controllerData = configData.filter(config => config.get("name") == ctx.input.controller);

      if (controllerData.length ==0)
      throw new Error(`controller ${ctx.input.controller} has not found in integrations.ansible-controller entry in app-config`);

      let username = controllerData[0].getString("username");
      let password = controllerData[0].getString("password");
      let controllerUrl = controllerData[0].getString("url");


      async function fetchWithBasicAuth(url, method = 'GET', body = null, raw = false) {
        const headers = {
          'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
          'Content-Type': 'application/json',
        };

        let options: any = {
          method,
          headers,
        };

        if (body) {
          options.body = JSON.stringify(body);
        }

        try {
          const response = await fetch(url, options);
          if (!raw)
            return await response.json();
          else
            return await response.text();

        } catch (error) {
          console.error('Erro ao fazer requisição:', error);
          throw new Error(`Erro ao fazer requisição ${error}`);
        }
      }

      async function getJobTemplateId(templateName) {
        const url = `${controllerUrl}/api/v2/job_templates/?name=${templateName}`;
        const data = await fetchWithBasicAuth(url);

        if (data && data.results && data.results.length > 0) {
          return data.results[0].id;
        } else {
          ctx.logger.error('Template not found');
          // assim faz o resolve, ver como fazer o reject
          throw new Error('Template not found');
          return;
        }
      }

      async function launchJobTemplate(templateId, extraVars = {}) {
        const url = `${controllerUrl}/api/v2/job_templates/${templateId}/launch/`;
        let body: any = {
          extra_vars: extraVars,
        };

        const data = await fetchWithBasicAuth(url, 'POST', body);
        return data;
      }

      async function getJobStatus(jobId) {
        const url = `${controllerUrl}/api/v2/jobs/${jobId}/`;
        const data = await fetchWithBasicAuth(url);
        return data;
      }

      async function getJobOutput(jobId) {
        const url = `${controllerUrl}/api/v2/jobs/${jobId}/stdout/?format=txt`;
        const response = await fetchWithBasicAuth(url, 'GET', null, true);
        return response;
      }

      const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

      async function main() {
        const jobTemplateName = ctx.input.job_template;
        const extraVars = ctx.input.extra_vars;

        // 1. Buscar o ID do template pelo nome
        const templateId = await getJobTemplateId(jobTemplateName);
        if (!templateId) return;

        ctx.logger.info(`templateId: ${templateId}`);

        // 2. Executar o job template
        const jobLaunchResponse = await launchJobTemplate(templateId, extraVars);
        if (jobLaunchResponse && jobLaunchResponse.job) {
          const jobId = jobLaunchResponse.job;
          ctx.logger.info(`jobId: ${jobId}`);

          // 3. Verificar o status do job
          let jobStatus = await getJobStatus(jobId);
          ctx.logger.info(`Job Status: ${jobStatus.status}`);
          let fail_status = ["failed", "error", "canceled", "missing"];
          let break_status = ["successful", ...fail_status];

          let out = '';

          do {
            await delay(1000);
            const jobOutput = await getJobOutput(jobId);
            let linhas = jobOutput.substr(out.length).split('\n')
            for (let linha in linhas) ctx.logger.info(linhas[linha]);
            out = jobOutput;
            jobStatus = await getJobStatus(jobId);
          } while (!break_status.includes(jobStatus.status.toLowerCase()))

          const jobOutput = await getJobOutput(jobId);
          let linhas = jobOutput.substr(out.length).split('\n')
          for (let linha in linhas) ctx.logger.info(linhas[linha]);
          out = jobOutput;

          ctx.output('job',jobStatus);

          if (fail_status.includes(jobStatus.status.toLowerCase())) {
            throw new Error('playbook execution fail.');
          }
          
          return;
        } else {
          ctx.logger.error('Erro ao iniciar o job:', jobLaunchResponse);
          throw new Error('Erro ao iniciar o job');
        }
      }


      await main();
    },
  });
}
