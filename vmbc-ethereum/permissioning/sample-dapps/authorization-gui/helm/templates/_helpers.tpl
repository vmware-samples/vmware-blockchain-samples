{{/*
Return the service & deployment port link
*/}}
{{- define "common.serviceDeploymentPort" -}}
{{- 3000 -}}
{{- end -}}

{{/*
Return the proper image name from the info provided in .Values.global.imageCredentials & .Values.global.image
*/}}
{{- define "common.image" -}}
{{- $registryName := required "registry field is mandatory" .Values.global.imageCredentials.registry -}}
{{- $repositoryName := .Values.global.image.repository -}}
{{- $tag := required "tag field is mandatory" .Values.global.image.tag | toString -}}
{{- printf "%s/%s:%s" $registryName $repositoryName $tag -}}
{{- end -}}

{{/*
Create an imagePullSecret from the info provided in .Values.imageCredentials
Create the dockerconfigjson entry. Need to go through these hoops because the password may contain single/double quotes
which cause problems for Helm with the usual approach described here:
https://helm.sh/docs/howto/charts_tips_and_tricks/#creating-image-pull-secrets
Usage: include "common.docker.config.json" ( dict "imageCredentials" .Values.global.imageCredentials)
*/}}
{{- define "common.docker.config.json" }}
{{- $registry := required "registry field is mandatory" .imageCredentials.registry }}
{{- $username := required "username field is mandatory" .imageCredentials.username }}
{{- $password := required "password field is mandatory" .imageCredentials.password }}
{{- $email := .imageCredentials.email }}
{{- $encodedAuth := printf "%s:%s" $username $password | b64enc }}
{{- $escapedPassword := $password | replace `"` `\"` }}
{{- $dockerConfigJson := printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"auth\":\"%s\"}}}" $registry $username $escapedPassword $email $encodedAuth | b64enc }}
{{- print $dockerConfigJson }}
{{- end }}