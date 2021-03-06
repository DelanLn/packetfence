#!/bin/bash
set -o nounset -o pipefail -o errexit

# Script to run 'test' stage of pipeline

log_section() {
   printf '=%.0s' {1..72} ; printf "\n"
   printf "=\t%s\n" "" "$@" ""
}

log_subsection() {
   printf "=\t%s\n" "" "$@" ""
}

delete_dir_if_exists() {
    local dir=${1}
    if [ -d "${dir}" ]; then
        rm -r ${dir}
        echo "Directory ${dir} removed"
    else
        echo "No ${dir} directory to remove"
    fi
}

configure_and_check() {
    log_section "Configure and check"
    ANSIBLE_STDOUT_CALLBACK=${ANSIBLE_STDOUT_CALLBACK:-yaml}
    VAGRANT_FORCE_COLOR=${VAGRANT_FORCE_COLOR:-true}
    VAGRANT_ANSIBLE_VERBOSE=${VAGRANT_ANSIBLE_VERBOSE:-false}
    VAGRANT_DIR=${VAGRANT_DIR:-'../../../addons/vagrant'}
    VAGRANT_UP_OPTS=${VAGRANT_UP_OPTS:-'--destroy-on-error --no-parallel'}
    CI_COMMIT_TAG=${CI_COMMIT_TAG:-}
    # set to yes when testing new features on collections
    LOCAL_COLLECTIONS=${LOCAL_COLLECTIONS:-no}    
    PF_VM_NAME=${PF_VM_NAME:-}
    INT_TEST_VM_NAMES=${INT_TEST_VM_NAMES:-}


    # Tests
    PERL_UNIT_TESTS=${PERL_UNIT_TESTS:-}
    GOLANG_UNIT_TESTS=${GOLANG_UNIT_TESTS:-}
    INTEGRATION_TESTS=${INTEGRATION_TESTS:-}
    RUN_TESTS=${RUN_TESTS:-no}
    if [ "$PERL_UNIT_TESTS" = "yes" ]; then
        RUN_TESTS=${PERL_UNIT_TESTS}
    fi
    if [ "$GOLANG_UNIT_TESTS" = "yes" ]; then
        RUN_TESTS=${GOLANG_UNIT_TESTS}
    fi
    if [ "$INTEGRATION_TESTS" = "yes" ]; then
        RUN_TESTS=${INTEGRATION_TESTS}
    fi
    
    declare -p VAGRANT_DIR VAGRANT_ANSIBLE_VERBOSE
    declare -p CI_COMMIT_TAG
    declare -p LOCAL_COLLECTIONS
    declare -p PF_VM_NAME INT_TEST_VM_NAMES
}

install_ansible_files() {
    log_subsection "Install Ansible collections"
    if [ "$LOCAL_COLLECTIONS" = "no" ]; then
        ansible-galaxy collection install -r ${VAGRANT_DIR}/requirements.yml -p ${VAGRANT_DIR}/collections
    else
        echo "Using local collections"
    fi
}

start_and_provision() {
    local vm_names=${@:-vmname}
    log_subsection "Start and provision $vm_names"

    ( cd ${VAGRANT_DIR} ; \
      # always use latest boxes version
      vagrant box update ${vm_names} ; \
      vagrant up ${vm_names} ${VAGRANT_UP_OPTS} )
}

teardown() {
    log_section "Teardown"
    delete_ansible_files
    halt_and_destroy ${PF_VM_NAME} ${INT_TEST_VM_NAMES}
}

delete_ansible_files() {
    log_subsection "Remove Ansible files"
    delete_dir_if_exists ${VAGRANT_DIR}/roles
    delete_dir_if_exists ${VAGRANT_DIR}/collections
}

halt_and_destroy() {
    log_subsection "Halt and destroy virtual machine(s)"
    local vm_names=${@:-}

    # using "|| true" as a workaround to unusual behavior
    # see https://github.com/hashicorp/vagrant/issues/10024#issuecomment-404965057
    if [ -z "${vm_names}" ]; then
        echo "Shutdown and destroy all VM"
        ( cd $VAGRANT_DIR ; \
          vagrant halt ; \
          vagrant destroy -f || true )
        delete_dir_if_exists ${VAGRANT_DIR}/.vagrant
    else
        ( cd $VAGRANT_DIR ; \
          vagrant halt ${vm_names} ; \
          vagrant destroy -f ${vm_names} || true )
        for vm in ${vm_names}; do
            delete_dir_if_exists ${VAGRANT_DIR}/.vagrant/machines/${vm}
        done
    fi
}

run() {
    log_section "Tests"
    declare -p RUN_TESTS
    declare -p PERL_UNIT_TESTS GOLANG_UNIT_TESTS
    declare -p INTEGRATION_TESTS    
    if [ "$RUN_TESTS" = "yes" ]; then
        install_ansible_files
        start_and_provision ${PF_VM_NAME}
        if [ "$PERL_UNIT_TESTS" = "yes" ] || [ "$GOLANG_UNIT_TESTS" = "yes" ]; then
            run_shell_provisioner ${PF_VM_NAME} run-unit-tests
        fi
        if [ "$INTEGRATION_TESTS" = "yes" ]; then
           start_and_provision ${INT_TEST_VM_NAMES}
           run_shell_provisioner ${PF_VM_NAME} run-integration-tests
        fi
    else
        echo "No tests to run"
    fi
}

run_shell_provisioner() {
    local vm_name=${1:-vmname}
    local provisioner_name=${2:-fooprov}
    log_subsection "Run shell provisionner ${provisioner_name}"
    ( cd $VAGRANT_DIR ; \
      vagrant provision $vm_name --provision-with="${provisioner_name}" )
}

configure_and_check

case $1 in
    run) run ;;
    teardown) teardown ;;
    *)   die "Wrong argument"
esac
