{{/*
Return the proper image name, e.g.
{{ include "common.images.image" ( dict "imageRoot" .Values.path.to.the.image "global" $) }}
*/}}
{{- define "common.images.image" -}}
{{- $registryName := .global.imageCredentials.registry -}}
{{- $repositoryName := .imageRoot.repository -}}
{{- $tag := or .imageRoot.tag .global.image.tag | toString -}}
{{- printf "%s/%s:%s" $registryName $repositoryName $tag -}}
{{- end -}}

{{- define "concord.image" -}}
{{ include "common.images.image" (dict "imageRoot" .Values.concord.image "global" .Values.global) }}
{{- end -}}

{{- define "clientservice.image" -}}
{{ include "common.images.image" (dict "imageRoot" .Values.clientservice.image "global" .Values.global) }}
{{- end -}}

{{- define "ethrpc.image" -}}
{{ include "common.images.image" (dict "imageRoot" .Values.ethrpc.image "global" .Values.global) }}
{{- end -}}

{{- define "fluentd.image" -}}
{{ include "common.images.image" (dict "imageRoot" .Values.fluentd.image "global" .Values.global) }}
{{- end -}}

{{/*
Create an imagePullSecret from the info provided in .Values.imageCredentials
Create the dockerconfigjson entry. Need to go through these hoops because the password may contain single/double quotes
which cause problems for Helm with the usual approach described here:
https://helm.sh/docs/howto/charts_tips_and_tricks/#creating-image-pull-secrets
Usage: include "common.docker.config.json" ( dict "imageCredentials" .Values.global.imageCredentials)
*/}}
{{- define "common.docker.config.json" }}
{{- $registry := .imageCredentials.registry }}
{{- $username := .imageCredentials.username }}
{{- $password := .imageCredentials.password }}
{{- $email := .imageCredentials.email }}
{{- $encodedAuth := printf "%s:%s" $username $password | b64enc }}
{{- $escapedPassword := $password | replace `"` `\"` }}
{{- $dockerConfigJson := printf "{\"auths\":{\"%s\":{\"username\":\"%s\",\"password\":\"%s\",\"email\":\"%s\",\"auth\":\"%s\"}}}" $registry $username $escapedPassword $email $encodedAuth | b64enc }}
{{- print $dockerConfigJson }}
{{- end }}