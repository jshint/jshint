#!/bin/sh
# usage (run from any directory) :
#   env/jsc.sh /path/to/script.js
# or with jshint options:
#   env/jsc.sh /path/to/script.js "{option1:true,option2:false,option3:25}"

alias jsc="/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Resources/jsc"
FILE="${1}"
OPTS="${2}"
ENV_HOME="$( cd "$( dirname "$0" )" && pwd )"

LINT_RESULT="$(jsc ${ENV_HOME}/jsc.js -- ${ENV_HOME} ${FILE} "$(cat ${FILE})" "${OPTS}")"
ERRORS=$(echo ${LINT_RESULT} | egrep [^\s] -c)

if [[ ${ERRORS} -ne 0 ]]; then
	echo "[jshint] Error(s) in ${FILE}:"
	printf "%s\n" "${LINT_RESULT}"
else
	echo "[jshint] ${FILE} passed!"
fi

exit $((0 + ${ERRORS}))