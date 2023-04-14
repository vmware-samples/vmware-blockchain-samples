{{/*
Determine the options to use if maintenance mode is enabled, e.g.
{{ include "maintenance.mode.command" }}
*/}}
{{- define "maintenancemode.command" -}}
{{- if .Values.global.maintenanceModeEnabled }}
command: ["sleep", "infinity"]
{{- end -}}
{{- end -}}

{{- define "concord.command" -}}
  {{- include "maintenancemode.command" . }}
{{- end -}}

{{- define "clientservice.command" -}}
  {{- include "maintenancemode.command" . }}
{{- end -}}
