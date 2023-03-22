#!/bin/bash
#set -x
tls_certs_exist="false"
config_override="false"
tls_certs_path="config-local/tls_certs"
if [[ $CONCORD_VOLUME == client* ]]; then
  tls_certs_path="clientservice/tls_certs"
fi
config_override_in_use="true"
tls_certs_backup_path="config-local/.tls_certs.bk"
if [[ $CONCORD_VOLUME == client* ]]; then
  tls_certs_backup_path="clientservice/.tls_certs.bk"
fi
timestamp=$(date +%F_%T)

function backup {
  # Delete an existing backup.
  if [ -d "${CONFIG_DIR}/${tls_certs_backup_path}" ]; then
    rm -rf $CONFIG_DIR/$tls_certs_backup_path
    res=$?
    if [ $res -ne 0 ]; then
      echo "${timestamp}: Failed to delete an old backup."
      exit 1
    fi
  fi
  mv -f $CONFIG_DIR/$tls_certs_path $CONFIG_DIR/$tls_certs_backup_path
  res=$?
  if [ $res -ne 0 ]; then
    echo "${timestamp}: Failed to take a backup."
    exit 1
  fi
  echo "${timestamp}: Successfully took a backup of config files."
}

function copy_tls_certs {
  echo "${timestamp}: Moving tls certs to persistent volume $CONCORD_VOLUME";
  cd /config;
  if [ "${tls_certs_exist}" == "false" ]; then
    if [ ! -d "${CONFIG_DIR}/${tls_certs_path}" ]; then
      echo "${timestamp}: Creating tls_certs directory."
    fi
  else
    echo "${timestamp}: Tls certs exist. Take a backup."
    backup;
  fi
  mkdir -p $CONFIG_DIR/$tls_certs_path;
  if [[ $CONCORD_VOLUME == client* ]]; then
    cp -R /clientservice/tls_certs/* $CONFIG_DIR/$tls_certs_path
  else
    cp -R /concord/config-local/tls_certs/* $CONFIG_DIR/$tls_certs_path
  fi
  res=$?
  if [ $res -ne 0 ]; then
    echo "${timestamp}: Failed to copy config files."
    exit 1
  fi
  echo "${timestamp}: Successfully moved tls certs to persistent volume $CONCORD_VOLUME"
}

# Is config override in use?
if [[ -z "${CONFIG_OVERRIDE}" ]] || [[ "${CONFIG_OVERRIDE}" == "" ]] || [[ "${CONFIG_OVERRIDE}" == " " ]]; then
  config_override_in_use="false"
fi

# Get ConfigOverride
if [[ "${config_override_in_use}" != "false" ]] && [[ "${CONFIG_OVERRIDE}" == "YES" || "${CONFIG_OVERRIDE}" == "Y" ]] || [[ "${CONFIG_OVERRIDE}" == "true" ]]; then
  config_override="true"
fi

# Get ConfigDir, Volume, Encrypted, ConfigEncryptionKey and FluentInUse.
if [ -z "${CONFIG_DIR}" ]; then
  echo "${timestamp}: Configuration Directory parameter is missing."
  exit 1
fi

# Concord persistent volume.
if [ -z "${CONCORD_VOLUME}" ]; then
  echo "${timestamp}: Concord Volume parameter is missing."
  exit 1
fi

# Is tls_certs directory available?
if [ -d "/config/${CONFIG_DIR}/${tls_certs_path}" ]; then
  # Check for cert files under tls certs path.
  echo "${timestamp}: Searching node.cert files under present directory";
  cd /config/${CONFIG_DIR}/${tls_certs_path};
  file_count=`find . -name node.cert -type f -mtime -14 | wc -l`
  echo "${timestamp}: cert file count: $file_count"
  if [ $file_count -gt 0 ]; then
    tls_certs_exist="true"
  fi
fi

# Copy tls certs when override flag is ON, or tls_certs are not available.
if [ "${config_override_in_use}" == "true" ]; then
  echo "${timestamp}: Config override flag is in use."
  if [ "${config_override}" == "true" ]; then
    echo "${timestamp}: Config override is true, override tls certs."
    copy_tls_certs;
  else
    echo "${timestamp}: Config override is false. Nothing to do."
  fi
else
  echo "${timestamp}: Config override flag is not in use."
  if [ "${tls_certs_exist}" == "false" ]; then
    echo "${timestamp}: Tls certs does not exist, so copy them."
    copy_tls_certs;
  else
    echo "${timestamp}: Tls certs exist. Nothing to do."
  fi
fi