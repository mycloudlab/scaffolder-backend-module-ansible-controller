# @mycloudlab/scaffolder-backend-module-ansible-controller

Plugin used to integrate ansible with backstage.

This plugin allows the execution of an ansible job-template from an action in the template step.

## install on RHDH

Check integrity version using command:
```bash
# please change <version> to especific version
curl -sL https://registry.npmjs.org/@mycloudlab/scaffolder-backend-module-ansible-controller/<version> | jq '.dist.integrity' -r
```

```yaml
# add entry dynamic-plugins-rhdh config map
# please change <version> to especific version
    plugins:
      - package: '@mycloudlab/scaffolder-backend-module-ansible-controller@<version>'
        integrity: '<integrity of before command>'
        disabled: false   
```

## how to use

Configure your `app-config.yaml` with this entry.

```yaml
# app-config.yaml

...

integrations:
  ansible-controller:
    - name: my-controller
      url: https://aap.host.com
      username: username
      password: password
```

Configure your template call to ansible:

```yaml
# your template
  steps:
    - id: call-ansible
      name: Calling ansible to launch
      action: ansible-controller:job_template:launch
      input:
        controller: my-controller
        job_template: Demo Job Template
        extra_vars:
          execution_count: ${{ parameters.execution_count }}
          fail_execution: ${{ parameters.fail_execution }}
```

