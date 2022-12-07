{{/*
Expand the name of the chart.
*/}}
{{- define "..name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "..fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "..chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "..labels" -}}
helm.sh/chart: {{ include "..chart" . }}
{{ include "..selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "..selectorLabels" -}}
app.kubernetes.io/name: {{ include "..name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}} {{- define "..serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "..fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create a jwt secret or get it if it already exists
*/}}
{{- define "..jwt-secret" }}
  {{- $secretObj := (lookup "v1" "Secret" .Release.Namespace "jwt-secret") | default dict }}
  {{- $secretData := (get $secretObj "data") | default dict }}
  {{- $jwtSecret := (get $secretData "jwt-secret") | default (randAlphaNum 32 | b64enc) }}
  jwt-secret: {{ $jwtSecret | b64enc | quote }}
{{- end }}

{{/*
Create a secret or get it if it already exists
*/}}
{{- define "..secret" }}
  {{- $supersecretObj := (lookup "v1" "Secret" .Release.Namespace "secret") | default dict }}
  {{- $supersecretData := (get $supersecretObj "data") | default dict }}
  {{- $superSecret := (get $supersecretData "secret") | default (randAlphaNum 32 | b64enc) }}
  secret: {{ $superSecret | b64enc | quote }}
{{- end }}
